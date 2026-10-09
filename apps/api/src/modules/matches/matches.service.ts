import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from './entities/match.entity.js';
import { MatchSquad } from './entities/match-squad.entity.js';
import { MatchEvent } from './entities/match-event.entity.js';
import { Season } from '../teams/entities/season.entity.js';
import { Athlete } from '../athletes/entities/athlete.entity.js';
import { CreateMatchDto } from './dto/create-match.dto.js';
import { UpdateMatchDto } from './dto/update-match.dto.js';
import { AssignMatchSquadDto } from './dto/assign-squad.dto.js';
import { RecordMatchEventDto } from './dto/record-event.dto.js';
import { FinalizeMatchDto } from './dto/finalize-match.dto.js';
import {
  MatchStatus,
  MatchResult,
  SquadStatus,
  MatchEventType,
  Gender,
  AthleteStatus,
} from '../../common/enums/index.js';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private readonly matchRepo: Repository<Match>,
    @InjectRepository(MatchSquad)
    private readonly squadRepo: Repository<MatchSquad>,
    @InjectRepository(MatchEvent)
    private readonly eventRepo: Repository<MatchEvent>,
    @InjectRepository(Season)
    private readonly seasonRepo: Repository<Season>,
    @InjectRepository(Athlete)
    private readonly athleteRepo: Repository<Athlete>,
  ) {}

  /**
   * Hitung kalkulasi hasil pertandingan otomatis di Backend (BR-14)
   */
  private calculateResult(teamScore: number | null, oppScore: number | null): MatchResult | null {
    if (teamScore === null || oppScore === null) return null;
    if (teamScore > oppScore) return MatchResult.WIN;
    if (teamScore < oppScore) return MatchResult.LOSS;
    return MatchResult.DRAW;
  }

  /**
   * Buat jadwal pertandingan baru
   */
  async createMatch(teamId: string, dto: CreateMatchDto): Promise<Match> {
    let seasonId = dto.season_id;
    if (!seasonId) {
      const activeSeason = await this.seasonRepo.findOne({
        where: { team_id: teamId, is_active: true },
      });
      if (!activeSeason) {
        throw new BadRequestException('Musim aktif tidak ditemukan. Harap tentukan season_id.');
      }
      seasonId = activeSeason.id;
    }

    const teamScore = dto.team_score ?? (dto.status === MatchStatus.SCHEDULED ? null : 0);
    const oppScore = dto.opponent_score ?? (dto.status === MatchStatus.SCHEDULED ? null : 0);

    const match = this.matchRepo.create({
      team_id: teamId,
      season_id: seasonId,
      opponent: dto.opponent,
      competition: dto.competition || null,
      match_date: dto.match_date,
      start_time: dto.start_time,
      venue: dto.venue,
      home_away: dto.home_away,
      team_score: teamScore,
      opponent_score: oppScore,
      notes: dto.notes || null,
      status: dto.status || MatchStatus.SCHEDULED,
      result: this.calculateResult(teamScore, oppScore),
    });

    return this.matchRepo.save(match);
  }

  /**
   * Ambil daftar pertandingan dan agregasi rekap skor
   */
  async getMatches(teamId: string, seasonId?: string, status?: MatchStatus) {
    const qb = this.matchRepo
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.season', 'season')
      .leftJoinAndSelect('match.squad', 'squad')
      .leftJoinAndSelect('match.events', 'events')
      .where('match.team_id = :teamId', { teamId });

    if (seasonId) {
      qb.andWhere('match.season_id = :seasonId', { seasonId });
    }

    if (status) {
      qb.andWhere('match.status = :status', { status });
    }

    qb.orderBy('match.match_date', 'DESC').addOrderBy('match.start_time', 'DESC');

    const items = await qb.getMany();

    // Hitung ringkasan performa tim
    const totalMatches = items.length;
    const wins = items.filter((m) => m.result === MatchResult.WIN).length;
    const losses = items.filter((m) => m.result === MatchResult.LOSS).length;
    const draws = items.filter((m) => m.result === MatchResult.DRAW).length;
    const winRate =
      totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

    return {
      items,
      summary: {
        totalMatches,
        wins,
        losses,
        draws,
        winRate,
      },
    };
  }

  /**
   * Ambil detail pertandingan beserta skuad, susunan formasi, dan event gol
   */
  async getMatchById(id: string) {
    const match = await this.matchRepo.findOne({
      where: { id },
      relations: {
        season: true,
        squad: {
          athlete: true,
        },
        events: {
          athlete: true,
        },
      },
      order: {
        events: {
          event_time: 'ASC',
        },
      },
    });

    if (!match) {
      throw new NotFoundException(`Pertandingan dengan ID ${id} tidak ditemukan.`);
    }

    // Evaluasi IKF Paritas 4M & 4F
    const starters = (match.squad || []).filter(
      (s) => s.squad_status === SquadStatus.STARTING,
    );
    const starterMales = starters.filter(
      (s) => s.athlete?.gender === Gender.MALE,
    ).length;
    const starterFemales = starters.filter(
      (s) => s.athlete?.gender === Gender.FEMALE,
    ).length;

    const isIkbCompliant = starterMales === 4 && starterFemales === 4;
    const complianceMessage = isIkbCompliant
      ? 'Formasi Starter Sah sesuai Regulasi IKF (4 Putra & 4 Putri).'
      : `Peringatan Regulasi IKF: Starter saat ini ${starterMales} Putra & ${starterFemales} Putri (Total: ${starters.length}). Standar resmi adalah tepat 4M / 4F.`;

    return {
      ...match,
      ikfCompliance: {
        isCompliant: isIkbCompliant,
        totalStarters: starters.length,
        starterMales,
        starterFemales,
        message: complianceMessage,
      },
    };
  }

  /**
   * Perbarui informasi jadwal atau skor pertandingan
   */
  async updateMatch(id: string, dto: UpdateMatchDto): Promise<Match> {
    const match = await this.matchRepo.findOne({ where: { id } });
    if (!match) {
      throw new NotFoundException(`Pertandingan dengan ID ${id} tidak ditemukan.`);
    }

    if (dto.opponent) match.opponent = dto.opponent;
    if (dto.competition !== undefined) match.competition = dto.competition || null;
    if (dto.match_date) match.match_date = dto.match_date;
    if (dto.start_time) match.start_time = dto.start_time;
    if (dto.venue) match.venue = dto.venue;
    if (dto.home_away) match.home_away = dto.home_away;
    if (dto.notes !== undefined) match.notes = dto.notes || null;
    if (dto.status) match.status = dto.status;

    if (dto.team_score !== undefined) match.team_score = dto.team_score;
    if (dto.opponent_score !== undefined) match.opponent_score = dto.opponent_score;

    match.result = this.calculateResult(match.team_score, match.opponent_score);

    return this.matchRepo.save(match);
  }

  /**
   * Hapus jadwal pertandingan
   */
  async deleteMatch(id: string): Promise<{ message: string }> {
    const match = await this.matchRepo.findOne({ where: { id } });
    if (!match) {
      throw new NotFoundException(`Pertandingan dengan ID ${id} tidak ditemukan.`);
    }

    await this.matchRepo.remove(match);
    return { message: 'Pertandingan berhasil dihapus.' };
  }

  /**
   * Tetapkan susunan skuad pemain (Starter & Cadangan) dengan soft-warning IKF
   */
  async assignSquad(matchId: string, dto: AssignMatchSquadDto) {
    const match = await this.matchRepo.findOne({ where: { id: matchId } });
    if (!match) {
      throw new NotFoundException(`Pertandingan dengan ID ${matchId} tidak ditemukan.`);
    }

    // Periksa status atlet yang kena sanksi (BR-11)
    for (const item of dto.squad) {
      const athlete = await this.athleteRepo.findOne({ where: { id: item.athlete_id } });
      if (athlete && athlete.status === AthleteStatus.SUSPENDED) {
        throw new BadRequestException(
          `Atlet ${athlete.full_name} sedang dalam status SKORSING (SUSPENDED) dan dilarang bertanding (BR-11).`,
        );
      }
    }

    // Bersihkan penugasan lama untuk match ini
    await this.squadRepo.delete({ match_id: matchId });

    // Masukkan skuad baru
    const squadEntities = dto.squad.map((item) =>
      this.squadRepo.create({
        match_id: matchId,
        athlete_id: item.athlete_id,
        squad_status: item.squad_status,
        is_captain: !!item.is_captain,
        notes: item.notes || null,
      }),
    );

    await this.squadRepo.save(squadEntities);
    return this.getMatchById(matchId);
  }

  /**
   * Catat event skor gol atau kartu pertandingan (Live Event Logger)
   */
  async recordEvent(matchId: string, dto: RecordMatchEventDto) {
    const match = await this.matchRepo.findOne({ where: { id: matchId } });
    if (!match) {
      throw new NotFoundException(`Pertandingan dengan ID ${matchId} tidak ditemukan.`);
    }

    // Format catatan dengan shot_type jika dicantumkan (Q3)
    let formattedNotes = dto.notes || '';
    if (dto.shot_type) {
      formattedNotes = `[${dto.shot_type}] ${formattedNotes}`.trim();
    }

    const event = this.eventRepo.create({
      match_id: matchId,
      athlete_id: dto.athlete_id,
      event_type: dto.event_type,
      event_time: dto.event_time,
      notes: formattedNotes || null,
    });

    await this.eventRepo.save(event);

    // Jika event gol, otomatis tambahkan skor tim Korfball Bantul (BR-14)
    if (dto.event_type === MatchEventType.GOAL) {
      match.team_score = (match.team_score || 0) + 1;
      if (match.status === MatchStatus.SCHEDULED) {
        match.status = MatchStatus.LIVE;
      }
      match.result = this.calculateResult(match.team_score, match.opponent_score);
      await this.matchRepo.save(match);
    }

    return this.getMatchById(matchId);
  }

  /**
   * Kunci dan selesaikan pertandingan (BR-14)
   */
  async finalizeMatch(matchId: string, dto: FinalizeMatchDto) {
    const match = await this.matchRepo.findOne({ where: { id: matchId } });
    if (!match) {
      throw new NotFoundException(`Pertandingan dengan ID ${matchId} tidak ditemukan.`);
    }

    match.team_score = dto.team_score;
    match.opponent_score = dto.opponent_score;
    match.status = MatchStatus.COMPLETED;
    match.result = this.calculateResult(dto.team_score, dto.opponent_score);

    await this.matchRepo.save(match);
    return this.getMatchById(matchId);
  }
}
