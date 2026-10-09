'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import {
  useGetTrainingSessions,
  useGetTrainingSession,
  useRecordAttendance,
} from '@/hooks/useTraining';
import { useGetAthletes, Athlete } from '@/hooks/useAthletes';
import {
  ClipboardCheck,
  QrCode,
  Search,
  CheckCircle2,
  Clock,
  HeartPulse,
  UserX,
  Users,
  ChevronRight,
  Flame,
  FileDown,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function AttendanceContent() {
  const searchParams = useSearchParams();
  const initialSessionId = searchParams.get('session_id') || '';

  const { data: sessions = [], isLoading: isLoadingSessions } = useGetTrainingSessions();
  const [selectedSessionId, setSelectedSessionId] = useState<string>(initialSessionId);

  // Set default session if none chosen
  useEffect(() => {
    if (!selectedSessionId && sessions.length > 0) {
      setSelectedSessionId(sessions[0].id);
    }
  }, [sessions, selectedSessionId]);

  const { data: sessionDetail, isLoading: isLoadingDetail } = useGetTrainingSession(selectedSessionId);
  const { data: athletesData } = useGetAthletes();
  const recordAttendance = useRecordAttendance();

  const allAthletes: Athlete[] = athletesData?.items || [];

  // Local Attendance State for Roster Ledger
  const [attendanceState, setAttendanceState] = useState<
    Record<
      string,
      {
        status: 'PRESENT' | 'LATE' | 'EXCUSED' | 'ABSENT';
        rpe?: number;
        notes?: string;
      }
    >
  >({});

  // Sync session attendances to local state
  useEffect(() => {
    if (sessionDetail?.attendances) {
      const stateMap: Record<
        string,
        { status: 'PRESENT' | 'LATE' | 'EXCUSED' | 'ABSENT'; rpe?: number; notes?: string }
      > = {};

      sessionDetail.attendances.forEach((att) => {
        stateMap[att.athlete_id] = {
          status: att.status,
          rpe: att.rpe ?? undefined,
          notes: att.notes ?? undefined,
        };
      });

      setAttendanceState(stateMap);
    } else {
      setAttendanceState({});
    }
  }, [sessionDetail]);

  // Search filter inside attendance ledger
  const [search, setSearch] = useState('');

  // Quick scanner manual input
  const [quickCode, setQuickCode] = useState('');
  const [scanNotification, setScanNotification] = useState<string | null>(null);

  // Filtered athletes list
  const filteredAthletes = useMemo(() => {
    return allAthletes.filter((a) => {
      const q = search.toLowerCase();
      return (
        !q ||
        a.full_name.toLowerCase().includes(q) ||
        (a.player_id && a.player_id.toLowerCase().includes(q)) ||
        String(a.jersey_number).includes(q)
      );
    });
  }, [allAthletes, search]);

  // Calculate live KPI counters
  const kpiStats = useMemo(() => {
    const total = allAthletes.length;
    let present = 0;
    let late = 0;
    let excused = 0;
    let absent = 0;

    allAthletes.forEach((a) => {
      const rec = attendanceState[a.id];
      if (!rec) {
        absent++;
      } else if (rec.status === 'PRESENT') {
        present++;
      } else if (rec.status === 'LATE') {
        late++;
      } else if (rec.status === 'EXCUSED') {
        excused++;
      } else {
        absent++;
      }
    });

    const activeCount = present + late;
    const rate = total > 0 ? Math.round((activeCount / total) * 100) : 0;

    return { total, present, late, excused, absent, rate };
  }, [allAthletes, attendanceState]);

  // Status changer helper
  const handleSetStatus = (
    athleteId: string,
    status: 'PRESENT' | 'LATE' | 'EXCUSED' | 'ABSENT',
  ) => {
    setAttendanceState((prev) => ({
      ...prev,
      [athleteId]: {
        ...prev[athleteId],
        status,
      },
    }));
  };

  // RPE changer helper (optional 1-10)
  const handleSetRpe = (athleteId: string, rpeVal: number) => {
    setAttendanceState((prev) => ({
      ...prev,
      [athleteId]: {
        ...prev[athleteId],
        status: prev[athleteId]?.status || 'PRESENT',
        rpe: rpeVal,
      },
    }));
  };

  // Quick QR / Barcode simulator check-in
  const handleQuickCheckin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCode.trim()) return;

    const code = quickCode.trim().toLowerCase();
    const found = allAthletes.find(
      (a) =>
        a.player_id.toLowerCase() === code ||
        String(a.jersey_number) === code ||
        a.full_name.toLowerCase().includes(code),
    );

    if (found) {
      handleSetStatus(found.id, 'PRESENT');
      setScanNotification(`Berhasil check-in: #${found.jersey_number} ${found.full_name}`);
      setQuickCode('');
      setTimeout(() => setScanNotification(null), 3500);
    } else {
      setScanNotification(`Atlet dengan kode '${quickCode}' tidak ditemukan`);
      setTimeout(() => setScanNotification(null), 3500);
    }
  };

  // Save all attendances to backend
  const handleSaveAll = async () => {
    if (!selectedSessionId) return;

    const payload = Object.entries(attendanceState).map(([athleteId, val]) => ({
      athlete_id: athleteId,
      status: val.status,
      rpe: val.rpe,
      notes: val.notes,
    }));

    await recordAttendance.mutateAsync({
      sessionId: selectedSessionId,
      attendances: payload,
    });
  };

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto space-y-6">
      {/* Top Header & Session Selector */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>Training Operations</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="font-semibold text-slate-900">Attendance Logger</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
              Session Attendance Logger & Check-in Desk
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-200">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              PRESENSI REAL-TIME
            </span>
          </div>
        </div>

        {/* Session Selector & Save Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs shadow-xs">
            <span className="text-slate-400 font-medium">Pilih Sesi:</span>
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer pr-2 text-xs"
            >
              {sessions.map((sess) => (
                <option key={sess.id} value={sess.id}>
                  {sess.session_date} • {sess.objective}
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={handleSaveAll}
            disabled={recordAttendance.isPending}
            className="bg-[#b91c1c] hover:bg-[#991b1b] text-white text-xs font-semibold h-10 px-5 gap-2 shadow-xs"
          >
            {recordAttendance.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>Simpan Rekap Presensi</span>
          </Button>
        </div>
      </div>

      {/* KPI Tactical Metric Strip (5 Counters) */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-white shadow-xs border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Total Skuad
            </span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-mono text-slate-900">{kpiStats.total}</span>
            <span className="text-xs text-slate-500">Atlet</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1">100% Roster Tim</span>
        </div>

        <div className="p-4 rounded-2xl bg-white shadow-xs border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Hadir di Lapangan
            </span>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              {kpiStats.rate}%
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-mono text-emerald-600">{kpiStats.present}</span>
            <span className="text-xs text-emerald-600 font-semibold">Siap Latihan</span>
          </div>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${kpiStats.rate}%` }} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white shadow-xs border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Terlambat
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-mono text-amber-600">{kpiStats.late}</span>
            <span className="text-xs text-amber-700">Delayed</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1">Disiplin Waktu Lapangan</span>
        </div>

        <div className="p-4 rounded-2xl bg-white shadow-xs border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Izin / Sakit
            </span>
            <HeartPulse className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-mono text-blue-600">{kpiStats.excused}</span>
            <span className="text-xs text-blue-700">Excused</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1">Medical / Akademik</span>
        </div>

        <div className="p-4 rounded-2xl bg-white shadow-xs border border-slate-200 flex flex-col justify-between col-span-2 md:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Belum Hadir
            </span>
            <UserX className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-mono text-rose-600">{kpiStats.absent}</span>
            <span className="text-xs text-rose-700">Unaccounted</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1">Menunggu Check-In</span>
        </div>
      </div>

      {/* 2-Column Operational Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Quick Check-in Desk & Session Info (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Optical Scanner Simulation Card */}
          <div className="p-5 rounded-2xl bg-white shadow-xs border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Check-In Scanner Desk</h3>
                  <p className="text-[10px] text-slate-400">Scan QR Card atau input nomor jersey</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800">
                ACTIVE
              </span>
            </div>

            {/* Simulated Viewfinder */}
            <div className="relative w-full aspect-[4/3] rounded-xl bg-[#080B10] overflow-hidden flex flex-col items-center justify-center p-4 text-center">
              <div className="w-28 h-28 rounded-2xl border-2 border-red-500/60 animate-pulse flex items-center justify-center relative">
                <span className="w-full h-0.5 bg-red-500 absolute top-1/2 left-0 shadow-lg shadow-red-500" />
                <QrCode className="w-10 h-10 text-white/30" />
              </div>
              <span className="text-[10px] font-mono text-slate-400 mt-3">
                Arahkan kartu QR atlet ke kamera check-in
              </span>
            </div>

            {/* Quick Input Bar */}
            <form onSubmit={handleQuickCheckin} className="space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  value={quickCode}
                  onChange={(e) => setQuickCode(e.target.value)}
                  placeholder="Ketik Jersey # atau ID (cth: 7, KB-01)"
                  className="h-9 text-xs"
                />
                <Button type="submit" className="h-9 text-xs bg-slate-900 hover:bg-black text-white px-3">
                  Check-In
                </Button>
              </div>
              {scanNotification && (
                <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium text-center">
                  {scanNotification}
                </div>
              )}
            </form>
          </div>

          {/* Session Overview Card */}
          {sessionDetail && (
            <div className="p-5 rounded-2xl bg-white shadow-xs border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-900 block border-b border-slate-100 pb-2">
                Detail Sesi Latihan Terpilih
              </span>
              <div className="space-y-1.5 text-xs text-slate-600">
                <div>
                  <strong className="text-slate-800">Target:</strong> {sessionDetail.objective}
                </div>
                <div>
                  <strong className="text-slate-800">Venue:</strong> {sessionDetail.venue || 'GOR Sasana Krida'}
                </div>
                <div>
                  <strong className="text-slate-800">Waktu:</strong> {sessionDetail.session_date}
                </div>
                <div>
                  <strong className="text-slate-800">Drill Terjadwal:</strong>{' '}
                  {sessionDetail.activities?.length || 0} aktivitas
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Real-Time Roster Ledger (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-4 rounded-2xl bg-white shadow-xs border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">
                Lembar Presensi Atlet
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-xs font-bold">
                {filteredAthletes.length} Atlet
              </span>
            </div>

            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama atau nomor..."
                className="w-full h-8 pl-8 pr-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-red-600"
              />
            </div>
          </div>

          {/* Roster Cards List */}
          <div className="space-y-3">
            {filteredAthletes.map((athlete) => {
              const record = attendanceState[athlete.id] || { status: 'ABSENT' };

              return (
                <div
                  key={athlete.id}
                  className={`p-4 rounded-2xl bg-white shadow-xs border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    record.status === 'PRESENT'
                      ? 'border-emerald-300 bg-emerald-50/10'
                      : record.status === 'LATE'
                      ? 'border-amber-300 bg-amber-50/10'
                      : record.status === 'EXCUSED'
                      ? 'border-blue-300 bg-blue-50/10'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Athlete Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        athlete.gender === 'MALE'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {athlete.full_name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-sm font-bold text-red-700">
                          #{String(athlete.jersey_number).padStart(2, '0')}
                        </span>
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {athlete.full_name}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block truncate">
                        {athlete.player_id} • {athlete.position || 'Player'}
                      </span>
                    </div>
                  </div>

                  {/* Actions & RPE */}
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Status Toggle Buttons */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                      <button
                        type="button"
                        onClick={() => handleSetStatus(athlete.id, 'PRESENT')}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                          record.status === 'PRESENT'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Hadir
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetStatus(athlete.id, 'LATE')}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                          record.status === 'LATE'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Telat
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetStatus(athlete.id, 'EXCUSED')}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                          record.status === 'EXCUSED'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Izin
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetStatus(athlete.id, 'ABSENT')}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                          record.status === 'ABSENT'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Alpa
                      </button>
                    </div>

                    {/* Optional RPE Selector (Scale 1-10) per Q1 response */}
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">RPE:</span>
                      <select
                        value={record.rpe ?? ''}
                        onChange={(e) =>
                          handleSetRpe(
                            athlete.id,
                            e.target.value ? Number(e.target.value) : (undefined as any),
                          )
                        }
                        className="h-8 px-2 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold text-slate-800 focus:outline-none"
                      >
                        <option value="">-</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <option key={num} value={num}>
                            {num}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AttendancePage() {
  return (
    <div className="min-h-screen bg-[#f8f9ff] text-slate-900">
      <Sidebar />

      <div className="pl-72">
        <Header title="Attendance Logger" category="Training Operations" />

        <main className="w-full pt-16 min-h-screen p-8">
          <Suspense fallback={<div className="p-8 text-xs text-slate-500">Memuat presensi...</div>}>
            <AttendanceContent />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
