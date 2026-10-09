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
import { UserStatus, UserRole } from '../../../common/enums/index.js';

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

      // 1. Check development/demo token per role
      if (token === 'demo-manager-jwt-token') {
        const demoUser = await this.userRepository.findOne({
          where: { role: UserRole.MANAGER },
        });
        if (demoUser) {
          request.user = demoUser;
          return true;
        }
      } else if (token === 'demo-coach-jwt-token') {
        const demoUser = await this.userRepository.findOne({
          where: { role: UserRole.COACH },
        });
        if (demoUser) {
          request.user = demoUser;
          return true;
        }
      } else if (token === 'demo-athlete-jwt-token') {
        const demoUser = await this.userRepository.findOne({
          where: { role: UserRole.ATHLETE },
        });
        if (demoUser) {
          request.user = demoUser;
          return true;
        }
      } else if (token === 'demo-viewer-jwt-token') {
        const demoUser = await this.userRepository.findOne({
          where: { role: UserRole.VIEWER },
        });
        if (demoUser) {
          request.user = demoUser;
          return true;
        }
      } else if (token.startsWith('demo-')) {
        const demoUser = await this.userRepository.findOne({
          where: { role: UserRole.COACH },
        });
        if (demoUser) {
          request.user = demoUser;
          return true;
        }
      }

      // 2. If token is compact JWT (3 parts), verify via JWKS
      if (token.split('.').length === 3 && this.jwks) {
        try {
          const { payload } = await jwtVerify(token, this.jwks);
          email = (payload.email as string) || (payload.sub as string);
        } catch {
          // Fall through to session check
        }
      }

      // 3. Verify Neon Auth session token from database table neon_auth.session
      if (!email) {
        try {
          const sessionRows = await this.userRepository.query(
            `SELECT u.email FROM neon_auth.session s 
             JOIN neon_auth.user u ON s."userId" = u.id 
             WHERE s.token = $1 AND s."expiresAt" > NOW() 
             LIMIT 1`,
            [token],
          );
          if (sessionRows && sessionRows.length > 0) {
            email = sessionRows[0].email;
          }
        } catch (dbErr) {
          console.error('Session lookup error:', dbErr);
        }
      }

      if (!email) {
        throw new UnauthorizedException('Token autentikasi tidak valid atau telah kedaluwarsa.');
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
