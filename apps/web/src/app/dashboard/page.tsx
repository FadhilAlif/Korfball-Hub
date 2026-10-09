'use client';

import React from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { useGetTeam } from '@/hooks/useTeams';
import { useGetAthletes } from '@/hooks/useAthletes';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { data: team } = useGetTeam();
  const activeSeason = team?.seasons?.find((s) => s.is_active);
  const { data: athletesData } = useGetAthletes({ season_id: activeSeason?.id });

  const summary = athletesData?.summary || {
    total: 0,
    males: 0,
    females: 0,
    activeFit: 0,
    medicalHold: 0,
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-slate-900">
      <Sidebar />

      <div className="pl-72">
        <Header title="Dashboard" category="Main" />

        <main className="w-full pt-16 min-h-screen p-8">
          <div className="flex flex-col w-full max-w-7xl mx-auto space-y-6">
            {/* Hero Welcome Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0E121A] via-[#1a2233] to-[#2a1317] p-8 text-white shadow-lg border border-slate-800">
              <div className="relative z-10 max-w-2xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/40 text-red-300 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Korfball Bantul Operations Hub</span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight">
                  Selamat Datang di Portal Tim Korfball Bantul
                </h1>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Pusat komando dan manajemen terpadu tim: pantau kebugaran atlet, penugasan roster turnamen, jadwal latihan, dan analisis taktis dalam satu sistem terintegrasi.
                </p>
                <div className="pt-2 flex flex-wrap gap-3">
                  <Link href="/athletes">
                    <Button className="bg-[#b91c1c] hover:bg-[#991b1b] text-white text-xs font-semibold h-10 px-4 gap-2">
                      <Users className="w-4 h-4" />
                      <span>Buka Active Roster</span>
                    </Button>
                  </Link>
                  <Link href="/team">
                    <Button
                      variant="outline"
                      className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-semibold h-10 px-4 gap-2"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Profil Tim & Musim</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick KPI Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white shadow-xs border border-slate-200/80">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Total Atlet Skuad
                </span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-extrabold font-mono text-slate-900">
                    {summary.total}
                  </span>
                  <span className="text-xs text-slate-500">Atlet</span>
                </div>
                <div className="mt-3 text-xs text-slate-600 flex items-center justify-between border-t border-slate-100 pt-2">
                  <span>{summary.males} Putra / {summary.females} Putri</span>
                  <span className="text-emerald-600 font-bold font-mono">IKF 50:50</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white shadow-xs border border-slate-200/80">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Siap Tanding (Fit)
                </span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-extrabold font-mono text-slate-900">
                    {summary.activeFit}
                  </span>
                  <span className="text-xs text-emerald-600 font-semibold">Match Ready</span>
                </div>
                <div className="mt-3 text-xs text-slate-500 border-t border-slate-100 pt-2">
                  <span>Tersedia untuk skuad inti 8 pemain</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white shadow-xs border border-slate-200/80">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Medical Hold
                </span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-extrabold font-mono text-rose-600">
                    {summary.medicalHold}
                  </span>
                  <span className="text-xs text-slate-500">Cedera/Rehab</span>
                </div>
                <div className="mt-3 text-xs text-slate-500 border-t border-slate-100 pt-2">
                  <span>Dalam program pemulihan</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white shadow-xs border border-slate-200/80">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Musim Kompetisi Aktif
                </span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-sm font-bold text-slate-900 truncate">
                    {activeSeason?.name || 'Belum Diatur'}
                  </span>
                </div>
                <div className="mt-3 text-xs text-slate-500 border-t border-slate-100 pt-2 flex items-center justify-between">
                  <span className="font-mono text-[11px]">
                    {activeSeason?.start_date ? String(activeSeason.start_date).split('T')[0] : '-'}
                  </span>
                  <span className="text-emerald-700 font-semibold">Aktif</span>
                </div>
              </div>
            </div>

            {/* Quick Navigation Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-white shadow-xs border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Manajemen Roster & Atlet</h3>
                      <p className="text-xs text-slate-500">
                        Atur nomor punggung, kapten tim, dan profil taktis atlet.
                      </p>
                    </div>
                  </div>
                  <Link href="/athletes">
                    <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
                      Buka <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white shadow-xs border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Profil Tim & Musim</h3>
                      <p className="text-xs text-slate-500">
                        Kelola data organisasi, home venue, dan agenda musim kejuaraan.
                      </p>
                    </div>
                  </div>
                  <Link href="/team">
                    <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
                      Buka <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
