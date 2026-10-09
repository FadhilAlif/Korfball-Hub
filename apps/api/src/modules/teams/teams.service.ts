import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity.js';
import { Season } from './entities/season.entity.js';
import { UpdateTeamDto } from './dto/update-team.dto.js';
import { CreateSeasonDto } from './dto/create-season.dto.js';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(Season)
    private readonly seasonRepository: Repository<Season>,
  ) {}

  async getTeam(): Promise<Team> {
    const team = await this.teamRepository.findOne({
      where: {},
      relations: {
        seasons: true,
      },
      order: {
        created_at: 'ASC',
      },
    });

    if (!team) {
      throw new NotFoundException('Data tim belum diinisialisasi.');
    }

    return team;
  }

  async updateTeam(id: string, updateDto: UpdateTeamDto): Promise<Team> {
    const team = await this.teamRepository.findOne({ where: { id } });
    if (!team) {
      throw new NotFoundException('Tim tidak ditemukan.');
    }

    Object.assign(team, updateDto);
    return this.teamRepository.save(team);
  }

  async getSeasons(teamId: string): Promise<Season[]> {
    return this.seasonRepository.find({
      where: { team_id: teamId },
      order: { start_date: 'DESC' },
    });
  }

  async createSeason(teamId: string, createDto: CreateSeasonDto): Promise<Season> {
    if (new Date(createDto.end_date) <= new Date(createDto.start_date)) {
      throw new BadRequestException('Tanggal selesai musim harus lebih besar dari tanggal mulai.');
    }

    // If marked active, deactivate other seasons for this team
    if (createDto.is_active) {
      await this.seasonRepository.update({ team_id: teamId }, { is_active: false });
    }

    const season = this.seasonRepository.create({
      ...createDto,
      team_id: teamId,
    });

    return this.seasonRepository.save(season);
  }

  async setActiveSeason(teamId: string, seasonId: string): Promise<Season> {
    const season = await this.seasonRepository.findOne({
      where: { id: seasonId, team_id: teamId },
    });

    if (!season) {
      throw new NotFoundException('Musim kompetisi tidak ditemukan.');
    }

    // Set all other seasons to inactive
    await this.seasonRepository.update({ team_id: teamId }, { is_active: false });

    season.is_active = true;
    return this.seasonRepository.save(season);
  }
}
