import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { TeamsService } from './teams.service.js';
import { UpdateTeamDto } from './dto/update-team.dto.js';
import { CreateSeasonDto } from './dto/create-season.dto.js';
import { NeonAuthGuard } from '../auth/guards/neon-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../../common/enums/index.js';

@ApiTags('Teams')
@ApiBearerAuth('JWT-auth')
@UseGuards(NeonAuthGuard, RolesGuard)
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  @ApiOperation({ summary: 'Mendapatkan profil informasi tim utama dan daftar musim' })
  @ApiResponse({ status: 200, description: 'Data profil tim berhasil diambil' })
  async getTeam() {
    return this.teamsService.getTeam();
  }

  @Patch(':id')
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Memperbarui profil tim (Hanya Role: MANAGER)' })
  @ApiParam({ name: 'id', description: 'ID UUID Tim' })
  @ApiResponse({ status: 200, description: 'Profil tim berhasil diperbarui' })
  @ApiResponse({ status: 403, description: 'Forbidden - Bukan Manager' })
  async updateTeam(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateTeamDto,
  ) {
    return this.teamsService.updateTeam(id, updateDto);
  }

  @Get(':id/seasons')
  @ApiOperation({ summary: 'Mendapatkan daftar seluruh musim kompetisi tim' })
  @ApiParam({ name: 'id', description: 'ID UUID Tim' })
  @ApiResponse({ status: 200, description: 'Daftar musim berhasil diambil' })
  async getSeasons(@Param('id', ParseUUIDPipe) id: string) {
    return this.teamsService.getSeasons(id);
  }

  @Post(':id/seasons')
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Membuat musim kompetisi baru (Hanya Role: MANAGER)' })
  @ApiParam({ name: 'id', description: 'ID UUID Tim' })
  @ApiResponse({ status: 201, description: 'Musim kompetisi berhasil dibuat' })
  async createSeason(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() createDto: CreateSeasonDto,
  ) {
    return this.teamsService.createSeason(id, createDto);
  }

  @Patch(':id/seasons/:seasonId/active')
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Mengaktifkan musim kompetisi tertentu (Hanya Role: MANAGER)' })
  @ApiParam({ name: 'id', description: 'ID UUID Tim' })
  @ApiParam({ name: 'seasonId', description: 'ID UUID Musim' })
  @ApiResponse({ status: 200, description: 'Musim kompetisi aktif berhasil diubah' })
  async setActiveSeason(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('seasonId', ParseUUIDPipe) seasonId: string,
  ) {
    return this.teamsService.setActiveSeason(id, seasonId);
  }
}
