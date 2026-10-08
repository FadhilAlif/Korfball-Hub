import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createRemoteJWKSet, jwtVerify, JWTVerifyGetKey } from 'jose';
import { User } from '../../users/entities/user.entity.js';
import { UserStatus } from '../../../common/enums/index.js';

@Injectable()
export class NeonAuthGuard implements CanActivate {
  private jwks: JWTVerifyGetKey | null = null;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    const jwksUrl = this.configService.get<string>('NEON_AUTH_JWKS_URL');
    if (jwksUrl) {
      try {
        this.jwks = createRemoteJWKSet(new URL(jwksUrl));
      } catch (err) {
        console.error('Failed to initialize JWKS client:', err);
      }
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token autentikasi tidak ditemukan.');
    }

    const token = authHeader.substring(7);

    try {
      let email: string | undefined;

      if (this.jwks) {
        const { payload } = await jwtVerify(token, this.jwks);
        email = (payload.email as string) || (payload.sub as string);
      } else {
        // Fallback for development if JWKS is not set
        throw new UnauthorizedException('JWKS URL tidak terkonfigurasi.');
      }

      if (!email) {
        throw new UnauthorizedException('Payload token tidak valid: email tidak ditemukan.');
      }

      // Query database user
      const user = await this.userRepository.findOne({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        throw new UnauthorizedException(`Pengguna dengan email ${email} belum terdaftar di sistem.`);
      }

      // Business Rule BR-22: User disabled tidak dapat login atau mengakses protected endpoint
      if (user.status === UserStatus.DISABLED) {
        throw new ForbiddenException('Akun Anda telah dinonaktifkan.');
      }

      request.user = user;
      return true;
    } catch (err: any) {
      if (err instanceof UnauthorizedException || err instanceof ForbiddenException) {
        throw err;
      }
      throw new UnauthorizedException(`Verifikasi token gagal: ${err.message || 'Token tidak valid'}`);
    }
  }
}
