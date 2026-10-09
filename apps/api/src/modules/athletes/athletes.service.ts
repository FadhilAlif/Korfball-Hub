import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Athlete } from './entities/athlete.entity.js';
import { Roster } from './entities/roster.entity.js';
import { Team } from '../teams/entities/team.entity.js';
import { Season } from '../teams/entities/season.entity.js';
import { CreateAthleteDto } from './dto/create-athlete.dto.js';
import { UpdateAthleteDto } from './dto/update-athlete.dto.js';
import { AssignRosterDto } from './dto/assign-roster.dto.js';
import { FilterAthleteDto } from './dto/filter-athlete.dto.js';
import { AthleteStatus } from '../../common/enums/index.js';

@Injectable()
export class AthletesService {
  constructor(
    @InjectRepository(Athlete)
    private readonly athleteRepository: Repository<Athlete>,
    @InjectRepository(Roster)
    private readonly rosterRepository: Repository<Roster>,
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(Season)
    private readonly seasonRepository: Repository<Season>,
  ) {}

  private async getDefaultTeamId(): Promise<string> {
    const team = await this.teamRepository.findOne({ where: {} });
    if (!team) {
      throw new NotFoundException('Data tim belum diinisialisasi.');
    }
    return team.id;
  }

  async findAll(query: FilterAthleteDto) {
    const teamId = await this.getDefaultTeamId();
    const { search, gender, status, season_id, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const qb = this.athleteRepository
      .createQueryBuilder('athlete')
      .leftJoinAndSelect('athlete.rosters', 'roster')
      .leftJoinAndSelect('roster.season', 'season')
      .where('athlete.team_id = :teamId', { teamId });

    if (search) {
      qb.andWhere(
        '(LOWER(athlete.full_name) LIKE :search OR LOWER(athlete.player_id) LIKE :search OR LOWER(athlete.display_name) LIKE :search)',
        { search: `%${search.toLowerCase()}%` },
      );
    }

    if (gender) {
      qb.andWhere('athlete.gender = :gender', { gender });
    }

    if (status) {
      qb.andWhere('athlete.status = :status', { status });
    }

    if (season_id) {
      qb.andWhere('roster.season_id = :season_id', { season_id });
    }

    qb.orderBy('athlete.jersey_number', 'ASC')
      .skip(skip)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();

    // Calculate aggregated metrics for the squad
    const totalAthletes = await this.athleteRepository.count({ where: { team_id: teamId } });
    const maleCount = await this.athleteRepository.count({ where: { team_id: teamId, gender: 'MALE' as any } });
    const femaleCount = await this.athleteRepository.count({ where: { team_id: teamId, gender: 'FEMALE' as any } });
    const activeCount = await this.athleteRepository.count({ where: { team_id: teamId, status: AthleteStatus.ACTIVE } });
    const injuredCount = await this.athleteRepository.count({ where: { team_id: teamId, status: AthleteStatus.INJURED } });

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        total: totalAthletes,
        males: maleCount,
        females: femaleCount,
        activeFit: activeCount,
        medicalHold: injuredCount,
      },
    };
  }

  async findOne(id: string): Promise<Athlete> {
    const athlete = await this.athleteRepository.findOne({
      where: { id },
      relations: {
        team: true,
        rosters: {
          season: true,
        },
      },
    });

    if (!athlete) {
      throw new NotFoundException(`Atlet dengan ID ${id} tidak ditemukan.`);
    }

    return athlete;
  }

  async create(createDto: CreateAthleteDto): Promise<Athlete> {
    const teamId = await this.getDefaultTeamId();

    // 1. Generate player_id if not provided (Decision #1 - Option A)
    let playerId = createDto.player_id?.trim();
    if (!playerId) {
      const count = await this.athleteRepository.count({ where: { team_id: teamId } });
      playerId = `KB-${String(count + 1).padStart(2, '0')}`;
      
      // Ensure unique in case of existing collisions
      let exists = await this.athleteRepository.findOne({ where: { team_id: teamId, player_id: playerId } });
      let increment = 1;
      while (exists) {
        playerId = `KB-${String(count + 1 + increment).padStart(2, '0')}`;
        exists = await this.athleteRepository.findOne({ where: { team_id: teamId, player_id: playerId } });
        increment++;
      }
    } else {
      const existing = await this.athleteRepository.findOne({
        where: { team_id: teamId, player_id: playerId },
      });
      if (existing) {
        throw new ConflictException(`ID Atlet '${playerId}' sudah digunakan dalam tim ini.`);
      }
    }

    const athlete = this.athleteRepository.create({
      ...createDto,
      team_id: teamId,
      player_id: playerId,
      join_date: createDto.join_date || new Date().toISOString().split('T')[0],
      status: createDto.status || AthleteStatus.ACTIVE,
    });

    const savedAthlete = await this.athleteRepository.save(athlete);

    // 2. Assign to season roster if season_id provided
    if (createDto.season_id) {
      await this.assignToRoster({
        athlete_id: savedAthlete.id,
        season_id: createDto.season_id,
        jersey_number: createDto.jersey_number,
        is_captain: createDto.is_captain || false,
      });
    }

    return this.findOne(savedAthlete.id);
  }

  async update(id: string, updateDto: UpdateAthleteDto): Promise<Athlete> {
    const athlete = await this.findOne(id);

    // If changing player_id, verify uniqueness
    if (updateDto.player_id && updateDto.player_id !== athlete.player_id) {
      const existing = await this.athleteRepository.findOne({
        where: { team_id: athlete.team_id, player_id: updateDto.player_id },
      });
      if (existing) {
        throw new ConflictException(`ID Atlet '${updateDto.player_id}' sudah digunakan.`);
      }
    }

    Object.assign(athlete, updateDto);
    await this.athleteRepository.save(athlete);
    return this.findOne(id);
  }

  async remove(id: string): Promise<{ message: string }> {
    const athlete = await this.findOne(id);
    athlete.status = AthleteStatus.INACTIVE;
    await this.athleteRepository.save(athlete);
    return { message: `Atlet ${athlete.full_name} berhasil dinonaktifkan.` };
  }

  async assignToRoster(dto: AssignRosterDto): Promise<Roster> {
    const teamId = await this.getDefaultTeamId();
    const { athlete_id, season_id, jersey_number, is_captain = false, status = 'ACTIVE' } = dto;

    // Verify season exists
    const season = await this.seasonRepository.findOne({ where: { id: season_id, team_id: teamId } });
    if (!season) {
      throw new NotFoundException('Musim kompetisi tidak ditemukan.');
    }

    // BR-04: Nomor punggung unik di roster aktif dalam satu musim
    const existingJersey = await this.rosterRepository.findOne({
      where: {
        team_id: teamId,
        season_id,
        jersey_number,
      },
    });

    if (existingJersey && existingJersey.athlete_id !== athlete_id) {
      throw new BadRequestException(
        `Nomor punggung ${jersey_number} sudah digunakan oleh atlet lain pada roster musim ${season.name}.`,
      );
    }

    // BR-05 & Decision #2 (Option A): Auto-replace captain
    if (is_captain) {
      await this.rosterRepository.update(
        { team_id: teamId, season_id, is_captain: true },
        { is_captain: false },
      );
    }

    // Check if athlete already in this roster
    let roster = await this.rosterRepository.findOne({
      where: { team_id: teamId, season_id, athlete_id },
    });

    if (roster) {
      roster.jersey_number = jersey_number;
      roster.is_captain = is_captain;
      roster.status = status;
    } else {
      roster = this.rosterRepository.create({
        team_id: teamId,
        season_id,
        athlete_id,
        jersey_number,
        is_captain,
        status,
      });
    }

    return this.rosterRepository.save(roster);
  }

  async removeFromRoster(rosterId: string): Promise<{ message: string }> {
    const roster = await this.rosterRepository.findOne({ where: { id: rosterId } });
    if (!roster) {
      throw new NotFoundException('Roster entry tidak ditemukan.');
    }
    await this.rosterRepository.remove(roster);
    return { message: 'Atlet berhasil dikeluarkan dari roster musim ini.' };
  }

  async setCaptain(rosterId: string): Promise<Roster> {
    const roster = await this.rosterRepository.findOne({ where: { id: rosterId } });
    if (!roster) {
      throw new NotFoundException('Roster entry tidak ditemukan.');
    }

    // Decision #2 (Option A): Auto-replace captain
    await this.rosterRepository.update(
      { team_id: roster.team_id, season_id: roster.season_id, is_captain: true },
      { is_captain: false },
    );

    roster.is_captain = true;
    return this.rosterRepository.save(roster);
  }
}
