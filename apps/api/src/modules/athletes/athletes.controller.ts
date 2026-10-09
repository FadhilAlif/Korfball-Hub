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
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AthletesService } from './athletes.service.js';
import { CreateAthleteDto } from './dto/create-athlete.dto.js';
import { UpdateAthleteDto } from './dto/update-athlete.dto.js';
import { AssignRosterDto } from './dto/assign-roster.dto.js';
import { FilterAthleteDto } from './dto/filter-athlete.dto.js';
import { NeonAuthGuard } from '../auth/guards/neon-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../../common/enums/index.js';

@ApiTags('Athletes')
@ApiBearerAuth('JWT-auth')
@UseGuards(NeonAuthGuard, RolesGuard)
@Controller('athletes')
export class AthletesController {
  constructor(private readonly athletesService: AthletesService) {}

  @Get()
  @ApiOperation({ summary: 'Mendapatkan daftar seluruh atlet dengan filter, pencarian, dan metrik KPI tim' })
  @ApiResponse({ status: 200, description: 'Daftar atlet berhasil diambil' })
  async findAll(@Query() query: FilterAthleteDto) {
    return this.athletesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Mendapatkan profil detail seorang atlet beserta histori roster' })
  @ApiParam({ name: 'id', description: 'ID UUID Atlet' })
  @ApiResponse({ status: 200, description: 'Detail atlet berhasil diambil' })
  @ApiResponse({ status: 404, description: 'Atlet tidak ditemukan' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.athletesService.findOne(id);
  }

  @Post()
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Mendaftarkan profil atlet baru (Hanya Role: MANAGER)' })
  @ApiResponse({ status: 201, description: 'Atlet berhasil didaftarkan' })
  @ApiResponse({ status: 409, description: 'ID Atlet (player_id) sudah terdaftar' })
  @ApiResponse({ status: 403, description: 'Forbidden - Bukan Manager' })
  async create(@Body() createDto: CreateAthleteDto) {
    return this.athletesService.create(createDto);
  }

  @Patch(':id')
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Memperbarui informasi profil atlet (Hanya Role: MANAGER)' })
  @ApiParam({ name: 'id', description: 'ID UUID Atlet' })
  @ApiResponse({ status: 200, description: 'Profil atlet berhasil diperbarui' })
  @ApiResponse({ status: 404, description: 'Atlet tidak ditemukan' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateAthleteDto,
  ) {
    return this.athletesService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Menonaktifkan profil atlet (Soft-delete status INACTIVE)' })
  @ApiParam({ name: 'id', description: 'ID UUID Atlet' })
  @ApiResponse({ status: 200, description: 'Status atlet berhasil diubah menjadi INACTIVE' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.athletesService.remove(id);
  }

  @Post('roster')
  @Roles(UserRole.MANAGER, UserRole.COACH)
  @ApiOperation({
    summary: 'Memasukkan/memperbarui atlet ke Roster Musim berjalan (Izin: MANAGER & COACH)',
  })
  @ApiResponse({ status: 201, description: 'Atlet berhasil ditambahkan ke Roster musim aktif' })
  @ApiResponse({ status: 400, description: 'Nomor punggung duplikat pada roster musim ini' })
  async assignToRoster(@Body() assignDto: AssignRosterDto) {
    return this.athletesService.assignToRoster(assignDto);
  }

  @Delete('roster/:rosterId')
  @Roles(UserRole.MANAGER, UserRole.COACH)
  @ApiOperation({
    summary: 'Mengeluarkan atlet dari Roster Musim tertentu (Izin: MANAGER & COACH)',
  })
  @ApiParam({ name: 'rosterId', description: 'ID UUID Roster' })
  @ApiResponse({ status: 200, description: 'Atlet berhasil dikeluarkan dari roster' })
  async removeFromRoster(@Param('rosterId', ParseUUIDPipe) rosterId: string) {
    return this.athletesService.removeFromRoster(rosterId);
  }

  @Patch('roster/:rosterId/captain')
  @Roles(UserRole.MANAGER, UserRole.COACH)
  @ApiOperation({
    summary: 'Menetapkan kapten tim pada roster musim (Otomatis mencopot kapten lama)',
  })
  @ApiParam({ name: 'rosterId', description: 'ID UUID Roster' })
  @ApiResponse({ status: 200, description: 'Kapten tim berhasil ditetapkan' })
  async setCaptain(@Param('rosterId', ParseUUIDPipe) rosterId: string) {
    return this.athletesService.setCaptain(rosterId);
  }
}
