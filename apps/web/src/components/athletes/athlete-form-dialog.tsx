'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Athlete, useCreateAthlete, useUpdateAthlete } from '@/hooks/useAthletes';
import { useGetTeam } from '@/hooks/useTeams';
import { UserCheck, ShieldAlert, AlertCircle, Loader2 } from 'lucide-react';

const athleteSchema = z.object({
  full_name: z.string().min(2, 'Nama lengkap minimal 2 karakter').max(100),
  display_name: z.string().max(80).optional().or(z.literal('')),
  player_id: z.string().max(30).optional().or(z.literal('')),
  date_of_birth: z
    .string()
    .min(1, 'Tanggal lahir wajib diisi')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD'),
  gender: z.enum(['MALE', 'FEMALE'], {
    message: 'Pilih jenis kelamin',
  }),
  jersey_number: z.coerce
    .number({ message: 'Nomor punggung harus angka' })
    .min(0, 'Nomor punggung minimal 0')
    .max(99, 'Nomor punggung maksimal 99'),
  position: z.string().max(50).optional().or(z.literal('')),
  join_date: z.string().optional().or(z.literal('')),
  status: z.enum(['ACTIVE', 'UNAVAILABLE', 'INJURED', 'SUSPENDED', 'INACTIVE']),
  phone: z.string().max(20).optional().or(z.literal('')),
  emergency_contact: z.string().max(100).optional().or(z.literal('')),
  emergency_phone: z.string().max(20).optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  season_id: z.string().optional().or(z.literal('')),
  is_captain: z.boolean().optional(),
});

type AthleteFormData = z.infer<typeof athleteSchema>;

interface AthleteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  athlete?: Athlete | null;
  activeSeasonId?: string;
}

