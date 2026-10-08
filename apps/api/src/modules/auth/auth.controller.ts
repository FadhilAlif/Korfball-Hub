import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { NeonAuthGuard } from './guards/neon-auth.guard.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { User } from '../users/entities/user.entity.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @UseGuards(NeonAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mendapatkan data profil user yang sedang login' })
  @ApiResponse({
    status: 200,
    description: 'Profil pengguna berhasil diambil',
    schema: {
      example: {
        success: true,
        data: {
          user: {
            id: 'uuid',
            email: 'manager@korfballbantul.com',
            full_name: 'Fadhil Manager',
            role: 'MANAGER',
            status: 'ACTIVE',
          },
          athlete: null,
        },
        message: 'Operasi berhasil',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Token tidak ditemukan atau tidak valid',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Akun pengguna dinonaktifkan',
  })
  async getMe(@CurrentUser() user: User) {
    return this.authService.getProfile(user.id);
  }
}
