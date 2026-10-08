import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity.js';
import { Athlete } from '../athletes/entities/athlete.entity.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Athlete)
    private readonly athleteRepository: Repository<Athlete>,
  ) {}

  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Pengguna tidak ditemukan.');
    }

    let athleteProfile: Athlete | null = null;
    if (user.athlete_id) {
      athleteProfile = await this.athleteRepository.findOne({
        where: { id: user.athlete_id },
        relations: { team: true },
      });
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        status: user.status,
      },
      athlete: athleteProfile,
    };
  }
}
