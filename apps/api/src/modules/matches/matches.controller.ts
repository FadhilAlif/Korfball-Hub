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
import { MatchesService } from './matches.service.js';
import { CreateMatchDto } from './dto/create-match.dto.js';
import { UpdateMatchDto } from './dto/update-match.dto.js';
import { AssignMatchSquadDto } from './dto/assign-squad.dto.js';
import { RecordMatchEventDto } from './dto/record-event.dto.js';
import { FinalizeMatchDto } from './dto/finalize-match.dto.js';
import { NeonAuthGuard } from '../auth/guards/neon-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole, MatchStatus } from '../../common/enums/index.js';

@ApiTags('Matches & Competition')
@ApiBearerAuth('JWT-auth')
@UseGuards(NeonAuthGuard, RolesGuard)
@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post()
  @Roles(UserRole.MANAGER, UserRole.COACH)
  @ApiOperation({ summary: 'Buat jadwal pertandingan baru' })
  @ApiResponse({ status: 201, description: 'Jadwal pertandingan berhasil dibuat' })
  async createMatch(@Body() dto: CreateMatchDto) {
    const teamId = 'b0000000-0000-0000-0000-000000000001';
    const match = await this.matchesService.createMatch(teamId, dto);
    return {
      success: true,
      message: 'Jadwal pertandingan berhasil dibuat',
      data: match,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Ambil daftar pertandingan dan ringkasan rekap skor (Win/Loss/Draw)' })
  @ApiQuery({ name: 'season_id', required: false, description: 'Filter berdasarkan ID musim' })
  @ApiQuery({ name: 'status', enum: MatchStatus, required: false, description: 'Filter berdasarkan status pertandingan' })
  @ApiResponse({ status: 200, description: 'Daftar pertandingan berhasil diambil' })
  async getMatches(
    @Query('season_id') seasonId?: string,
    @Query('status') status?: MatchStatus,
  ) {
    const teamId = 'b0000000-0000-0000-0000-000000000001';
    const result = await this.matchesService.getMatches(teamId, seasonId, status);
    return {
      success: true,
      message: 'Daftar pertandingan berhasil diambil',
      data: result.items,
      meta: result.summary,
    };
  }

  @Get('export/csv')
  @ApiOperation({ summary: 'Ekspor rekap jadwal dan hasil pertandingan ke format CSV' })
  @ApiQuery({ name: 'season_id', required: false, description: 'Filter berdasarkan ID musim (opsional)' })
  @ApiResponse({ status: 200, description: 'File CSV berhasil digenerate dan diunduh' })
  async exportMatchesCsv(
    @Res() res: Response,
    @Query('season_id') seasonId?: string,
  ) {
    const teamId = 'b0000000-0000-0000-0000-000000000001';
    const csvContent = await this.matchesService.exportMatchesCsv(teamId, seasonId);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="laporan_pertandingan_korfball_bantul.csv"',
    );
    return res.send(csvContent);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ambil detail pertandingan beserta susunan skuad starter/cadangan dan riwayat event gol' })
  @ApiParam({ name: 'id', description: 'UUID pertandingan' })
  @ApiResponse({ status: 200, description: 'Detail pertandingan berhasil diambil' })
  @ApiResponse({ status: 404, description: 'Pertandingan tidak ditemukan' })
  async getMatchById(@Param('id') id: string) {
    const match = await this.matchesService.getMatchById(id);
    return {
      success: true,
      message: 'Detail pertandingan berhasil diambil',
      data: match,
    };
  }

  @Patch(':id')
  @Roles(UserRole.MANAGER, UserRole.COACH)
  @ApiOperation({ summary: 'Perbarui jadwal atau skor pertandingan (Hasil otomatis dikalkulasi via BR-14)' })
  @ApiParam({ name: 'id', description: 'UUID pertandingan' })
  @ApiResponse({ status: 200, description: 'Pertandingan berhasil diperbarui' })
  async updateMatch(
    @Param('id') id: string,
    @Body() dto: UpdateMatchDto,
  ) {
    const updated = await this.matchesService.updateMatch(id, dto);
    return {
      success: true,
      message: 'Pertandingan berhasil diperbarui',
      data: updated,
    };
  }

  @Delete(':id')
  @Roles(UserRole.MANAGER, UserRole.COACH)
  @ApiOperation({ summary: 'Hapus pertandingan' })
  @ApiParam({ name: 'id', description: 'UUID pertandingan' })
  @ApiResponse({ status: 200, description: 'Pertandingan berhasil dihapus' })
  async deleteMatch(@Param('id') id: string) {
    const result = await this.matchesService.deleteMatch(id);
    return {
      success: true,
      message: result.message,
    };
  }

  @Post(':id/squad')
  @Roles(UserRole.MANAGER, UserRole.COACH)
  @ApiOperation({ summary: 'Tetapkan formasi skuad pertandingan (Starter 8 & Cadangan) dengan verifikasi kepatuhan IKF' })
  @ApiParam({ name: 'id', description: 'UUID pertandingan' })
  @ApiResponse({ status: 200, description: 'Skuad pertandingan berhasil ditetapkan' })
  async assignSquad(
    @Param('id') id: string,
    @Body() dto: AssignMatchSquadDto,
  ) {
    const match = await this.matchesService.assignSquad(id, dto);
    return {
      success: true,
      message: 'Skuad pertandingan berhasil ditetapkan',
      data: match,
    };
  }

  @Post(':id/events')
  @Roles(UserRole.MANAGER, UserRole.COACH)
  @ApiOperation({ summary: 'Catat event pertandingan secara langsung (Gol Korfball +1, Shot Type, Kartu Kuning)' })
  @ApiParam({ name: 'id', description: 'UUID pertandingan' })
  @ApiResponse({ status: 200, description: 'Event pertandingan berhasil dicatat dan skor otomatis terupdate' })
  async recordEvent(
    @Param('id') id: string,
    @Body() dto: RecordMatchEventDto,
  ) {
    const match = await this.matchesService.recordEvent(id, dto);
    return {
      success: true,
      message: 'Event pertandingan berhasil dicatat',
      data: match,
    };
  }

  @Post(':id/finalize')
  @Roles(UserRole.MANAGER, UserRole.COACH)
  @ApiOperation({ summary: 'Kunci dan finalisasi hasil akhir pertandingan (Kalkulasi WIN/LOSS/DRAW via BR-14)' })
  @ApiParam({ name: 'id', description: 'UUID pertandingan' })
  @ApiResponse({ status: 200, description: 'Pertandingan berhasil difinalisasi' })
  async finalizeMatch(
    @Param('id') id: string,
    @Body() dto: FinalizeMatchDto,
  ) {
    const match = await this.matchesService.finalizeMatch(id, dto);
    return {
      success: true,
      message: 'Pertandingan berhasil difinalisasi',
      data: match,
    };
  }
}
