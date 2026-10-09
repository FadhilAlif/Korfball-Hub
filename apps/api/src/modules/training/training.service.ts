import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { TrainingSession } from './entities/training-session.entity.js';
import { TrainingActivity } from './entities/training-activity.entity.js';
import { TrainingAttendance } from './entities/training-attendance.entity.js';
import { Athlete } from '../athletes/entities/athlete.entity.js';
import { Team } from '../teams/entities/team.entity.js';
import { User } from '../users/entities/user.entity.js';
import {
  CreateTrainingSessionDto,
  CreateActivityDto,
} from './dto/create-session.dto.js';
import { UpdateTrainingSessionDto } from './dto/update-session.dto.js';
import { BulkRecordAttendanceDto } from './dto/record-attendance.dto.js';
import { FilterSessionDto } from './dto/filter-session.dto.js';
import { AttendanceStatus } from '../../common/enums/index.js';

@Injectable()
export class TrainingService {
  constructor(
    @InjectRepository(TrainingSession)
    private readonly sessionRepo: Repository<TrainingSession>,
    @InjectRepository(TrainingActivity)
    private readonly activityRepo: Repository<TrainingActivity>,
    @InjectRepository(TrainingAttendance)
    private readonly attendanceRepo: Repository<TrainingAttendance>,
    @InjectRepository(Athlete)
    private readonly athleteRepo: Repository<Athlete>,
  ) {}

  /**
   * Buat sesi latihan baru dengan drill opsional (BR-06: End > Start)
   */
  async createSession(
    coachId: string,
    teamId: string,
    dto: CreateTrainingSessionDto,
  ): Promise<TrainingSession> {
    if (!teamId || teamId === 'b0000000-0000-0000-0000-000000000001') {
      const defaultTeam = await this.sessionRepo.manager.findOne(Team, { where: {} });
      if (defaultTeam) {
        teamId = defaultTeam.id;
      }
    }

    if (!coachId || coachId === 'd0000000-0000-0000-0000-000000000001') {
      const defaultCoach = await this.sessionRepo.manager.findOne(User, { where: {} });
      if (defaultCoach) {
        coachId = defaultCoach.id;
      }
    }

    const start = new Date(dto.start_datetime);
    const end = new Date(dto.end_datetime);

    if (end <= start) {
      throw new BadRequestException(
        'Waktu selesai harus lebih besar dari waktu mulai (Pelanggaran BR-06).',
      );
    }

    const session = this.sessionRepo.create({
      team_id: teamId,
      coach_id: coachId,
      session_date: dto.session_date,
      start_datetime: start,
      end_datetime: end,
      venue: dto.venue || null,
      objective: dto.objective,
      notes: dto.notes || null,
      status: dto.status,
    });

    if (dto.activities && dto.activities.length > 0) {
      session.activities = dto.activities.map((act) =>
        this.activityRepo.create({
          activity_name: act.activity_name,
          category: act.category,
          duration: act.duration,
          objective: act.objective || null,
          notes: act.notes || null,
          sequence: act.sequence,
        }),
      );
    }

    return this.sessionRepo.save(session);
  }

