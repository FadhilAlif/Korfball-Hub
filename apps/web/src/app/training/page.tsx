'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import {
  useGetTrainingSessions,
  useCreateTrainingSession,
  useDeleteTrainingSession,
  useAddDrill,
  TrainingSession,
} from '@/hooks/useTraining';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Trash2,
  CheckCircle2,
  Activity,
  Flame,
  Dumbbell,
  Flag,
  ChevronRight,
  ClipboardCheck,
  Loader2,
  AlertCircle,
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
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const sessionSchema = z.object({
  session_date: z.string().min(1, 'Tanggal wajib diisi'),
  start_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format jam HH:mm (cth: 15:30)'),
  end_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format jam HH:mm (cth: 17:30)'),
  venue: z.string().min(2, 'Lokasi lapangan wajib diisi'),
  objective: z.string().min(3, 'Target objektif latihan wajib diisi'),
  notes: z.string().optional().or(z.literal('')),
  activities: z
    .array(
      z.object({
        activity_name: z.string().min(2, 'Nama drill wajib diisi'),
        category: z.string().min(1, 'Kategori drill wajib diisi'),
        duration: z.coerce.number().min(1, 'Min 1 menit'),
        objective: z.string().optional(),
      }),
    )
    .optional(),
});

type SessionFormData = z.infer<typeof sessionSchema>;

const addDrillSchema = z.object({
  activity_name: z.string().min(2, 'Nama drill wajib diisi'),
  category: z.string().min(1, 'Kategori drill wajib diisi'),
  duration: z.coerce.number().min(1, 'Durasi minimal 1 menit'),
  objective: z.string().optional().or(z.literal('')),
});

type AddDrillFormData = z.infer<typeof addDrillSchema>;