export function AthleteFormDialog({
  open,
  onOpenChange,
  athlete,
  activeSeasonId,
}: AthleteFormDialogProps) {
  const isEdit = !!athlete;
  const { data: team } = useGetTeam();
  const createAthlete = useCreateAthlete();
  const updateAthlete = useUpdateAthlete();

  const activeSeason =
    team?.seasons?.find((s) => s.id === activeSeasonId) ||
    team?.seasons?.find((s) => s.is_active);

  const defaultValues: AthleteFormData = {
    full_name: '',
    display_name: '',
    player_id: '',
    date_of_birth: '2004-01-01',
    gender: 'MALE',
    jersey_number: 10,
    position: 'Lead Attacker',
    join_date: '',
    status: 'ACTIVE',
    phone: '',
    emergency_contact: '',
    emergency_phone: '',
    notes: '',
    season_id: activeSeason?.id || '',
    is_captain: false,
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AthleteFormData>({
    resolver: zodResolver(athleteSchema) as any,
    defaultValues,
  });

  const selectedGender = watch('gender');
  const selectedStatus = watch('status');
  const isCaptainVal = watch('is_captain');

  useEffect(() => {
    if (athlete) {
      const activeRoster = athlete.rosters?.find((r) => r.season?.is_active);
      reset({
        full_name: athlete.full_name,
        display_name: athlete.display_name || '',
        player_id: athlete.player_id || '',
        date_of_birth: athlete.date_of_birth
          ? String(athlete.date_of_birth).split('T')[0]
          : '2004-01-01',
        gender: athlete.gender,
        jersey_number: athlete.jersey_number,
        position: athlete.position || '',
        join_date: athlete.join_date
          ? String(athlete.join_date).split('T')[0]
          : '',
        status: athlete.status,
        phone: athlete.phone || '',
        emergency_contact: athlete.emergency_contact || '',
        emergency_phone: athlete.emergency_phone || '',
        notes: athlete.notes || '',
        season_id: activeRoster?.season_id || activeSeason?.id || '',
        is_captain: activeRoster?.is_captain || false,
      });
    } else {
      reset({
        ...defaultValues,
        season_id: activeSeason?.id || '',
      });
    }
  }, [athlete, open, activeSeason?.id, reset]);

  const onSubmit = async (data: AthleteFormData) => {
    try {
      const payload: any = {
        full_name: data.full_name,
        display_name: data.display_name || null,
        date_of_birth: data.date_of_birth,
        gender: data.gender,
        jersey_number: Number(data.jersey_number),
        position: data.position || null,
        status: data.status,
        phone: data.phone || null,
        emergency_contact: data.emergency_contact || null,
        emergency_phone: data.emergency_phone || null,
        notes: data.notes || null,
      };

      if (data.player_id && data.player_id.trim() !== '') {
        payload.player_id = data.player_id.trim();
      }

      if (data.join_date && data.join_date.trim() !== '') {
        payload.join_date = data.join_date;
      }

      if (data.season_id) {
        payload.season_id = data.season_id;
        payload.is_captain = !!data.is_captain;
      }

      if (isEdit && athlete) {
        await updateAthlete.mutateAsync({
          id: athlete.id,
          data: payload,
        });
      } else {
        await createAthlete.mutateAsync(payload);
      }

      onOpenChange(false);
      reset();
    } catch (err: any) {
      console.error('Failed to submit athlete:', err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white p-6 rounded-2xl shadow-2xl border border-slate-200">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-red-600" />
            {isEdit ? 'Perbarui Profil Atlet' : 'Registrasi Atlet Baru'}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            {isEdit
              ? 'Edit informasi profil data atlet dan penugasan taktis.'
              : 'Daftarkan atlet ke pangkalan data Korfball Bantul dan tugaskan ke skuad musim aktif.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Section: Identitas Utama */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="full_name" className="text-xs font-semibold text-slate-700">
                Nama Lengkap <span className="text-red-500">*</span>
              </Label>
              <Input
                id="full_name"
                placeholder="cth: Rian Hidayat"
                {...register('full_name')}
                className="h-10 text-sm"
              />
              {errors.full_name && (
                <p className="text-xs text-red-500">{errors.full_name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="display_name" className="text-xs font-semibold text-slate-700">
                Nama Panggilan
              </Label>
              <Input
                id="display_name"
                placeholder="cth: Rian"
                {...register('display_name')}
                className="h-10 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="player_id" className="text-xs font-semibold text-slate-700">
                Player ID (Opsional)
              </Label>
              <Input
                id="player_id"
                placeholder="Otomatis KB-XX jika kosong"
                {...register('player_id')}
                className="h-10 text-sm"
              />
              <p className="text-[10px] text-slate-400">Biarkan kosong untuk auto-generate</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="date_of_birth" className="text-xs font-semibold text-slate-700">
                Tanggal Lahir <span className="text-red-500">*</span>
              </Label>
              <Input
                id="date_of_birth"
                type="date"
                {...register('date_of_birth')}
                className="h-10 text-sm"
              />
              {errors.date_of_birth && (
                <p className="text-xs text-red-500">{errors.date_of_birth.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="gender" className="text-xs font-semibold text-slate-700">
                Gender (IKF Korfball) <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-2 h-10">
                <button
                  type="button"
                  onClick={() => setValue('gender', 'MALE')}
                  className={`flex items-center justify-center rounded-lg text-xs font-semibold border transition-all ${
                    selectedGender === 'MALE'
                      ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  ♂ Laki-laki
                </button>
                <button
                  type="button"
                  onClick={() => setValue('gender', 'FEMALE')}
                  className={`flex items-center justify-center rounded-lg text-xs font-semibold border transition-all ${
                    selectedGender === 'FEMALE'
                      ? 'bg-purple-50 border-purple-600 text-purple-700 font-bold shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  ♀ Perempuan
                </button>
              </div>
            </div>
          </div>

          {/* Section: Penugasan Taktis & Jersey */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="jersey_number" className="text-xs font-semibold text-slate-700">
                Nomor Punggung (0-99) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="jersey_number"
                type="number"
                min={0}
                max={99}
                {...register('jersey_number')}
                className="h-10 text-sm font-mono font-bold"
              />
              {errors.jersey_number && (
                <p className="text-xs text-red-500">{errors.jersey_number.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="position" className="text-xs font-semibold text-slate-700">
                Peran Taktis
              </Label>
              <Input
                id="position"
                placeholder="cth: Lead Attacker / Rebounder"
                {...register('position')}
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status" className="text-xs font-semibold text-slate-700">
                Status Kebugaran
              </Label>
              <select
                id="status"
                value={selectedStatus}
                onChange={(e) => setValue('status', e.target.value as any)}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-600"
              >
                <option value="ACTIVE">🟢 Siap Tanding (ACTIVE)</option>
                <option value="INJURED">🔴 Cedera / Rehab (INJURED)</option>
                <option value="UNAVAILABLE">🟡 Izin / Absen (UNAVAILABLE)</option>
                <option value="SUSPENDED">⚫ Sanksi (SUSPENDED)</option>
                <option value="INACTIVE">⚪ Tidak Aktif (INACTIVE)</option>
              </select>
            </div>
          </div>

          {/* Section: Roster & Captaincy */}
          {activeSeason && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Penugasan Roster Musim Aktif
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {activeSeason.name}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-100 text-emerald-800">
                  Aktif
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <Label htmlFor="is_captain" className="text-xs font-medium text-slate-700 cursor-pointer">
                    Tetapkan Sebagai Kapten Tim Musim Ini
                  </Label>
                </div>
                <input
                  id="is_captain"
                  type="checkbox"
                  checked={!!isCaptainVal}
                  onChange={(e) => setValue('is_captain', e.target.checked)}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-slate-300 cursor-pointer"
                />
              </div>
              {isCaptainVal && (
                <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                  * Catatan BR-05: Menetapkan atlet ini sebagai kapten akan otomatis melepaskan jabatan kapten dari atlet lain pada musim ini.
                </p>
              )}
            </div>
          )}

          {/* Section: Kontak & Kontak Darurat */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-semibold text-slate-700">
                No. HP / WA Atlet
              </Label>
              <Input
                id="phone"
                placeholder="08123456789"
                {...register('phone')}
                className="h-10 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="emergency_contact" className="text-xs font-semibold text-slate-700">
                Kontak Darurat (Nama)
              </Label>
              <Input
                id="emergency_contact"
                placeholder="Bambang (Ayah)"
                {...register('emergency_contact')}
                className="h-10 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="emergency_phone" className="text-xs font-semibold text-slate-700">
                No. Telp Darurat
              </Label>
              <Input
                id="emergency_phone"
                placeholder="081298765432"
                {...register('emergency_phone')}
                className="h-10 text-sm"
              />
            </div>
          </div>

          {/* Section: Catatan Medis & Atletis */}
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs font-semibold text-slate-700">
              Catatan Medis / Riwayat Fisik
            </Label>
            <textarea
              id="notes"
              rows={2}
              placeholder="cth: Riwayat cedera ankle kiri, target VO2Max 58+, domisili Sewon Bantul..."
              {...register('notes')}
              className="w-full p-2.5 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>

          <DialogFooter className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-xs h-10 px-4"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || createAthlete.isPending || updateAthlete.isPending}
              className="bg-red-700 hover:bg-red-800 text-white text-xs h-10 px-5 gap-2"
            >
              {(isSubmitting || createAthlete.isPending || updateAthlete.isPending) && (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              )}
              {isEdit ? 'Simpan Perubahan' : 'Daftarkan Atlet'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
