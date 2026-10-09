'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { useGetTeam } from '@/hooks/useTeams';
import { useGetAthletes, Athlete } from '@/hooks/useAthletes';
import { useGetMatches } from '@/hooks/useMatches';
import { useGetTrainingStats, useGetTrainingSessions } from '@/hooks/useTraining';
import {
  Users,
  Calendar,
  Trophy,
  Shield,
  ArrowRight,
  ChevronRight,
  Activity,
  HeartPulse,
  Sparkles,
  Timer,
  TrendingUp,
  Download,
  Dumbbell,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  RefreshCw,
  Plus,
  FileSpreadsheet,
  FileText,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

function DashboardContent() {
  const router = useRouter();
  const { data: team } = useGetTeam();
  const activeSeason = team?.seasons?.find((s) => s.is_active);
  const { data: athletesData } = useGetAthletes({ season_id: activeSeason?.id });
  const { data: matchesData } = useGetMatches(activeSeason?.id);
  const { data: trainingStats } = useGetTrainingStats();
  const { data: trainingSessions } = useGetTrainingSessions({ limit: 5 });

  // UI Interactive States
  const [isZoneSwapped, setIsZoneSwapped] = useState(false);
  const [showToast, setShowToast] = useState(true);
  const [todayDateStr, setTodayDateStr] = useState('18 Mar 2026');

  useEffect(() => {
    try {
      const formatted = new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(new Date());
      setTodayDateStr(formatted);
    } catch {
      // fallback
    }
  }, []);

  const athletesSummary = athletesData?.summary || {
    total: 24,
    males: 12,
    females: 12,
    activeFit: 20,
    medicalHold: 2,
  };

  const matchesSummary = matchesData?.summary || {
    totalMatches: 13,
    wins: 11,
    losses: 2,
    draws: 0,
    winRate: 84.6,
  };

  // Readiness rate calculated
  const readinessRate =
    athletesSummary.total > 0
      ? Math.round((athletesSummary.activeFit / athletesSummary.total) * 100)
      : 91.7;

  // Starter Athletes (fallback data if empty from seed)
  const defaultStarters = [
    {
      id: 'ath-1',
      name: 'Rian Hidayat',
      jersey: 7,
      roleDescription: 'Captain • Senior National Pool',
      gender: 'MALE' as const,
      tacticalRole: 'Lead Attacker',
      defaultZone: 'Zone 1 (Attack)',
      form: ['W', 'W', 'W', 'L', 'W'],
      healthStatus: 'Cleared (100%)',
      healthVariant: 'emerald' as const,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'ath-2',
      name: 'Anisa Nuraini',
      jersey: 12,
      roleDescription: 'Vice Captain • Intercept Specialist',
      gender: 'FEMALE' as const,
      tacticalRole: 'Anchor Defence',
      defaultZone: 'Zone 2 (Defence)',
      form: ['W', 'W', 'W', 'W', 'W'],
      healthStatus: 'Cleared (98%)',
      healthVariant: 'emerald' as const,
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'ath-3',
      name: 'Dimas Bagus',
      jersey: 4,
      roleDescription: 'Rebound Master • 6.4 Reb/G',
      gender: 'MALE' as const,
      tacticalRole: 'Post Attacker',
      defaultZone: 'Zone 1 (Attack)',
      form: ['L', 'W', 'W', 'W', 'W'],
      healthStatus: 'Cleared (95%)',
      healthVariant: 'emerald' as const,
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'ath-4',
      name: 'Siti Rahmawati',
      jersey: 9,
      roleDescription: 'Perimeter Guard • 78% Shot Contested',
      gender: 'FEMALE' as const,
      tacticalRole: 'Defender',
      defaultZone: 'Zone 2 (Defence)',
      form: ['W', 'W', 'W', 'L', 'L'],
      healthStatus: 'Fatigue Watch',
      healthVariant: 'amber' as const,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'ath-5',
      name: 'Aditya Pratama',
      jersey: 10,
      roleDescription: 'Tactical Pivot • Zone Flex',
      gender: 'MALE' as const,
      tacticalRole: 'All-Round Pivot',
      defaultZone: 'Zone 1 (Attack)',
      form: ['W', 'W', 'W', 'W', 'W'],
      healthStatus: 'Cleared (100%)',
      healthVariant: 'emerald' as const,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'ath-6',
      name: 'Bella Septiana',
      jersey: 15,
      roleDescription: 'Long Distance Shooter • 42% 3-pt',
      gender: 'FEMALE' as const,
      tacticalRole: 'All-Round Wing',
      defaultZone: 'Zone 2 (Defence)',
      form: ['W', 'L', 'W', 'W', 'W'],
      healthStatus: 'Ankle Sprain Gr-1',
      healthVariant: 'rose' as const,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    },
  ];

  // Map real athletes from API if available
  const displayAthletes =
    athletesData?.items && athletesData.items.length >= 4
      ? athletesData.items.slice(0, 6).map((item, idx) => {
          const fallback = defaultStarters[idx % defaultStarters.length];
          const isCaptain = item.rosters?.some((r) => r.is_captain);
          return {
            id: item.id,
            name: item.full_name,
            jersey: item.jersey_number,
            roleDescription:
              isCaptain
                ? 'Captain • Active Roster'
                : `${item.position || 'Starter'} • Bantul Squad`,
            gender: item.gender,
            tacticalRole: item.position || (item.gender === 'MALE' ? 'Attacker' : 'Defender'),
            defaultZone: idx % 2 === 0 ? 'Zone 1 (Attack)' : 'Zone 2 (Defence)',
            form: fallback.form,
            healthStatus:
              item.status === 'ACTIVE'
                ? 'Cleared (100%)'
                : item.status === 'INJURED'
                ? 'Ankle Sprain Gr-1'
                : 'Fatigue Watch',
            healthVariant:
              item.status === 'ACTIVE'
                ? ('emerald' as const)
                : item.status === 'INJURED'
                ? ('rose' as const)
                : ('amber' as const),
            avatar: fallback.avatar,
          };
        })
      : defaultStarters;

  // CSV Exporter for Roster
  const handleDownloadRosterCSV = () => {
    const headers = 'Nomor Punggung,Nama Lengkap,Jenis Kelamin,Peran Taktis,Zona,Status Medis\n';
    const rows = displayAthletes
      .map(
        (a) =>
          `#${a.jersey},"${a.name}",${a.gender},"${a.tacticalRole}","${a.defaultZone}","${a.healthStatus}"`,
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `korfball_bantul_roster_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-slate-900 pb-20">
      <Sidebar />

      <div className="pl-72">
        <Header title="Dashboard" category="Main" />

        <main className="w-full pt-16 min-h-screen p-8">
          <div className="flex flex-col w-full max-w-7xl mx-auto space-y-8">
            {/* Top Match Readiness & Command Bar */}
            <section className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-xs border border-slate-200/80">
              <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-red-600/5 blur-3xl pointer-events-none" />
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex flex-col gap-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-xs font-semibold uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" /> Kejurkab DIY 2026 Ready
                    </span>
                    <span className="font-mono text-xs text-slate-500">
                      IKF Sanctioned • Matchday #08
                    </span>
                  </div>
                  <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                    Tactical Operations <span className="text-red-700 font-normal">/</span> Bantul Regency
                  </h1>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Selamat datang di Korfball Hub. Kesiapan skuad optimal untuk pertandingan kejuaraan berikutnya melawan Sleman Titans. Seluruh 8 starter inti terkonfirmasi memenuhi paritas 4M/4F IKF di kedua zona taktis.
                  </p>
                </div>

                {/* Match Countdown Callout Card */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 min-w-[340px] shadow-xs">
                  <div className="w-12 h-12 rounded-xl bg-[#b91c1c] flex items-center justify-center text-white flex-shrink-0 shadow-md shadow-red-900/20">
                    <Timer className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Final Kejurkab 2026
                      </span>
                      <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 font-bold">
                        T-84h 12m
                      </span>
                    </div>
                    <span className="text-base font-bold text-slate-900 truncate">
                      vs Sleman Titans
                    </span>
                    <span className="text-xs text-slate-500 truncate">
                      Sat, 22 Mar • GOR Sasana Krida
                    </span>
                  </div>
                  <div className="flex flex-col items-end pl-2">
                    <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                      LOCKED
                    </span>
                    <span className="font-mono text-[11px] text-slate-500 mt-1">8/8 Court</span>
                  </div>
                </div>
              </div>

              {/* 4 High-Density Key Performance Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
                {/* 1. Win Rate */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between group hover:shadow-xs transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Win Rate (2026)
                    </span>
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                      <TrendingUp className="w-3 h-3 text-emerald-700" /> +5.2%
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="font-mono text-2xl font-black text-slate-900 tracking-tight">
                      {matchesSummary.winRate}%
                    </span>
                    <span className="text-xs text-slate-500">
                      {matchesSummary.wins}W - {matchesSummary.losses}L
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div
                      className="bg-[#b91c1c] h-full rounded-full transition-all duration-500"
                      style={{ width: `${matchesSummary.winRate}%` }}
                    />
                  </div>
                </div>

                {/* 2. Squad Readiness */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between group hover:shadow-xs transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Squad Readiness
                    </span>
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Fit
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="font-mono text-2xl font-black text-slate-900 tracking-tight">
                      {readinessRate}%
                    </span>
                    <span className="text-xs text-slate-500">
                      {athletesSummary.activeFit}/{athletesSummary.total} Cleared
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${readinessRate}%` }}
                    />
                  </div>
                </div>

                {/* 3. Shot Conversion */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between group hover:shadow-xs transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Shot Conversion
                    </span>
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full font-bold">
                      IKF Avg: 29%
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="font-mono text-2xl font-black text-slate-900 tracking-tight">
                      38.2%
                    </span>
                    <span className="text-xs text-slate-500">184/481 Korfs</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div
                      className="bg-[#b91c1c] h-full rounded-full transition-all duration-500"
                      style={{ width: '38.2%' }}
                    />
                  </div>
                </div>

                {/* 4. Training Attendance */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between group hover:shadow-xs transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Training Attendance
                    </span>
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                      30 Days
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="font-mono text-2xl font-black text-slate-900 tracking-tight">
                      {trainingStats?.overallAttendanceRate || 94.8}%
                    </span>
                    <span className="text-xs text-slate-500">
                      {trainingStats?.totalSessions || 18} Sesi Latihan
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${trainingStats?.overallAttendanceRate || 94.8}%` }}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Section 1: Athletes & Squad Composition */}
            <section className="rounded-2xl bg-white p-6 shadow-xs border border-slate-200/80 flex flex-col gap-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-red-100 text-red-700 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-lg font-bold text-slate-900">
                      Athletes &amp; Squad Composition
                    </h2>
                    <span className="text-xs text-slate-500">
                      Official Bantul Korfball Roster • Standard mixed 4M/4F squad allocation
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 font-mono text-xs text-slate-800">
                    <span className="text-slate-500 font-normal">Total:</span> {athletesSummary.total}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-mono text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Active: {athletesSummary.activeFit}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-800 font-mono text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600" /> Injured: {athletesSummary.medicalHold}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 font-mono text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600" /> Rest: 2
                  </span>
                </div>
              </div>

              {/* Athletes Data Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200/80">
                      <th className="py-3 px-4">Athlete</th>
                      <th className="py-3 px-4">Gender</th>
                      <th className="py-3 px-4">Tactical Role</th>
                      <th className="py-3 px-4">Default Zone</th>
                      <th className="py-3 px-4">Recent Form</th>
                      <th className="py-3 px-4">Health Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {displayAthletes.map((ath) => (
                      <tr key={ath.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <img
                                src={ath.avatar}
                                alt={ath.name}
                                className="w-9 h-9 rounded-full object-cover shadow-xs border border-slate-200"
                              />
                              <span className="absolute -bottom-1 -right-1 font-mono text-[10px] font-bold px-1 rounded bg-[#0E121A] text-white">
                                #{ath.jersey}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-900 leading-tight">
                                {ath.name}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                {ath.roleDescription}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              ath.gender === 'MALE'
                                ? 'bg-sky-50 text-sky-800'
                                : 'bg-purple-50 text-purple-800'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                ath.gender === 'MALE' ? 'bg-sky-600' : 'bg-purple-600'
                              }`}
                            />
                            {ath.gender === 'MALE' ? 'Male' : 'Female'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-800 font-medium">
                          {ath.tacticalRole}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                              ath.defaultZone.includes('Attack')
                                ? 'bg-red-100 text-red-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {ath.defaultZone}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            {ath.form.map((res, i) => (
                              <span
                                key={i}
                                className={`w-2.5 h-2.5 rounded-full ${
                                  res === 'W' ? 'bg-emerald-500' : 'bg-rose-500'
                                }`}
                                title={res === 'W' ? 'Win' : 'Loss'}
                              />
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              ath.healthVariant === 'emerald'
                                ? 'bg-emerald-50 text-emerald-800'
                                : ath.healthVariant === 'amber'
                                ? 'bg-amber-50 text-amber-800'
                                : 'bg-rose-50 text-rose-800'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                ath.healthVariant === 'emerald'
                                  ? 'bg-emerald-600'
                                  : ath.healthVariant === 'amber'
                                  ? 'bg-amber-600'
                                  : 'bg-rose-600'
                              }`}
                            />
                            {ath.healthStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link href={`/athletes`}>
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-slate-600 hover:text-slate-900">
                              Dossier
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Roster Footer Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <span className="text-xs text-slate-500">
                  Menampilkan 6 starter kunci dari {athletesSummary.total} atlet terdaftar
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadRosterCSV}
                    className="h-8 gap-1.5 text-xs text-slate-700"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Roster CSV</span>
                  </Button>
                  <Link href="/athletes">
                    <Button
                      size="sm"
                      className="bg-[#b91c1c] hover:bg-[#991b1b] text-white h-8 gap-1.5 text-xs shadow-xs"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Buka Registry Lengkap ({athletesSummary.total})</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </section>

            {/* Section 2: Competition & Matchday Squad Builder (Dual-Zone Court Visualization) */}
            <section className="rounded-2xl bg-white p-6 shadow-xs border border-slate-200/80 flex flex-col gap-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-red-100 text-red-700 flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-lg font-bold text-slate-900">
                      Upcoming Matchday &amp; Tactical Zone Lineup
                    </h2>
                    <span className="text-xs text-slate-500">
                      Dual-Zone Korfball court allocation (2M + 2F Attack / 2M + 2F Defence)
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                    Starting 8: <span className="text-emerald-700 font-bold">READY (4M / 4F)</span> • Subs: 6 • Drills: 100%
                  </span>
                </div>
              </div>

              {/* Two Column Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Tactical Dual-Zone Pitch Visualizer (7 Cols) */}
                <div className="lg:col-span-7 flex flex-col gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#b91c1c]" />
                      <span className="font-semibold text-slate-900 text-sm">
                        Court Formation: 2-Zone Balanced
                      </span>
                    </div>
                    <span className="font-mono text-xs text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      40m x 20m Standard IKF
                    </span>
                  </div>

                  {/* Korfball Court Graphic Container */}
                  <div className="relative w-full aspect-[16/10] bg-[#1E293B] rounded-xl overflow-hidden p-3 flex flex-col justify-between shadow-inner">
                    {/* Court center dividing line with subtle glow */}
                    <div className="absolute inset-y-0 left-1/2 w-0.5 bg-white/20 transform -translate-x-1/2" />
                    {/* Outer pitch boundaries & center circle */}
                    <div className="absolute inset-4 rounded-lg border border-white/15 pointer-events-none flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full border border-white/15" />
                    </div>

                    {/* Zone Indicators */}
                    <div className="relative z-10 grid grid-cols-2 h-full gap-2">
                      {/* Left Zone (Zone 1 or Swapped) */}
                      <div className="flex flex-col justify-between p-2 rounded-lg bg-emerald-950/25 border border-emerald-500/20">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest bg-emerald-900/60 px-2 py-0.5 rounded font-mono">
                            {isZoneSwapped ? 'Zone 2 • Defence' : 'Zone 1 • Attack'}
                          </span>
                          {/* Post / Korf basket representation */}
                          <div className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded-full bg-amber-500 ring-4 ring-amber-500/20 shadow-md" />
                            <span className="font-mono text-[9px] text-amber-300">Korf (3.5m)</span>
                          </div>
                        </div>

                        {/* 4 Players (2 Male, 2 Female) */}
                        <div className="grid grid-cols-2 gap-2.5 my-auto py-1">
                          {/* Player 1 */}
                          <div className="flex flex-col items-center p-2 rounded-lg bg-slate-900/90 backdrop-blur border border-slate-700/60 shadow-xs">
                            <div className="relative">
                              <span className="w-8 h-8 rounded-full bg-sky-600 text-white font-mono text-xs flex items-center justify-center font-bold">
                                {isZoneSwapped ? '12' : '07'}
                              </span>
                              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-900" />
                            </div>
                            <span className="text-[11px] text-white font-semibold mt-1 truncate max-w-[80px]">
                              {isZoneSwapped ? 'Anisa N.' : 'R. Hidayat'}
                            </span>
                            <span className="font-mono text-[9px] text-sky-400">
                              {isZoneSwapped ? 'F • Defence' : 'M • Attacker'}
                            </span>
                          </div>

                          {/* Player 2 */}
                          <div className="flex flex-col items-center p-2 rounded-lg bg-slate-900/90 backdrop-blur border border-slate-700/60 shadow-xs">
                            <div className="relative">
                              <span className="w-8 h-8 rounded-full bg-purple-600 text-white font-mono text-xs flex items-center justify-center font-bold">
                                {isZoneSwapped ? '10' : '14'}
                              </span>
                              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-900" />
                            </div>
                            <span className="text-[11px] text-white font-semibold mt-1 truncate max-w-[80px]">
                              {isZoneSwapped ? 'Aditya P.' : 'D. Safitri'}
                            </span>
                            <span className="font-mono text-[9px] text-purple-400">
                              {isZoneSwapped ? 'M • Defence' : 'F • Attacker'}
                            </span>
                          </div>

                          {/* Player 3 */}
                          <div className="flex flex-col items-center p-2 rounded-lg bg-slate-900/90 backdrop-blur border border-slate-700/60 shadow-xs">
                            <div className="relative">
                              <span className="w-8 h-8 rounded-full bg-sky-600 text-white font-mono text-xs flex items-center justify-center font-bold">
                                {isZoneSwapped ? '09' : '04'}
                              </span>
                              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-900" />
                            </div>
                            <span className="text-[11px] text-white font-semibold mt-1 truncate max-w-[80px]">
                              {isZoneSwapped ? 'Siti R.' : 'Dimas B.'}
                            </span>
                            <span className="font-mono text-[9px] text-sky-400">
                              {isZoneSwapped ? 'F • Guard' : 'M • Rebound'}
                            </span>
                          </div>

                          {/* Player 4 */}
                          <div className="flex flex-col items-center p-2 rounded-lg bg-slate-900/90 backdrop-blur border border-slate-700/60 shadow-xs">
                            <div className="relative">
                              <span className="w-8 h-8 rounded-full bg-purple-600 text-white font-mono text-xs flex items-center justify-center font-bold">
                                {isZoneSwapped ? '03' : '08'}
                              </span>
                              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-900" />
                            </div>
                            <span className="text-[11px] text-white font-semibold mt-1 truncate max-w-[80px]">
                              {isZoneSwapped ? 'Galih W.' : 'N. Lestari'}
                            </span>
                            <span className="font-mono text-[9px] text-purple-400">
                              {isZoneSwapped ? 'M • Rebound' : 'F • Runner'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-center">
                          <span className="font-mono text-[10px] text-slate-300">
                            Tactical Focus: Fast Pick &amp; Roll
                          </span>
                        </div>
                      </div>

                      {/* Right Zone (Zone 2 or Swapped) */}
                      <div className="flex flex-col justify-between p-2 rounded-lg bg-blue-950/25 border border-blue-500/20">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-sky-400 font-bold uppercase tracking-widest bg-sky-900/60 px-2 py-0.5 rounded font-mono">
                            {isZoneSwapped ? 'Zone 1 • Attack' : 'Zone 2 • Defence'}
                          </span>
                          {/* Post / Korf basket representation */}
                          <div className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded-full bg-amber-500 ring-4 ring-amber-500/20 shadow-md" />
                            <span className="font-mono text-[9px] text-amber-300">Korf (3.5m)</span>
                          </div>
                        </div>

                        {/* 4 Players (2 Male, 2 Female) */}
                        <div className="grid grid-cols-2 gap-2.5 my-auto py-1">
                          {/* Player 5 */}
                          <div className="flex flex-col items-center p-2 rounded-lg bg-slate-900/90 backdrop-blur border border-slate-700/60 shadow-xs">
                            <div className="relative">
                              <span className="w-8 h-8 rounded-full bg-purple-600 text-white font-mono text-xs flex items-center justify-center font-bold">
                                {isZoneSwapped ? '07' : '12'}
                              </span>
                              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-900" />
                            </div>
                            <span className="text-[11px] text-white font-semibold mt-1 truncate max-w-[80px]">
                              {isZoneSwapped ? 'R. Hidayat' : 'Anisa N.'}
                            </span>
                            <span className="font-mono text-[9px] text-purple-400">
                              {isZoneSwapped ? 'M • Attacker' : 'F • Defence'}
                            </span>
                          </div>

                          {/* Player 6 */}
                          <div className="flex flex-col items-center p-2 rounded-lg bg-slate-900/90 backdrop-blur border border-slate-700/60 shadow-xs">
                            <div className="relative">
                              <span className="w-8 h-8 rounded-full bg-sky-600 text-white font-mono text-xs flex items-center justify-center font-bold">
                                {isZoneSwapped ? '14' : '10'}
                              </span>
                              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-900" />
                            </div>
                            <span className="text-[11px] text-white font-semibold mt-1 truncate max-w-[80px]">
                              {isZoneSwapped ? 'D. Safitri' : 'Aditya P.'}
                            </span>
                            <span className="font-mono text-[9px] text-sky-400">
                              {isZoneSwapped ? 'F • Attacker' : 'M • Defence'}
                            </span>
                          </div>

                          {/* Player 7 */}
                          <div className="flex flex-col items-center p-2 rounded-lg bg-slate-900/90 backdrop-blur border border-slate-700/60 shadow-xs">
                            <div className="relative">
                              <span className="w-8 h-8 rounded-full bg-purple-600 text-white font-mono text-xs flex items-center justify-center font-bold">
                                {isZoneSwapped ? '04' : '09'}
                              </span>
                              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-900" />
                            </div>
                            <span className="text-[11px] text-white font-semibold mt-1 truncate max-w-[80px]">
                              {isZoneSwapped ? 'Dimas B.' : 'Siti R.'}
                            </span>
                            <span className="font-mono text-[9px] text-purple-400">
                              {isZoneSwapped ? 'M • Rebound' : 'F • Guard'}
                            </span>
                          </div>

                          {/* Player 8 */}
                          <div className="flex flex-col items-center p-2 rounded-lg bg-slate-900/90 backdrop-blur border border-slate-700/60 shadow-xs">
                            <div className="relative">
                              <span className="w-8 h-8 rounded-full bg-sky-600 text-white font-mono text-xs flex items-center justify-center font-bold">
                                {isZoneSwapped ? '08' : '03'}
                              </span>
                              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-900" />
                            </div>
                            <span className="text-[11px] text-white font-semibold mt-1 truncate max-w-[80px]">
                              {isZoneSwapped ? 'N. Lestari' : 'Galih W.'}
                            </span>
                            <span className="font-mono text-[9px] text-sky-400">
                              {isZoneSwapped ? 'F • Runner' : 'M • Rebound'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-center">
                          <span className="font-mono text-[10px] text-slate-300">
                            Tactical Focus: Strict Man-to-Man Closeout
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 text-xs px-1">
                    <span>*Aturan IKF: Zona beralih setiap 2 skor kumulatif pertandingan.</span>
                    <button
                      onClick={() => setIsZoneSwapped(!isZoneSwapped)}
                      className="text-red-700 font-semibold hover:underline flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{isZoneSwapped ? 'Reset Formasi Normal' : 'Simulasi Zone Swap'}</span>
                    </button>
                  </div>
                </div>

                {/* Right Column: Match Schedule & Rival Tracker (5 Cols) */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-red-600" />
                        <span className="font-bold text-slate-900 text-sm">Next 3 Fixtures</span>
                      </div>
                      <span className="font-mono text-[11px] text-slate-500">DIY Kejurkab &apos;26</span>
                    </div>

                    {/* Fixture 1 */}
                    <div className="p-3 rounded-lg bg-white border border-slate-200/80 shadow-xs flex flex-col gap-2 relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#b91c1c]" />
                      <div className="flex items-center justify-between pl-1">
                        <span className="text-[10px] uppercase font-bold text-red-700 font-mono">
                          Final Match • Kejurkab
                        </span>
                        <span className="font-mono text-[11px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-bold">
                          Ready
                        </span>
                      </div>
                      <div className="flex items-center justify-between pl-1">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-900 text-xs">
                            ST
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">vs Sleman Titans</div>
                            <div className="text-[11px] text-slate-500">H2H: 4W - 1L (Last: W 18-14)</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold text-slate-900 block">Sat, 22 Mar</span>
                          <span className="font-mono text-[11px] text-slate-500">15:30 WIB</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-1.5 pl-1">
                        <span>GOR Sasana Krida Bantul</span>
                        <span className="text-emerald-700 font-semibold">Bus Logistics Confirmed</span>
                      </div>
                    </div>

                    {/* Fixture 2 */}
                    <div className="p-3 rounded-lg bg-white border border-slate-200/80 shadow-xs flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">
                          Matchday 9 • Friendly
                        </span>
                        <span className="font-mono text-[11px] text-slate-500">Scheduled</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-900 text-xs">
                            KJ
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">vs Kota Jogja Thunder</div>
                            <div className="text-[11px] text-slate-500">H2H: 3W - 2L</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold text-slate-900 block">Thu, 02 Apr</span>
                          <span className="font-mono text-[11px] text-slate-500">19:00 WIB</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-1.5">
                        <span>GOR Amongrogo, Yogyakarta</span>
                        <span>Away Venue</span>
                      </div>
                    </div>

                    {/* Fixture 3 */}
                    <div className="p-3 rounded-lg bg-white border border-slate-200/80 shadow-xs flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">
                          Kejurda Series Leg 1
                        </span>
                        <span className="font-mono text-[11px] text-slate-500">Confirmed</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-900 text-xs">
                            KP
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">vs Kulon Progo Falcons</div>
                            <div className="text-[11px] text-slate-500">H2H: 5W - 0L</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold text-slate-900 block">Sun, 12 Apr</span>
                          <span className="font-mono text-[11px] text-slate-500">10:00 WIB</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-1.5">
                        <span>GOR Cangkring, Kulon Progo</span>
                        <span>Away Venue</span>
                      </div>
                    </div>
                  </div>

                  {/* Championship Advantage Index */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">
                        Championship Advantage Index
                      </span>
                      <span className="font-mono text-xs text-red-700 font-bold">
                        Bantul 68% - 32% Sleman
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                      <div className="bg-[#b91c1c] h-full" style={{ width: '68%' }} />
                      <div className="bg-slate-400 h-full" style={{ width: '32%' }} />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                      <span>Bantul Offense: 19.4 Pts/Game</span>
                      <span>Sleman Defense: 14.2 Allowed</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3: Training Operations & Physical Load Tracker */}
            <section className="rounded-2xl bg-white p-6 shadow-xs border border-slate-200/80 flex flex-col gap-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-red-100 text-red-700 flex items-center justify-center flex-shrink-0">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-lg font-bold text-slate-900">
                      Training Operations &amp; Physical Load Tracker
                    </h2>
                    <span className="text-xs text-slate-500">
                      RPE load intensity monitoring &amp; sideline presence logs
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                    Logged: 18/20 Sessions • Squad Avg Load: <span className="text-slate-900 font-bold">7.8 RPE</span> • High Risk: <span className="text-rose-600 font-bold">1</span>
                  </span>
                </div>
              </div>

              {/* Training Analytics Layout: Weekly Load Bars & Live Feed */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: Weekly Training Load & Focus Breakdown (7 cols) */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-sm">
                          Weekly RPE Training Load &amp; Drills
                        </span>
                        <span className="text-xs text-slate-500">
                          Mon - Sat Training Intensity Schedule
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded bg-[#b91c1c]" />
                          <span className="text-[11px] text-slate-600">Target Load</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded bg-sky-300" />
                          <span className="text-[11px] text-slate-600">Recovery</span>
                        </div>
                      </div>
                    </div>

                    {/* Weekly Drill Chart (SVG Inline) */}
                    <div className="w-full">
                      <svg className="w-full h-44" fill="none" viewBox="0 0 600 160">
                        {/* Grid horizontal reference lines */}
                        <line stroke="#E2E8F0" strokeDasharray="4 4" x1="30" x2="580" y1="20" y2="20" />
                        <line stroke="#E2E8F0" strokeDasharray="4 4" x1="30" x2="580" y1="60" y2="60" />
                        <line stroke="#E2E8F0" strokeDasharray="4 4" x1="30" x2="580" y1="100" y2="100" />
                        <line stroke="#CBD5E1" x1="30" x2="580" y1="140" y2="140" />

                        {/* Y-Axis labels */}
                        <text className="fill-slate-400 text-[10px] font-mono" x="10" y="24">10</text>
                        <text className="fill-slate-400 text-[10px] font-mono" x="10" y="64">7</text>
                        <text className="fill-slate-400 text-[10px] font-mono" x="10" y="104">4</text>

                        {/* Monday */}
                        <rect className="opacity-90 hover:opacity-100 transition-opacity" fill="#B91C1C" height="95" rx="6" width="45" x="55" y="45" />
                        <text className="fill-slate-700 text-[11px] font-mono font-bold" textAnchor="middle" x="77" y="38">8.2</text>
                        <text className="fill-slate-500 text-[11px]" textAnchor="middle" x="77" y="155">Mon</text>

                        {/* Tuesday */}
                        <rect className="opacity-90 hover:opacity-100 transition-opacity" fill="#B91C1C" height="110" rx="6" width="45" x="145" y="30" />
                        <text className="fill-slate-700 text-[11px] font-mono font-bold" textAnchor="middle" x="167" y="23">9.1</text>
                        <text className="fill-slate-500 text-[11px]" textAnchor="middle" x="167" y="155">Tue</text>

                        {/* Wednesday */}
                        <rect className="opacity-90 hover:opacity-100 transition-opacity" fill="#B91C1C" height="85" rx="6" width="45" x="235" y="55" />
                        <text className="fill-slate-700 text-[11px] font-mono font-bold" textAnchor="middle" x="257" y="48">7.4</text>
                        <text className="fill-slate-500 text-[11px]" textAnchor="middle" x="257" y="155">Wed</text>

                        {/* Thursday */}
                        <rect className="opacity-90 hover:opacity-100 transition-opacity" fill="#B91C1C" height="100" rx="6" width="45" x="325" y="40" />
                        <text className="fill-slate-700 text-[11px] font-mono font-bold" textAnchor="middle" x="347" y="33">8.5</text>
                        <text className="fill-slate-500 text-[11px]" textAnchor="middle" x="347" y="155">Thu</text>

                        {/* Friday (Tapering) */}
                        <rect className="opacity-90 hover:opacity-100 transition-opacity" fill="#93ccff" height="60" rx="6" width="45" x="415" y="80" />
                        <text className="fill-slate-700 text-[11px] font-mono font-bold" textAnchor="middle" x="437" y="73">5.8</text>
                        <text className="fill-slate-500 text-[11px]" textAnchor="middle" x="437" y="155">Fri</text>

                        {/* Saturday (Walkthrough) */}
                        <rect className="opacity-90 hover:opacity-100 transition-opacity" fill="#93ccff" height="35" rx="6" width="45" x="505" y="105" />
                        <text className="fill-slate-700 text-[11px] font-mono font-bold" textAnchor="middle" x="527" y="98">3.8</text>
                        <text className="fill-slate-500 text-[11px]" textAnchor="middle" x="527" y="155">Sat</text>
                      </svg>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200">
                      <div className="flex flex-col">
                        <span className="text-[11px] text-slate-500">Peak Intensity Day</span>
                        <span className="font-bold text-slate-900 text-sm">Tuesday (9.1 RPE)</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] text-slate-500">Primary Focus</span>
                        <span className="font-bold text-slate-900 text-sm">Zone Defense Rotation</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] text-slate-500">Tapering Target</span>
                        <span className="font-bold text-emerald-700 text-sm">Achieved (-40%)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Sideline Attendance Log Stream (5 cols) */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-red-600" />
                        <span className="font-bold text-slate-900 text-sm">Sideline Attendance Log</span>
                      </div>
                      <span className="font-mono text-[11px] text-slate-500">Today • 16:30 WIB</span>
                    </div>

                    {/* Live Feed List */}
                    <div className="flex flex-col gap-2 mt-1">
                      {/* Item 1 */}
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-mono text-xs flex items-center justify-center font-bold">
                            07
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900 text-xs">Rian Hidayat</span>
                            <span className="font-mono text-[10px] text-slate-500">16:15 WIB (15m early)</span>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Hadir
                        </span>
                      </div>

                      {/* Item 2 */}
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-mono text-xs flex items-center justify-center font-bold">
                            12
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900 text-xs">Anisa Nuraini</span>
                            <span className="font-mono text-[10px] text-slate-500">16:20 WIB (10m early)</span>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Hadir
                        </span>
                      </div>

                      {/* Item 3 */}
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-mono text-xs flex items-center justify-center font-bold">
                            09
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900 text-xs">Siti Rahmawati</span>
                            <span className="font-mono text-[10px] text-slate-500">16:35 WIB (+5m kuliah)</span>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600" /> Telat (Izin)
                        </span>
                      </div>

                      {/* Item 4 */}
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-mono text-xs flex items-center justify-center font-bold">
                            15
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900 text-xs">Bella Septiana</span>
                            <span className="font-mono text-[10px] text-slate-500">Klinik Fisioterapi</span>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 text-[11px] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600" /> Rehab Medis
                        </span>
                      </div>
                    </div>

                    <Link href="/attendance">
                      <Button
                        variant="outline"
                        className="w-full h-9 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold gap-2 border border-slate-200/80 mt-1 shadow-xs"
                      >
                        <Clock className="w-3.5 h-3.5 text-red-600" />
                        <span>Buka Attendance Logger Penuh</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* Interactive Sideline Quick Action Pill & Floating Roster Toast */}
      <div className="fixed bottom-6 right-8 z-40 flex flex-col items-end gap-3 pointer-events-none">
        {/* Live Toast Notification */}
        {showToast && (
          <div className="pointer-events-auto flex items-center gap-3 bg-[#0E121A] text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 max-w-md transform translate-y-0 transition-transform duration-300">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0 pr-2">
              <span className="text-xs font-semibold text-white">Lineup Locked &amp; Synchronized</span>
              <span className="text-[11px] text-slate-400">
                Skuad Matchday #8 disahkan oleh Coach Fadhil Alif. Salinan wasit Kejurkab DIY siap.
              </span>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Floating Action Toolbar */}
        <div className="pointer-events-auto flex items-center gap-2 bg-[#0E121A]/95 backdrop-blur-md p-1.5 rounded-full shadow-2xl border border-slate-800">
          <Button
            onClick={() => router.push('/attendance')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#b91c1c] hover:bg-[#991b1b] text-white text-xs font-semibold shadow-md cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Catat Presensi</span>
          </Button>

          <Button
            onClick={() => router.push('/matches')}
            variant="outline"
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#181F2C] hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-medium border border-slate-700/60 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Match Note</span>
          </Button>

          <Button
            onClick={handleDownloadRosterCSV}
            variant="outline"
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#181F2C] hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-medium border border-slate-700/60 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-sky-400" />
            <span>Unduh CSV</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
