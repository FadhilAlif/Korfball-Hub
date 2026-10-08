import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { NeonAuthGuard } from './guards/neon-auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';
import { User } from '../users/entities/user.entity.js';
import { Athlete } from '../athletes/entities/athlete.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([User, Athlete])],
  controllers: [AuthController],
  providers: [AuthService, NeonAuthGuard, RolesGuard],
  exports: [AuthService, NeonAuthGuard, RolesGuard],
})
export class AuthModule {}
