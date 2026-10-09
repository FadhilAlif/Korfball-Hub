'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import {
  useGetMatches,
  useGetMatch,
  useCreateMatch,
  useAssignSquad,
  useRecordMatchEvent,
  useFinalizeMatch,
  Match,
} from '@/hooks/useMatches';
import { useGetAthletes, Athlete } from '@/hooks/useAthletes';
import { useGetTeam } from '@/hooks/useTeams';
import {
  Trophy,
  Calendar,
  Clock,
  MapPin,
  Shield,
  Plus,
  Flame,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Crown,
  FileDown,
  Lock,
  Sparkles,
  Users,
  Activity,
  Loader2,
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

const createMatchSchema = z.object({
  opponent: z.string().min(2, 'Nama lawan wajib diisi'),
  competition: z.string().min(2, 'Nama kompetisi wajib diisi'),
  match_date: z.string().min(1, 'Tanggal wajib diisi'),
  start_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format jam HH:mm (cth: 16:00)'),
  venue: z.string().min(2, 'Venue wajib diisi'),
  home_away: z.enum(['HOME', 'AWAY', 'NEUTRAL']),
  notes: z.string().optional().or(z.literal('')),
});

type CreateMatchFormData = z.infer<typeof createMatchSchema>;

const recordGoalSchema = z.object({
  athlete_id: z.string().min(1, 'Pilih atlet pencetak gol'),
  event_time: z.coerce.number().min(0, 'Menit minimal 0').max(120, 'Menit maksimal 120'),
  shot_type: z.enum(['RUNNING_IN', 'DISTANCE', 'FREE_THROW', 'PENALTY']),
  notes: z.string().optional().or(z.literal('')),
});

type RecordGoalFormData = z.infer<typeof recordGoalSchema>;

const finalizeSchema = z.object({
  team_score: z.coerce.number().min(0),
  opponent_score: z.coerce.number().min(0),
});

type FinalizeFormData = z.infer<typeof finalizeSchema>;

function MatchesContent() {
  const { data: teamData } = useGetTeam();
  const activeSeason = teamData?.seasons?.find((s) => s.is_active);

  const { data: matchesData, isLoading: isLoadingMatches } = useGetMatches(activeSeason?.id);
  const matches = matchesData?.items || [];
  const summary = matchesData?.summary || { totalMatches: 0, wins: 0, losses: 0, draws: 0, winRate: 0 };

  const [selectedMatchId, setSelectedMatchId] = useState<string>('');

  // Default select first match
  useEffect(() => {
    if (!selectedMatchId && matches.length > 0) {
      setSelectedMatchId(matches[0].id);
    }
  }, [matches, selectedMatchId]);

  const { data: selectedMatch, isLoading: isLoadingMatch } = useGetMatch(selectedMatchId);
  const { data: athletesResponse } = useGetAthletes();
  const allAthletes: Athlete[] = athletesResponse?.items || [];

  const createMatch = useCreateMatch();
  const assignSquad = useAssignSquad();
  const recordEvent = useRecordMatchEvent();
  const finalizeMatch = useFinalizeMatch();

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isGoalOpen, setIsGoalOpen] = useState(false);
  const [isSquadOpen, setIsSquadOpen] = useState(false);
  const [isFinalizeOpen, setIsFinalizeOpen] = useState(false);

  // Form: Buat Jadwal Pertandingan
  const {
    register: registerMatch,
    handleSubmit: handleSubmitMatch,
    reset: resetMatch,
    formState: { errors: matchErrors, isSubmitting: isSubmittingMatch },
  } = useForm<CreateMatchFormData>({
    resolver: zodResolver(createMatchSchema) as any,
    defaultValues: {
      opponent: 'Korfball Sleman',
      competition: 'Porda DIY 2026',
      match_date: '',
      start_time: '16:00',
      venue: 'GOR Sasana Krida Bantul',
      home_away: 'HOME',
      notes: 'Laga krusial semifinal Porda DIY 2026',
    },
  });

  // Form: Catat Gol Korfball (+1)
  const {
    register: registerGoal,
    handleSubmit: handleSubmitGoal,
    reset: resetGoal,
    formState: { errors: goalErrors, isSubmitting: isSubmittingGoal },
  } = useForm<RecordGoalFormData>({
    resolver: zodResolver(recordGoalSchema) as any,
    defaultValues: {
      athlete_id: '',
      event_time: 15,
      shot_type: 'DISTANCE',
      notes: '',
    },
  });

  // Form: Finalisasi Laga
  const {
    register: registerFinalize,
    handleSubmit: handleSubmitFinalize,
    formState: { isSubmitting: isSubmittingFinalize },
  } = useForm<FinalizeFormData>({
    resolver: zodResolver(finalizeSchema) as any,
    values: selectedMatch
      ? {
          team_score: selectedMatch.team_score ?? 0,
          opponent_score: selectedMatch.opponent_score ?? 0,
        }
      : undefined,
  });

  // Local state for squad picker
  const [selectedSquadAthletes, setSelectedSquadAthletes] = useState<
    Array<{ athlete_id: string; squad_status: 'STARTING' | 'SUBSTITUTE'; is_captain: boolean }>
  >([]);

  useEffect(() => {
    if (selectedMatch?.squad) {
      setSelectedSquadAthletes(
        selectedMatch.squad.map((s) => ({
          athlete_id: s.athlete_id,
          squad_status: s.squad_status as any,
          is_captain: s.is_captain,
        })),
      );
    } else {
      setSelectedSquadAthletes([]);
    }
  }, [selectedMatch]);

  // Submission Handlers
  const onSubmitMatch = async (data: CreateMatchFormData) => {
    try {
      const created = await createMatch.mutateAsync({
        opponent: data.opponent,
        competition: data.competition,
        match_date: data.match_date,
        start_time: data.start_time,
        venue: data.venue,
        home_away: data.home_away,
        season_id: activeSeason?.id,
        notes: data.notes || null,
      });
      setIsCreateOpen(false);
      resetMatch();
      setSelectedMatchId(created.id);
    } catch (err) {
      console.error('Failed to create match:', err);
    }
  };

  const onSubmitGoal = async (data: RecordGoalFormData) => {
    if (!selectedMatchId) return;
    try {
      await recordEvent.mutateAsync({
        matchId: selectedMatchId,
        athleteId: data.athlete_id,
        eventType: 'GOAL',
        eventTime: Number(data.event_time),
        shotType: data.shot_type,
        notes: data.notes || undefined,
      });
      setIsGoalOpen(false);
      resetGoal();
    } catch (err) {
      console.error('Failed to record goal:', err);
    }
  };

  const onSubmitFinalize = async (data: FinalizeFormData) => {
    if (!selectedMatchId) return;
    try {
      await finalizeMatch.mutateAsync({
        matchId: selectedMatchId,
        teamScore: Number(data.team_score),
        opponentScore: Number(data.opponent_score),
      });
      setIsFinalizeOpen(false);
    } catch (err) {
      console.error('Failed to finalize match:', err);
    }
  };

  const handleSaveSquad = async () => {
    if (!selectedMatchId) return;
    try {
      await assignSquad.mutateAsync({
        matchId: selectedMatchId,
        squad: selectedSquadAthletes,
      });
      setIsSquadOpen(false);
    } catch (err) {
      console.error('Failed to assign squad:', err);
    }
  };

  const toggleAthleteInSquad = (athleteId: string, isStarting: boolean) => {
    setSelectedSquadAthletes((prev) => {
      const exists = prev.find((p) => p.athlete_id === athleteId);
      if (exists) {
        if (exists.squad_status === (isStarting ? 'STARTING' : 'SUBSTITUTE')) {
          return prev.filter((p) => p.athlete_id !== athleteId);
        } else {
          return prev.map((p) =>
            p.athlete_id === athleteId
              ? { ...p, squad_status: isStarting ? 'STARTING' : 'SUBSTITUTE' }
              : p,
          );
        }
      } else {
        return [
          ...prev,
          {
            athlete_id: athleteId,
            squad_status: isStarting ? 'STARTING' : 'SUBSTITUTE',
            is_captain: false,
          },
        ];
      }
    });
  };

  // Starters parity calculation for local squad modal
  const squadStartersBreakdown = useMemo(() => {
    const starterIds = selectedSquadAthletes
      .filter((s) => s.squad_status === 'STARTING')
      .map((s) => s.athlete_id);

    let males = 0;
    let females = 0;
    starterIds.forEach((id) => {
      const a = allAthletes.find((ath) => ath.id === id);
      if (a?.gender === 'MALE') males++;
      if (a?.gender === 'FEMALE') females++;
    });

    const isParity = males === 4 && females === 4;
    return { total: starterIds.length, males, females, isParity };
  }, [selectedSquadAthletes, allAthletes]);

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-slate-900">
      <Sidebar />

      <div className="pl-72">
        <Header title="Match Schedules & Results" category="Competition" />

        <main className="w-full pt-16 min-h-screen p-8">
          <div className="flex flex-col w-full max-w-7xl mx-auto space-y-6">
            {/* Top Command Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <span>Competition</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                  <span className="font-semibold text-slate-900">Match Command & Live Ops</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
                  Pencatatan Pertandingan & Squad Builder IKF
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Match Selector Dropdown */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs shadow-xs">
                  <span className="text-slate-400 font-medium">Pilih Laga:</span>
                  <select
                    value={selectedMatchId}
                    onChange={(e) => setSelectedMatchId(e.target.value)}
                    className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer pr-2 text-xs"
                  >
                    {matches.map((m) => (
                      <option key={m.id} value={m.id}>
                        vs {m.opponent} ({m.match_date})
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  onClick={() => setIsCreateOpen(true)}
                  className="bg-[#b91c1c] hover:bg-[#991b1b] text-white text-xs font-semibold h-10 px-4 gap-2 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Jadwal Laga Baru</span>
                </Button>
              </div>
            </div>

            {isLoadingMatches ? (
              <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
                Memuat jadwal pertandingan...
              </div>
            ) : !selectedMatch ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
                <Trophy className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-700">
                  Belum ada jadwal pertandingan
                </p>
                <p className="text-xs text-slate-400">
                  Buat fixture laga baru untuk memulai susunan skuad dan pencatatan gol live.
                </p>
              </div>
            ) : (
              <>
                {/* Fixture Command Stage & Scoreboard */}
                <div className="relative overflow-hidden bg-white rounded-3xl shadow-sm border border-slate-200 p-6 space-y-6">
                  {/* Top ribbon: breadcrumb & live badge */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                      <Trophy className="w-4 h-4 text-red-600" />
                      <span>{selectedMatch.competition || 'Kejuaraan Korfball DIY'}</span>
                      <span className="text-slate-300">/</span>
                      <span className="font-semibold text-slate-900">{selectedMatch.venue}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold ${
                          selectedMatch.status === 'LIVE'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : selectedMatch.status === 'COMPLETED'
                            ? 'bg-slate-100 text-slate-800'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {selectedMatch.status === 'LIVE' && (
                          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                        )}
                        {selectedMatch.status}
                      </span>
                    </div>
                  </div>

                  {/* Big Matchup Stage */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    {/* Home: Korfball Bantul */}
                    <div className="lg:col-span-4 flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 text-white flex items-center justify-center font-mono font-black text-xl shadow-md shadow-red-900/30 flex-shrink-0">
                        BAN
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-bold text-slate-900 truncate">Korfball Bantul</h2>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700">
                            {selectedMatch.home_away}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 block truncate">
                          Pelatih: Coach Fadhil • Formasi 4M/4F
                        </span>
                      </div>
                    </div>

                    {/* Center Board: Big Digits & BR-14 Auto Result */}
                    <div className="lg:col-span-4 flex flex-col items-center justify-center py-3 px-6 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-center gap-6">
                        <span className="text-4xl font-black font-mono text-red-700">
                          {selectedMatch.team_score ?? 0}
                        </span>
                        <span className="text-xs font-mono font-bold uppercase text-slate-400">
                          VS
                        </span>
                        <span className="text-4xl font-black font-mono text-slate-800">
                          {selectedMatch.opponent_score ?? 0}
                        </span>
                      </div>

                      {/* Calculated Outcome Badge (BR-14) */}
                      <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold">
                        {selectedMatch.result === 'WIN' ? (
                          <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            MENANG (BR-14)
                          </span>
                        ) : selectedMatch.result === 'LOSS' ? (
                          <span className="text-rose-700 font-bold bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                            TERTINGGAL / KALAH (BR-14)
                          </span>
                        ) : (
                          <span className="text-slate-700 font-bold bg-slate-100 px-2.5 py-0.5 rounded-full">
                            KEDUDUKAN SERI (BR-14)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Away: Opponent */}
                    <div className="lg:col-span-4 flex items-center justify-start lg:justify-end gap-4">
                      <div className="min-w-0 text-left lg:text-right">
                        <h2 className="text-xl font-bold text-slate-900 truncate">
                          {selectedMatch.opponent}
                        </h2>
                        <span className="text-xs text-slate-500 block truncate">
                          Tim Lawan Kompetisi
                        </span>
                      </div>
                      <div className="w-14 h-14 rounded-2xl bg-slate-700 text-white flex items-center justify-center font-mono font-black text-xl shadow-md flex-shrink-0">
                        OPP
                      </div>
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        onClick={() => setIsGoalOpen(true)}
                        className="bg-red-700 hover:bg-red-800 text-white text-xs font-semibold h-9 px-4 gap-2 shadow-xs"
                      >
                        <Flame className="w-4 h-4" />
                        <span>Catat Gol Korfball (+1)</span>
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => setIsSquadOpen(true)}
                        className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold h-9 px-3.5 gap-2"
                      >
                        <Users className="w-4 h-4" />
                        <span>Susun Skuad Laga</span>
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsFinalizeOpen(true)}
                        className="bg-slate-900 hover:bg-black text-white text-xs font-semibold h-9 px-4 gap-1.5"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Kunci & Selesaikan Laga</span>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* 2-Column Pitch & Live Event Feed */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                  {/* Left Column: IKF Squad Breakdown (7 cols) */}
                  <div className="xl:col-span-7 space-y-5">
                    {/* Compliance Alert Box (Soft Warning per Q2 decision) */}
                    <div
                      className={`p-4 rounded-2xl border flex items-start gap-3 ${
                        selectedMatch.ikfCompliance?.isCompliant
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : 'bg-amber-50 border-amber-200 text-amber-900'
                      }`}
                    >
                      {selectedMatch.ikfCompliance?.isCompliant ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="space-y-1 text-xs">
                        <span className="font-bold block">
                          Pemeriksaan Regulasi IKF (Paritas Gender 4M / 4F)
                        </span>
                        <p className="leading-relaxed">
                          {selectedMatch.ikfCompliance?.message ||
                            'Standar resmi IKF: 8 pemain starter (4 Putra & 4 Putri).'}
                        </p>
                      </div>
                    </div>

                    {/* Starter 8 Players Cards */}
                    <div className="p-5 rounded-2xl bg-white shadow-xs border border-slate-200 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-red-600" />
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
                            Susunan Pemain Inti (Starting 8)
                          </h3>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-600">
                          {selectedMatch.ikfCompliance?.totalStarters || 0} / 8 Pemain
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(selectedMatch.squad || [])
                          .filter((s) => s.squad_status === 'STARTING')
                          .map((member) => (
                            <div
                              key={member.id}
                              className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div
                                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                                    member.athlete?.gender === 'MALE'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-purple-100 text-purple-800'
                                  }`}
                                >
                                  {member.athlete?.full_name?.charAt(0) || 'P'}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1">
                                    <span className="font-mono text-xs font-bold text-red-700">
                                      #{member.athlete?.jersey_number}
                                    </span>
                                    <span className="font-bold text-xs text-slate-900 truncate">
                                      {member.athlete?.full_name}
                                    </span>
                                    {member.is_captain && (
                                      <Crown className="w-3 h-3 text-amber-500" />
                                    )}
                                  </div>
                                  <span className="text-[10px] text-slate-400 block truncate">
                                    {member.athlete?.position || 'Starter'}
                                  </span>
                                </div>
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                                  member.athlete?.gender === 'MALE'
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'bg-purple-50 text-purple-700'
                                }`}
                              >
                                {member.athlete?.gender === 'MALE' ? '4M' : '4F'}
                              </span>
                            </div>
                          ))}
                      </div>

                      {/* Substitutes Bench */}
                      <div className="pt-3 border-t border-slate-100 space-y-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                          Bangku Cadangan & Rotasi
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {(selectedMatch.squad || [])
                            .filter((s) => s.squad_status === 'SUBSTITUTE')
                            .map((member) => (
                              <span
                                key={member.id}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-700 font-medium"
                              >
                                #{member.athlete?.jersey_number} {member.athlete?.full_name}
                              </span>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Live Event Timeline (5 cols) */}
                  <div className="xl:col-span-5 space-y-5">
                    <div className="p-5 rounded-2xl bg-white shadow-xs border border-slate-200 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-red-600" />
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
                            Live Match Events Timeline
                          </h3>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-600">
                          {selectedMatch.events?.length || 0} Gol
                        </span>
                      </div>

                      {/* Events List */}
                      <div className="space-y-3">
                        {(selectedMatch.events || []).length === 0 ? (
                          <div className="py-8 text-center text-xs text-slate-400">
                            Belum ada skor yang dicatat. Klik &quot;Catat Gol Korfball (+1)&quot; untuk memasukkan gol.
                          </div>
                        ) : (
                          (selectedMatch.events || []).map((evt) => (
                            <div
                              key={evt.id}
                              className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-mono font-bold text-xs">
                                  {evt.event_time}&apos;
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-xs text-slate-900">
                                      {evt.athlete?.full_name}
                                    </span>
                                    <span className="font-mono text-xs text-red-700 font-bold">
                                      #{evt.athlete?.jersey_number}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-slate-500 block">
                                    {evt.notes || 'Gol Korfball Sukses'}
                                  </span>
                                </div>
                              </div>
                              <span className="text-xs font-mono font-bold text-red-700">+1 GOL</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Modal Buat Pertandingan Baru */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl border border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-red-600" />
              Buat Jadwal Laga Baru
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Jadwalkan pertandingan kejuaraan atau laga persahabatan.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitMatch(onSubmitMatch)} className="space-y-3 mt-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Nama Tim Lawan *</Label>
              <Input
                placeholder="cth: Korfball Sleman"
                {...registerMatch('opponent')}
                className="h-9 text-xs"
              />
              {matchErrors.opponent && (
                <p className="text-[10px] text-red-500">{matchErrors.opponent.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Nama Turnamen *</Label>
              <Input
                placeholder="cth: Porda DIY 2026"
                {...registerMatch('competition')}
                className="h-9 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Tanggal *</Label>
                <Input type="date" {...registerMatch('match_date')} className="h-9 text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Jam Kick-off *</Label>
                <Input placeholder="16:00" {...registerMatch('start_time')} className="h-9 text-xs font-mono" />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Lokasi / Venue *</Label>
              <Input placeholder="GOR Sasana Krida Bantul" {...registerMatch('venue')} className="h-9 text-xs" />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Status Venue</Label>
              <select
                {...registerMatch('home_away')}
                className="w-full h-9 px-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-800"
              >
                <option value="HOME">Tuan Rumah (HOME)</option>
                <option value="AWAY">Tandang (AWAY)</option>
                <option value="NEUTRAL">Netral (NEUTRAL)</option>
              </select>
            </div>

            <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="text-xs h-9 px-3">
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingMatch || createMatch.isPending}
                className="bg-red-700 hover:bg-red-800 text-white text-xs h-9 px-4"
              >
                Simpan Jadwal
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Catat Gol Korfball (+1) dengan Shot Type */}
      <Dialog open={isGoalOpen} onOpenChange={setIsGoalOpen}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl border border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Flame className="w-4 h-4 text-red-600" />
              Catat Skor Gol Korfball (+1)
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Pilih atlet pencetak skor dan jenis tembakan (Q3: Shot Type).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitGoal(onSubmitGoal)} className="space-y-3 mt-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Atlet Pencetak Gol *</Label>
              <select
                {...registerGoal('athlete_id')}
                className="w-full h-9 px-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-800"
              >
                <option value="">-- Pilih Atlet --</option>
                {allAthletes.map((a) => (
                  <option key={a.id} value={a.id}>
                    #{a.jersey_number} {a.full_name} ({a.gender === 'MALE' ? 'Putra' : 'Putri'})
                  </option>
                ))}
              </select>
              {goalErrors.athlete_id && (
                <p className="text-[10px] text-red-500">{goalErrors.athlete_id.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Menit Pertandingan</Label>
                <Input type="number" min={0} max={120} {...registerGoal('event_time')} className="h-9 text-xs font-mono" />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Tipe Tembakan (Q3)</Label>
                <select
                  {...registerGoal('shot_type')}
                  className="w-full h-9 px-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-800"
                >
                  <option value="DISTANCE">Distance shot (Jarak Jauh)</option>
                  <option value="RUNNING_IN">Running-in shot</option>
                  <option value="FREE_THROW">Free throw (Lemparan Bebas)</option>
                  <option value="PENALTY">Penalty</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Catatan Taktis</Label>
              <Input placeholder="cth: Assist dari Anisa Nuraini" {...registerGoal('notes')} className="h-9 text-xs" />
            </div>

            <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsGoalOpen(false)} className="text-xs h-9 px-3">
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingGoal || recordEvent.isPending}
                className="bg-red-700 hover:bg-red-800 text-white text-xs h-9 px-4"
              >
                Catat Gol (+1)
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Susun Skuad Pertandingan (Starting 8 & Cadangan) */}
      <Dialog open={isSquadOpen} onOpenChange={setIsSquadOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-white p-6 rounded-2xl border border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-red-600" />
              Susun Skuad Pertandingan & Kepatuhan IKF
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Pilih 8 pemain inti (Starter) dan pemain cadangan. Regulasi IKF mewajibkan 4 Putra & 4 Putri.
            </DialogDescription>
          </DialogHeader>

          {/* Parity Status Badge */}
          <div
            className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
              squadStartersBreakdown.isParity
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            <div>
              <strong>Status Starter:</strong> {squadStartersBreakdown.males} Putra / {squadStartersBreakdown.females} Putri (Total: {squadStartersBreakdown.total} dari 8)
            </div>
            <span className="font-mono font-bold">
              {squadStartersBreakdown.isParity ? '100% IKF Parity' : 'Soft Warning (Q2)'}
            </span>
          </div>

          <div className="space-y-2 mt-2">
            {allAthletes.map((a) => {
              const inSquad = selectedSquadAthletes.find((s) => s.athlete_id === a.id);
              const isStarter = inSquad?.squad_status === 'STARTING';
              const isSub = inSquad?.squad_status === 'SUBSTITUTE';

              return (
                <div
                  key={a.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-red-700 w-8">#{a.jersey_number}</span>
                    <span className="font-bold text-slate-900">{a.full_name}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                        a.gender === 'MALE' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {a.gender === 'MALE' ? 'M' : 'F'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleAthleteInSquad(a.id, true)}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                        isStarter ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white border text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Starter
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleAthleteInSquad(a.id, false)}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                        isSub ? 'bg-blue-600 text-white shadow-xs' : 'bg-white border text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Cadangan
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsSquadOpen(false)} className="text-xs h-9 px-3">
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleSaveSquad}
              disabled={assignSquad.isPending}
              className="bg-red-700 hover:bg-red-800 text-white text-xs h-9 px-4"
            >
              Simpan Skuad Laga
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Finalisasi Laga */}
      <Dialog open={isFinalizeOpen} onOpenChange={setIsFinalizeOpen}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl border border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-900" />
              Kunci & Selesaikan Pertandingan
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Konfirmasi skor akhir pertandingan. Hasil (WIN/LOSS/DRAW) akan dihitung otomatis oleh sistem backend (BR-14).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitFinalize(onSubmitFinalize)} className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Skor Akhir Bantul</Label>
                <Input type="number" min={0} {...registerFinalize('team_score')} className="h-9 text-xs font-mono font-bold" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Skor Akhir Lawan</Label>
                <Input type="number" min={0} {...registerFinalize('opponent_score')} className="h-9 text-xs font-mono font-bold" />
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsFinalizeOpen(false)} className="text-xs h-9 px-3">
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingFinalize || finalizeMatch.isPending}
                className="bg-slate-900 hover:bg-black text-white text-xs h-9 px-4"
              >
                Selesaikan Laga
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function MatchesPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-xs text-slate-500">Memuat pertandingan...</div>}>
      <MatchesContent />
    </React.Suspense>
  );
}
