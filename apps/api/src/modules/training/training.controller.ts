import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { TrainingService } from './training.service.js';
import {
  CreateTrainingSessionDto,
  CreateActivityDto,
} from './dto/create-session.dto.js';
import { UpdateTrainingSessionDto } from './dto/update-session.dto.js';
import { BulkRecordAttendanceDto } from './dto/record-attendance.dto.js';
import { FilterSessionDto } from './dto/filter-session.dto.js';
import { NeonAuthGuard } from '../auth/guards/neon-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../../common/enums/index.js';

@ApiTags('Training Operations')
@ApiBearerAuth('JWT-auth')
@UseGuards(NeonAuthGuard, RolesGuard)
@Controller('training')
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Post('sessions')
  @Roles(UserRole.MANAGER, UserRole.COACH)
  @ApiOperation({ summary: 'Buat sesi latihan baru lengkap dengan drill (BR-06: End > Start)' })
  @ApiResponse({ status: 201, description: 'Sesi latihan berhasil dibuat' })
  @ApiResponse({ status: 400, description: 'Validasi waktu atau durasi gagal (BR-06)' })
  async createSession(@Request() req: any, @Body() dto: CreateTrainingSessionDto) {
    const coachId = req.user?.id || 'd0000000-0000-0000-0000-000000000001';
    const teamId = 'b0000000-0000-0000-0000-000000000001';
    const session = await this.trainingService.createSession(coachId, teamId, dto);
    return {
      success: true,
      message: 'Sesi latihan berhasil dibuat',
      data: session,
    };
  }

  @Get('sessions')
  @ApiOperation({ summary: 'Ambil daftar sesi latihan dengan pagination & filter status/tanggal' })
  @ApiResponse({ status: 200, description: 'Daftar sesi latihan berhasil diambil' })
  async getSessions(@Query() filters: FilterSessionDto) {
    const teamId = 'b0000000-0000-0000-0000-000000000001';
    const result = await this.trainingService.getSessions(teamId, filters);
    return {
      success: true,
      message: 'Daftar sesi latihan berhasil diambil',
      data: result.items,
      meta: result.meta,
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Ambil statistik agregat beban latihan & tingkat kehadiran tim' })
  @ApiResponse({ status: 200, description: 'Statistik latihan berhasil diambil' })
  async getTrainingStats() {
    const teamId = 'b0000000-0000-0000-0000-000000000001';
    const stats = await this.trainingService.getTrainingStats(teamId);
    return {
      success: true,
      message: 'Statistik latihan tim berhasil dikalkulasi',
      data: stats,
    };
  }

  @Get('export/csv')
  @ApiOperation({ summary: 'Ekspor rekap data presensi sesi latihan dalam format CSV' })
  @ApiQuery({ name: 'session_id', required: false, description: 'ID Sesi Latihan spesifik (opsional)' })
  @ApiResponse({ status: 200, description: 'File CSV berhasil digenerate dan diunduh' })
  async exportAttendanceCsv(
    @Res() res: Response,
    @Query('session_id') sessionId?: string,
  ) {
    const teamId = 'b0000000-0000-0000-0000-000000000001';
    const csvContent = await this.trainingService.exportAttendanceCsv(teamId, sessionId);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="laporan_presensi_korfball_bantul.csv"',
    );
    return res.send(csvContent);
  }

  @Get('sessions/:id')
  @ApiOperation({ summary: 'Ambil detail sesi latihan, daftar drill, dan lembar presensi' })
  @ApiParam({ name: 'id', description: 'UUID sesi latihan' })
  @ApiResponse({ status: 200, description: 'Detail sesi latihan berhasil diambil' })
  @ApiResponse({ status: 404, description: 'Sesi tidak ditemukan' })
  async getSessionById(@Param('id') id: string) {
    const session = await this.trainingService.getSessionById(id);
    return {
      success: true,
      message: 'Detail sesi latihan berhasil diambil',
      data: session,
    };
  }

  @Patch('sessions/:id')
  @Roles(UserRole.MANAGER, UserRole.COACH)
  @ApiOperation({ summary: 'Perbarui informasi sesi latihan atau ubah status sesi' })
  @ApiParam({ name: 'id', description: 'UUID sesi latihan' })
  @ApiResponse({ status: 200, description: 'Sesi latihan berhasil diperbarui' })
  async updateSession(
    @Param('id') id: string,
    @Body() dto: UpdateTrainingSessionDto,
  ) {
    const updated = await this.trainingService.updateSession(id, dto);
    return {
      success: true,
      message: 'Sesi latihan berhasil diperbarui',
      data: updated,
    };
  }

  @Delete('sessions/:id')
  @Roles(UserRole.MANAGER, UserRole.COACH)
  @ApiOperation({ summary: 'Hapus sesi latihan' })
  @ApiParam({ name: 'id', description: 'UUID sesi latihan' })
  @ApiResponse({ status: 200, description: 'Sesi latihan berhasil dihapus' })
  async deleteSession(@Param('id') id: string) {
    const result = await this.trainingService.deleteSession(id);
    return {
      success: true,
      message: result.message,
    };
  }

  @Post('sessions/:id/drills')
  @Roles(UserRole.MANAGER, UserRole.COACH)
  @ApiOperation({ summary: 'Tambahkan drill baru ke dalam sesi latihan' })
  @ApiParam({ name: 'id', description: 'UUID sesi latihan' })
  @ApiResponse({ status: 201, description: 'Drill berhasil ditambahkan' })
  async addActivity(
    @Param('id') id: string,
    @Body() dto: CreateActivityDto,
  ) {
    const activity = await this.trainingService.addActivity(id, dto);
    return {
      success: true,
      message: 'Drill berhasil ditambahkan ke sesi',
      data: activity,
    };
  }

  @Post('sessions/:id/attendance')
  @Roles(UserRole.MANAGER, UserRole.COACH)
  @ApiOperation({ summary: 'Catat presensi kehadiran atlet (Single atau Bulk) dengan RPE opsional' })
  @ApiParam({ name: 'id', description: 'UUID sesi latihan' })
  @ApiResponse({ status: 200, description: 'Presensi berhasil dicatat dan dikalkulasi' })
  async recordAttendance(
    @Param('id') id: string,
    @Body() dto: BulkRecordAttendanceDto,
  ) {
    const session = await this.trainingService.recordAttendance(id, dto);
    return {
      success: true,
      message: 'Presensi atlet berhasil disimpan',
      data: session,
    };
  }
}