  /**
   * Ambil daftar sesi latihan dengan pagination & filter
   */
  async getSessions(teamId: string, filters: FilterSessionDto) {
    if (!teamId || teamId === 'b0000000-0000-0000-0000-000000000001') {
      const defaultTeam = await this.sessionRepo.manager.findOne(Team, { where: {} });
      if (defaultTeam) {
        teamId = defaultTeam.id;
      }
    }

    const { status, start_date, end_date, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const qb = this.sessionRepo
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.activities', 'activities')
      .leftJoinAndSelect('session.attendances', 'attendances')
      .where('session.team_id = :teamId', { teamId });

    if (status) {
      qb.andWhere('session.status = :status', { status });
    }

    if (start_date && end_date) {
      qb.andWhere('session.session_date BETWEEN :start_date AND :end_date', {
        start_date,
        end_date,
      });
    } else if (start_date) {
      qb.andWhere('session.session_date >= :start_date', { start_date });
    } else if (end_date) {
      qb.andWhere('session.session_date <= :end_date', { end_date });
    }

    qb.orderBy('session.start_datetime', 'DESC')
      .skip(skip)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();

    // Map metrik kehadiran teragregasi untuk tiap sesi
    const enrichedItems = items.map((sess) => {
      const attendances = sess.attendances || [];
      const totalRecorded = attendances.length;
      const presentCount = attendances.filter(
        (a) => a.status === AttendanceStatus.PRESENT,
      ).length;
      const lateCount = attendances.filter(
        (a) => a.status === AttendanceStatus.LATE,
      ).length;
      const excusedCount = attendances.filter(
        (a) => a.status === AttendanceStatus.EXCUSED,
      ).length;
      const absentCount = attendances.filter(
        (a) => a.status === AttendanceStatus.ABSENT,
      ).length;

      const totalActivitiesDuration = (sess.activities || []).reduce(
        (acc, curr) => acc + curr.duration,
        0,
      );

      const rpeItems = attendances.filter((a) => a.rpe !== null && a.rpe !== undefined);
      const avgRpe =
        rpeItems.length > 0
          ? Number(
              (
                rpeItems.reduce((acc, curr) => acc + (curr.rpe || 0), 0) /
                rpeItems.length
              ).toFixed(1),
            )
          : null;

      return {
        ...sess,
        stats: {
          totalRecorded,
          presentCount,
          lateCount,
          excusedCount,
          absentCount,
          attendanceRate:
            totalRecorded > 0
              ? Math.round(((presentCount + lateCount) / totalRecorded) * 100)
              : 0,
          totalDrillMinutes: totalActivitiesDuration,
          avgRpe,
        },
      };
    });

    return {
      items: enrichedItems,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Ambil detail sesi latihan beserta aktivitas drill dan lembar presensi
   */
  async getSessionById(id: string) {
    const session = await this.sessionRepo.findOne({
      where: { id },
      relations: {
        activities: true,
        attendances: {
          athlete: true,
        },
      },
      order: {
        activities: {
          sequence: 'ASC',
        },
      },
    });

    if (!session) {
      throw new NotFoundException(`Sesi latihan dengan ID ${id} tidak ditemukan.`);
    }

    const attendances = session.attendances || [];
    const totalRecorded = attendances.length;
    const presentCount = attendances.filter(
      (a) => a.status === AttendanceStatus.PRESENT,
    ).length;
    const lateCount = attendances.filter(
      (a) => a.status === AttendanceStatus.LATE,
    ).length;
    const excusedCount = attendances.filter(
      (a) => a.status === AttendanceStatus.EXCUSED,
    ).length;
    const absentCount = attendances.filter(
      (a) => a.status === AttendanceStatus.ABSENT,
    ).length;

    const rpeItems = attendances.filter((a) => a.rpe !== null && a.rpe !== undefined);
    const avgRpe =
      rpeItems.length > 0
        ? Number(
            (
              rpeItems.reduce((acc, curr) => acc + (curr.rpe || 0), 0) /
              rpeItems.length
            ).toFixed(1),
          )
        : null;

    return {
      ...session,
      stats: {
        totalRecorded,
        presentCount,
        lateCount,
        excusedCount,
        absentCount,
        attendanceRate:
          totalRecorded > 0
            ? Math.round(((presentCount + lateCount) / totalRecorded) * 100)
            : 0,
        avgRpe,
      },
    };
  }

  /**
   * Perbarui sesi latihan
   */
  async updateSession(id: string, dto: UpdateTrainingSessionDto): Promise<TrainingSession> {
    const session = await this.sessionRepo.findOne({ where: { id } });
    if (!session) {
      throw new NotFoundException(`Sesi latihan dengan ID ${id} tidak ditemukan.`);
    }

    if (dto.start_datetime || dto.end_datetime) {
      const start = dto.start_datetime
        ? new Date(dto.start_datetime)
        : new Date(session.start_datetime);
      const end = dto.end_datetime
        ? new Date(dto.end_datetime)
        : new Date(session.end_datetime);

      if (end <= start) {
        throw new BadRequestException(
          'Waktu selesai harus lebih besar dari waktu mulai (Pelanggaran BR-06).',
        );
      }
      session.start_datetime = start;
      session.end_datetime = end;
    }

    if (dto.session_date) session.session_date = dto.session_date;
    if (dto.venue !== undefined) session.venue = dto.venue || null;
    if (dto.objective) session.objective = dto.objective;
    if (dto.notes !== undefined) session.notes = dto.notes || null;
    if (dto.status) session.status = dto.status;

    return this.sessionRepo.save(session);
  }

  /**
   * Hapus sesi latihan
   */
  async deleteSession(id: string): Promise<{ message: string }> {
    const session = await this.sessionRepo.findOne({ where: { id } });
    if (!session) {
      throw new NotFoundException(`Sesi latihan dengan ID ${id} tidak ditemukan.`);
    }

    await this.sessionRepo.remove(session);
    return { message: 'Sesi latihan berhasil dihapus.' };
  }

  /**
   * Tambah drill ke sesi latihan
   */
  async addActivity(sessionId: string, dto: CreateActivityDto): Promise<TrainingActivity> {
    const session = await this.sessionRepo.findOne({ where: { id: sessionId } });
    if (!session) {
      throw new NotFoundException(`Sesi latihan dengan ID ${sessionId} tidak ditemukan.`);
    }

    const activity = this.activityRepo.create({
      training_session_id: sessionId,
      activity_name: dto.activity_name,
      category: dto.category,
      duration: dto.duration,
      objective: dto.objective || null,
      notes: dto.notes || null,
      sequence: dto.sequence,
    });

    return this.activityRepo.save(activity);
  }

  /**
   * Catat presensi atlet (Single atau Bulk) dengan RPE opsional (BR-01 / Q1)
   */
  async recordAttendance(
    sessionId: string,
    dto: BulkRecordAttendanceDto,
  ) {
    const session = await this.sessionRepo.findOne({ where: { id: sessionId } });
    if (!session) {
      throw new NotFoundException(`Sesi latihan dengan ID ${sessionId} tidak ditemukan.`);
    }

    for (const record of dto.attendances) {
      const existing = await this.attendanceRepo.findOne({
        where: {
          training_session_id: sessionId,
          athlete_id: record.athlete_id,
        },
      });

      if (existing) {
        existing.status = record.status;
        existing.rpe = record.rpe !== undefined ? record.rpe : existing.rpe;
        existing.notes = record.notes !== undefined ? record.notes : existing.notes;
        await this.attendanceRepo.save(existing);
      } else {
        const newAttendance = this.attendanceRepo.create({
          training_session_id: sessionId,
          athlete_id: record.athlete_id,
          status: record.status,
          rpe: record.rpe ?? null,
          notes: record.notes || null,
        });
        await this.attendanceRepo.save(newAttendance);
      }
    }

    return this.getSessionById(sessionId);
  }

  /**
   * Ambil metrik agregat performa latihan tim (Backend calculation)
   */
  async getTrainingStats(teamId: string) {
    if (!teamId || teamId === 'b0000000-0000-0000-0000-000000000001') {
      const defaultTeam = await this.sessionRepo.manager.findOne(Team, { where: {} });
      if (defaultTeam) {
        teamId = defaultTeam.id;
      }
    }

    const sessions = await this.sessionRepo.find({
      where: { team_id: teamId },
      relations: {
        attendances: true,
        activities: true,
      },
    });

    const totalSessions = sessions.length;
    let totalPresent = 0;
    let totalLate = 0;
    let totalAttendanceEntries = 0;
    let totalRpeSum = 0;
    let rpeCount = 0;

    sessions.forEach((s) => {
      (s.attendances || []).forEach((att) => {
        totalAttendanceEntries++;
        if (att.status === AttendanceStatus.PRESENT) totalPresent++;
        if (att.status === AttendanceStatus.LATE) totalLate++;
        if (att.rpe !== null && att.rpe !== undefined) {
          totalRpeSum += att.rpe;
          rpeCount++;
        }
      });
    });

    const overallAttendanceRate =
      totalAttendanceEntries > 0
        ? Math.round(((totalPresent + totalLate) / totalAttendanceEntries) * 100)
        : 0;

    const avgTeamRpe =
      rpeCount > 0 ? Number((totalRpeSum / rpeCount).toFixed(1)) : null;

    return {
      totalSessions,
      overallAttendanceRate,
      avgTeamRpe,
      totalPresencesRecorded: totalAttendanceEntries,
    };
  }

  /**
   * Ekspor data presensi latihan ke format CSV
   */
  async exportAttendanceCsv(teamId: string, sessionId?: string): Promise<string> {
    if (!teamId || teamId === 'b0000000-0000-0000-0000-000000000001') {
      const defaultTeam = await this.sessionRepo.manager.findOne(Team, { where: {} });
      if (defaultTeam) {
        teamId = defaultTeam.id;
      }
    }

    const qb = this.attendanceRepo
      .createQueryBuilder('att')
      .leftJoinAndSelect('att.training_session', 'training_session')
      .leftJoinAndSelect('att.athlete', 'athlete')
      .where('training_session.team_id = :teamId', { teamId });

    if (sessionId) {
      qb.andWhere('training_session.id = :sessionId', { sessionId });
    }

    qb.orderBy('training_session.session_date', 'DESC').addOrderBy('athlete.jersey_number', 'ASC');

    const attendances = await qb.getMany();

    const headers = [
      'Tanggal Sesi',
      'Target Sesi',
      'Nama Atlet',
      'Nomor Punggung',
      'Jenis Kelamin',
      'Status Kehadiran',
      'Beban Latihan (RPE)',
      'Catatan',
    ];

    const rows = attendances.map((a) => [
      a.training_session?.session_date || '-',
      `"${(a.training_session?.objective || '-').replace(/"/g, '""')}"`,
      `"${(a.athlete?.full_name || '-').replace(/"/g, '""')}"`,
      a.athlete?.jersey_number ?? '-',
      a.athlete?.gender || '-',
      a.status,
      a.rpe ?? '-',
      `"${(a.notes || '-').replace(/"/g, '""')}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }
}