function TrainingContent() {
  const { data: response, isLoading } = useGetTrainingSessions();
  const createSession = useCreateTrainingSession();
  const deleteSession = useDeleteTrainingSession();
  const addDrill = useAddDrill();

  const sessions = response || [];

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [drillModalSessionId, setDrillModalSessionId] = useState<string | null>(null);

  // Form: Buat Sesi Baru
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema) as any,
    defaultValues: {
      session_date: '',
      start_time: '15:30',
      end_time: '17:30',
      venue: 'GOR Sasana Krida Bantul',
      objective: 'Transisi Cepat 2-Zona & Shooting Precision Jarak Jauh',
      notes: '',
      activities: [
        { activity_name: 'Dynamic Warmup & Stretch', category: 'WARMUP', duration: 15 },
        { activity_name: 'Drill Tembakan 3-Point & Free Pass', category: 'TECHNICAL', duration: 35 },
        { activity_name: 'Scrimmage Game 2-Zona IKF', category: 'TACTICAL', duration: 45 },
        { activity_name: 'Sprint Shuttle & Agility', category: 'CONDITIONING', duration: 15 },
        { activity_name: 'Cooldown & Tactical Debrief', category: 'COOLDOWN', duration: 10 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'activities',
  });

  // Form: Tambah Drill Mandiri
  const {
    register: registerDrill,
    handleSubmit: handleSubmitDrill,
    reset: resetDrill,
    formState: { errors: drillErrors, isSubmitting: isSubmittingDrill },
  } = useForm<AddDrillFormData>({
    resolver: zodResolver(addDrillSchema) as any,
    defaultValues: {
      activity_name: '',
      category: 'TACTICAL',
      duration: 20,
      objective: '',
    },
  });

  const onSubmitSession = async (data: SessionFormData) => {
    try {
      const startIso = `${data.session_date}T${data.start_time}:00.000Z`;
      const endIso = `${data.session_date}T${data.end_time}:00.000Z`;

      await createSession.mutateAsync({
        session_date: data.session_date,
        start_datetime: startIso,
        end_datetime: endIso,
        venue: data.venue,
        objective: data.objective,
        notes: data.notes || null,
        activities: (data.activities || []).map((act, idx) => ({
          activity_name: act.activity_name,
          category: act.category,
          duration: Number(act.duration),
          objective: act.objective || null,
          sequence: idx + 1,
        })),
      });

      setIsCreateOpen(false);
      reset();
    } catch (err: any) {
      console.error('Failed to create session:', err);
    }
  };

  const onSubmitDrill = async (data: AddDrillFormData) => {
    if (!drillModalSessionId) return;
    try {
      await addDrill.mutateAsync({
        sessionId: drillModalSessionId,
        data: {
          activity_name: data.activity_name,
          category: data.category,
          duration: Number(data.duration),
          objective: data.objective || null,
          sequence: 99,
        },
      });
      setDrillModalSessionId(null);
      resetDrill();
    } catch (err) {
      console.error('Failed to add drill:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-slate-900">
      <Sidebar />

      <div className="pl-72">
        <Header title="Sessions & Drills" category="Training Operations" />

        <main className="w-full pt-16 min-h-screen p-8">
          <div className="flex flex-col w-full max-w-7xl mx-auto space-y-6">
            {/* Top Navigation Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <span>Training Operations</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                  <span className="font-semibold text-slate-900">Sessions & Drills Planner</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
                  Perencanaan Sesi Latihan & Pembagian Drill
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <Link href="/attendance">
                  <Button
                    variant="outline"
                    className="bg-white hover:bg-slate-50 border-slate-200 text-xs font-semibold h-10 px-3.5 gap-2 text-slate-700 shadow-xs"
                  >
                    <ClipboardCheck className="w-4 h-4 text-slate-500" />
                    <span>Attendance Logger</span>
                  </Button>
                </Link>
                <Button
                  onClick={() => setIsCreateOpen(true)}
                  className="bg-[#b91c1c] hover:bg-[#991b1b] text-white text-xs font-semibold h-10 px-4 gap-2 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Rancang Sesi Baru</span>
                </Button>
              </div>
            </div>

            {/* Parameter & Compliance Info Banner */}
            <div className="p-4 rounded-2xl bg-white shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Standar Alokasi Sesi Latihan (BR-06 & BR-07)
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Sistem memvalidasi durasi selesai &gt; mulai serta memastikan total menit drill seimbang dengan kuota lapangan.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 self-start md:self-auto">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>BR-06 End &gt; Start Valid</span>
              </div>
            </div>

            {/* Sessions Feed */}
            {isLoading ? (
              <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
                Memuat daftar sesi latihan...
              </div>
            ) : sessions.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
                <Dumbbell className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-700">
                  Belum ada jadwal sesi latihan
                </p>
                <p className="text-xs text-slate-400">
                  Klik tombol &quot;+ Rancang Sesi Baru&quot; untuk membuat rencana latihan tim.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {sessions.map((session) => {
                  const startTimeStr = session.start_datetime
                    ? new Date(session.start_datetime).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '-';
                  const endTimeStr = session.end_datetime
                    ? new Date(session.end_datetime).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '-';

                  const totalDrillsDuration = (session.activities || []).reduce(
                    (acc, act) => acc + act.duration,
                    0,
                  );

                  return (
                    <div
                      key={session.id}
                      className="p-6 rounded-2xl bg-white shadow-xs border border-slate-200/80 space-y-5 hover:shadow-md transition-shadow"
                    >
                      {/* Session Top Bar */}
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-slate-900">
                              {session.objective}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                                session.status === 'COMPLETED'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : session.status === 'CANCELLED'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-blue-50 text-blue-700 border border-blue-200'
                              }`}
                            >
                              {session.status}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1 font-mono">
                              <Calendar className="w-3.5 h-3.5 text-red-600" />
                              {session.session_date}
                            </span>
                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {startTimeStr} - {endTimeStr} WIB
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {session.venue || 'GOR Sasana Krida Bantul'}
                            </span>
                          </div>
                        </div>

                        {/* Quick Stats Pill & Session Actions */}
                        <div className="flex items-center gap-2.5">
                          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono">
                            <span className="text-slate-400">Total Drill:</span>{' '}
                            <strong className="text-slate-900">{totalDrillsDuration} Menit</strong>
                          </div>

                          <Link href={`/attendance?session_id=${session.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-9 px-3 text-xs gap-1.5 border-slate-200 hover:bg-slate-50 text-slate-700"
                            >
                              <ClipboardCheck className="w-3.5 h-3.5 text-red-600" />
                              Presensi ({session.stats?.attendanceRate || 0}%)
                            </Button>
                          </Link>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteSession.mutate(session.id)}
                            className="h-9 w-9 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
                            title="Hapus Sesi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Drill Breakdown Cards */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                            Rangkaian Drill Aktivitas ({session.activities?.length || 0})
                          </span>
                          <button
                            type="button"
                            onClick={() => setDrillModalSessionId(session.id)}
                            className="text-xs font-semibold text-red-700 hover:text-red-800 flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> Tambah Drill
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                          {session.activities?.map((act, index) => (
                            <div
                              key={act.id || index}
                              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-2 hover:bg-slate-100/70 transition-colors"
                            >
                              <div className="flex items-start justify-between gap-1">
                                <span className="font-mono text-[10px] font-bold text-red-700">
                                  #{index + 1}
                                </span>
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-white text-slate-600 border border-slate-200">
                                  {act.duration} Min
                                </span>
                              </div>
                              <div className="min-w-0">
                                <span className="text-xs font-bold text-slate-900 block truncate">
                                  {act.activity_name}
                                </span>
                                <span className="text-[10px] text-slate-500 font-medium uppercase">
                                  {act.category}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal Buat Sesi Baru */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white p-6 rounded-2xl border border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-red-600" />
              Rancang Jadwal Sesi Latihan Baru
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Tentukan slot waktu (BR-06), lokasi lapangan, dan rangkaian drill aktivitas terstruktur.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmitSession)} className="space-y-4 mt-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="session_date" className="text-xs font-semibold text-slate-700">
                  Tanggal Latihan <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="session_date"
                  type="date"
                  {...register('session_date')}
                  className="h-9 text-xs"
                />
                {errors.session_date && (
                  <p className="text-[10px] text-red-500">{errors.session_date.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="start_time" className="text-xs font-semibold text-slate-700">
                  Waktu Mulai (HH:mm) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="start_time"
                  placeholder="15:30"
                  {...register('start_time')}
                  className="h-9 text-xs font-mono"
                />
                {errors.start_time && (
                  <p className="text-[10px] text-red-500">{errors.start_time.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="end_time" className="text-xs font-semibold text-slate-700">
                  Waktu Selesai (HH:mm) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="end_time"
                  placeholder="17:30"
                  {...register('end_time')}
                  className="h-9 text-xs font-mono"
                />
                {errors.end_time && (
                  <p className="text-[10px] text-red-500">{errors.end_time.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="venue" className="text-xs font-semibold text-slate-700">
                Lokasi / Venue Lapangan <span className="text-red-500">*</span>
              </Label>
              <Input
                id="venue"
                placeholder="GOR Sasana Krida Bantul"
                {...register('venue')}
                className="h-9 text-xs"
              />
              {errors.venue && (
                <p className="text-[10px] text-red-500">{errors.venue.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="objective" className="text-xs font-semibold text-slate-700">
                Target Objektif Latihan <span className="text-red-500">*</span>
              </Label>
              <Input
                id="objective"
                placeholder="cth: Transisi Cepat 2-Zona & Shooting Precision"
                {...register('objective')}
                className="h-9 text-xs"
              />
              {errors.objective && (
                <p className="text-[10px] text-red-500">{errors.objective.message}</p>
              )}
            </div>

            {/* Drill Builder Sub-section */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 block">
                  Alokasi Drill Latihan ({fields.length})
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      activity_name: 'Drill Baru',
                      category: 'TECHNICAL',
                      duration: 15,
                    })
                  }
                  className="h-7 text-[11px] px-2 border-slate-300"
                >
                  + Tambah Baris Drill
                </Button>
              </div>

              <div className="space-y-2">
                {fields.map((field, idx) => (
                  <div
                    key={field.id}
                    className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200"
                  >
                    <span className="font-mono text-xs font-bold text-slate-400 w-5">
                      #{idx + 1}
                    </span>
                    <Input
                      placeholder="Nama Drill"
                      {...register(`activities.${idx}.activity_name` as const)}
                      className="h-8 text-xs flex-1"
                    />
                    <select
                      {...register(`activities.${idx}.category` as const)}
                      className="h-8 px-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none"
                    >
                      <option value="WARMUP">Warmup</option>
                      <option value="TECHNICAL">Technical</option>
                      <option value="TACTICAL">Tactical</option>
                      <option value="CONDITIONING">Conditioning</option>
                      <option value="COOLDOWN">Cooldown</option>
                    </select>
                    <div className="flex items-center gap-1 w-24">
                      <Input
                        type="number"
                        min={1}
                        placeholder="Menit"
                        {...register(`activities.${idx}.duration` as const)}
                        className="h-8 text-xs font-mono"
                      />
                      <span className="text-[11px] text-slate-400">m</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(idx)}
                      className="text-slate-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="text-xs h-9 px-3"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || createSession.isPending}
                className="bg-red-700 hover:bg-red-800 text-white text-xs h-9 px-4 gap-1.5"
              >
                {(isSubmitting || createSession.isPending) && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                Publikasikan Sesi
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Tambah Drill ke Sesi Tertentu */}
      <Dialog
        open={!!drillModalSessionId}
        onOpenChange={(open) => !open && setDrillModalSessionId(null)}
      >
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl border border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-red-600" />
              Tambah Drill Baru ke Sesi
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Rancang aktivitas drill spesifik untuk sesi ini.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitDrill(onSubmitDrill)} className="space-y-3 mt-2">
            <div className="space-y-1">
              <Label htmlFor="drill_name" className="text-xs font-semibold text-slate-700">
                Nama Aktivitas / Drill
              </Label>
              <Input
                id="drill_name"
                placeholder="cth: Shooting Running-in Drill"
                {...registerDrill('activity_name')}
                className="h-9 text-xs"
              />
              {drillErrors.activity_name && (
                <p className="text-[10px] text-red-500">{drillErrors.activity_name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="drill_category" className="text-xs font-semibold text-slate-700">
                  Kategori
                </Label>
                <select
                  id="drill_category"
                  {...registerDrill('category')}
                  className="w-full h-9 px-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none"
                >
                  <option value="WARMUP">Warmup</option>
                  <option value="TECHNICAL">Technical</option>
                  <option value="TACTICAL">Tactical</option>
                  <option value="CONDITIONING">Conditioning</option>
                  <option value="COOLDOWN">Cooldown</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="drill_duration" className="text-xs font-semibold text-slate-700">
                  Durasi (Menit)
                </Label>
                <Input
                  id="drill_duration"
                  type="number"
                  min={1}
                  {...registerDrill('duration')}
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="drill_objective" className="text-xs font-semibold text-slate-700">
                Target Drill (Opsional)
              </Label>
              <Input
                id="drill_objective"
                placeholder="cth: Akurasi tembakan sudut 45 derajat"
                {...registerDrill('objective')}
                className="h-9 text-xs"
              />
            </div>

            <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDrillModalSessionId(null)}
                className="text-xs h-9 px-3"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingDrill || addDrill.isPending}
                className="bg-red-700 hover:bg-red-800 text-white text-xs h-9 px-4 gap-1.5"
              >
                Simpan Drill
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function TrainingPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-xs text-slate-500">Memuat sesi latihan...</div>}>
      <TrainingContent />
    </React.Suspense>
  );
}
