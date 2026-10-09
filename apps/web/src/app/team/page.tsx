'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import {
  useGetTeam,
  useUpdateTeam,
  useCreateSeason,
  useSetActiveSeason,
  Season,
} from '@/hooks/useTeams';
import {
  Shield,
  Calendar,
  MapPin,
  CheckCircle2,
  Plus,
  Edit2,
  Trophy,
  Users,
  ChevronRight,
  Loader2,
  Building,
  Flag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const seasonSchema = z.object({
  name: z.string().min(2, 'Nama musim minimal 2 karakter'),
  start_date: z.string().min(1, 'Tanggal mulai wajib diisi'),
  end_date: z.string().min(1, 'Tanggal selesai wajib diisi'),
  is_active: z.boolean().optional(),
});

type SeasonFormData = z.infer<typeof seasonSchema>;

const teamSchema = z.object({
  name: z.string().min(2, 'Nama tim minimal 2 karakter'),
  category: z.string().min(1, 'Kategori wajib diisi'),
  region: z.string().min(1, 'Wilayah wajib diisi'),
  home_venue: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
});

type TeamFormData = z.infer<typeof teamSchema>;

export default function TeamPage() {
  const { data: team, isLoading } = useGetTeam();
  const updateTeam = useUpdateTeam();
  const createSeason = useCreateSeason();
  const setActiveSeason = useSetActiveSeason();

  // Modals state
  const [isEditTeamOpen, setIsEditTeamOpen] = useState(false);
  const [isAddSeasonOpen, setIsAddSeasonOpen] = useState(false);

  // Forms
  const {
    register: registerSeason,
    handleSubmit: handleSubmitSeason,
    reset: resetSeason,
    formState: { errors: seasonErrors, isSubmitting: isSubmittingSeason },
  } = useForm<SeasonFormData>({
    resolver: zodResolver(seasonSchema) as any,
    defaultValues: {
      name: '',
      start_date: '',
      end_date: '',
      is_active: false,
    },
  });

  const {
    register: registerTeam,
    handleSubmit: handleSubmitTeam,
    reset: resetTeam,
    formState: { errors: teamErrors, isSubmitting: isSubmittingTeam },
  } = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema) as any,
    values: team
      ? {
          name: team.name,
          category: team.category,
          region: team.region,
          home_venue: team.home_venue || '',
          description: team.description || '',
        }
      : undefined,
  });

  const onSeasonSubmit = async (data: SeasonFormData) => {
    if (!team) return;
    try {
      await createSeason.mutateAsync({
        teamId: team.id,
        data: {
          name: data.name,
          start_date: data.start_date,
          end_date: data.end_date,
          is_active: !!data.is_active,
        },
      });
      setIsAddSeasonOpen(false);
      resetSeason();
    } catch (err) {
      console.error('Failed to create season:', err);
    }
  };

  const onTeamSubmit = async (data: TeamFormData) => {
    if (!team) return;
    try {
      await updateTeam.mutateAsync({
        id: team.id,
        data: {
          name: data.name,
          category: data.category,
          region: data.region,
          home_venue: data.home_venue || null,
          description: data.description || null,
        },
      });
      setIsEditTeamOpen(false);
    } catch (err) {
      console.error('Failed to update team:', err);
    }
  };

  const handleSetActive = async (seasonId: string) => {
    if (!team) return;
    await setActiveSeason.mutateAsync({
      teamId: team.id,
      seasonId,
    });
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-slate-900">
      <Sidebar />

      <div className="pl-72">
        <Header title="Profil Tim & Musim" category="Team Management" />

        <main className="w-full pt-16 min-h-screen p-8">
          <div className="flex flex-col w-full max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <span>Team Management</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                  <span className="font-semibold text-slate-900">Profil Tim & Musim</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
                  Profil Organisasi & Manajemen Musim
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setIsAddSeasonOpen(true)}
                  className="bg-[#b91c1c] hover:bg-[#991b1b] text-white text-xs font-semibold h-10 px-4 gap-2 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Musim Baru</span>
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
                Memuat data profil tim...
              </div>
            ) : !team ? (
              <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
                Data tim tidak ditemukan.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: Team Profile Card (5 cols) */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="p-6 rounded-2xl bg-white shadow-xs border border-slate-200 space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white font-black text-2xl shadow-md shadow-red-900/30">
                          KB
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-slate-900 leading-tight">
                            {team.name}
                          </h2>
                          <span className="text-xs text-red-700 font-semibold">
                            {team.category}
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditTeamOpen(true)}
                        className="h-8 px-2.5 text-xs gap-1 border-slate-200"
                      >
                        <Edit2 className="w-3 h-3 text-slate-600" />
                        Edit
                      </Button>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="flex items-start gap-2.5 text-slate-700">
                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-semibold text-slate-900 block">Wilayah Asosiasi</span>
                          <span>{team.region}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 text-slate-700">
                        <Building className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-semibold text-slate-900 block">Home Venue</span>
                          <span>{team.home_venue || 'Belum diatur'}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 text-slate-700">
                        <Flag className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-semibold text-slate-900 block">Deskripsi / Visi</span>
                          <span className="text-slate-600 leading-relaxed">
                            {team.description || 'Tidak ada deskripsi'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                      <span className="text-xs font-bold text-slate-900 block">
                        Standar Regulasi Korfball
                      </span>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Sistem mengunci aturan IKF (International Korfball Federation): 8 pemain per match (4 Putra & 4 Putri), nomor punggung 0-99 unik per musim, serta hanya 1 kapten aktif per musim.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right: Seasons List (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Daftar Musim Kompetisi ({team.seasons?.length || 0})
                      </h3>
                      <p className="text-xs text-slate-500">
                        Pilih satu musim aktif sebagai acuan roster, jadwal latihan, dan rekap pertandingan.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {team.seasons?.map((season) => (
                      <div
                        key={season.id}
                        className={`p-5 rounded-2xl bg-white shadow-xs border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          season.is_active
                            ? 'border-red-300 ring-2 ring-red-600/30 bg-red-50/10'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900">
                              {season.name}
                            </span>
                            {season.is_active && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Musim Aktif
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              {season.start_date ? String(season.start_date).split('T')[0] : '-'}
                            </span>
                            <span>s/d</span>
                            <span>
                              {season.end_date ? String(season.end_date).split('T')[0] : '-'}
                            </span>
                          </div>
                        </div>

                        <div>
                          {season.is_active ? (
                            <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-block text-center">
                              Sedang Digunakan
                            </span>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={setActiveSeason.isPending}
                              onClick={() => handleSetActive(season.id)}
                              className="text-xs h-9 px-3 gap-1.5 border-slate-200 hover:bg-slate-50"
                            >
                              Jadikan Aktif
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal Edit Team */}
      <Dialog open={isEditTeamOpen} onOpenChange={setIsEditTeamOpen}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl border border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-600" />
              Edit Profil Tim
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Perbarui identitas dan domisili tim Korfball Bantul.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitTeam(onTeamSubmit)} className="space-y-3.5 mt-2">
            <div className="space-y-1">
              <Label htmlFor="name" className="text-xs font-semibold text-slate-700">
                Nama Tim
              </Label>
              <Input id="name" {...registerTeam('name')} className="h-9 text-xs" />
              {teamErrors.name && (
                <p className="text-[10px] text-red-500">{teamErrors.name.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="category" className="text-xs font-semibold text-slate-700">
                Kategori
              </Label>
              <Input id="category" {...registerTeam('category')} className="h-9 text-xs" />
              {teamErrors.category && (
                <p className="text-[10px] text-red-500">{teamErrors.category.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="region" className="text-xs font-semibold text-slate-700">
                Wilayah
              </Label>
              <Input id="region" {...registerTeam('region')} className="h-9 text-xs" />
              {teamErrors.region && (
                <p className="text-[10px] text-red-500">{teamErrors.region.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="home_venue" className="text-xs font-semibold text-slate-700">
                Home Venue
              </Label>
              <Input id="home_venue" {...registerTeam('home_venue')} className="h-9 text-xs" />
            </div>

            <div className="space-y-1">
              <Label htmlFor="description" className="text-xs font-semibold text-slate-700">
                Deskripsi
              </Label>
              <textarea
                id="description"
                rows={2}
                {...registerTeam('description')}
                className="w-full p-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-red-600 outline-none"
              />
            </div>

            <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditTeamOpen(false)}
                className="text-xs h-9 px-3"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingTeam || updateTeam.isPending}
                className="bg-red-700 hover:bg-red-800 text-white text-xs h-9 px-4 gap-1.5"
              >
                {(isSubmittingTeam || updateTeam.isPending) && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Tambah Season */}
      <Dialog open={isAddSeasonOpen} onOpenChange={setIsAddSeasonOpen}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl border border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-red-600" />
              Tambah Musim Kompetisi Baru
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Buat musim baru untuk turnamen atau agenda kejuaraan.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitSeason(onSeasonSubmit)} className="space-y-3.5 mt-2">
            <div className="space-y-1">
              <Label htmlFor="season_name" className="text-xs font-semibold text-slate-700">
                Nama Musim
              </Label>
              <Input
                id="season_name"
                placeholder="cth: Kejurkab Bantul 2026 / Pra-PON 2026"
                {...registerSeason('name')}
                className="h-9 text-xs"
              />
              {seasonErrors.name && (
                <p className="text-[10px] text-red-500">{seasonErrors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="start_date" className="text-xs font-semibold text-slate-700">
                  Tanggal Mulai
                </Label>
                <Input
                  id="start_date"
                  type="date"
                  {...registerSeason('start_date')}
                  className="h-9 text-xs"
                />
                {seasonErrors.start_date && (
                  <p className="text-[10px] text-red-500">{seasonErrors.start_date.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="end_date" className="text-xs font-semibold text-slate-700">
                  Tanggal Berakhir
                </Label>
                <Input
                  id="end_date"
                  type="date"
                  {...registerSeason('end_date')}
                  className="h-9 text-xs"
                />
                {seasonErrors.end_date && (
                  <p className="text-[10px] text-red-500">{seasonErrors.end_date.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                id="season_is_active"
                type="checkbox"
                {...registerSeason('is_active')}
                className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-slate-300 cursor-pointer"
              />
              <Label htmlFor="season_is_active" className="text-xs font-medium text-slate-700 cursor-pointer">
                Jadikan sebagai musim aktif sekarang
              </Label>
            </div>

            <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddSeasonOpen(false)}
                className="text-xs h-9 px-3"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingSeason || createSeason.isPending}
                className="bg-red-700 hover:bg-red-800 text-white text-xs h-9 px-4 gap-1.5"
              >
                {(isSubmittingSeason || createSeason.isPending) && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                Tambah Musim
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
