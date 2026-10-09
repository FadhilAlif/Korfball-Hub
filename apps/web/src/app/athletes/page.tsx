'use client';

import React, { useState, useMemo } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import {
  useGetAthletes,
  useDeleteAthlete,
  useSetCaptain,
  Athlete,
} from '@/hooks/useAthletes';
import { useGetTeam } from '@/hooks/useTeams';
import { AthleteFormDialog } from '@/components/athletes/athlete-form-dialog';
import {
  Search,
  UserPlus,
  FileDown,
  LayoutGrid,
  List,
  Shield,
  HeartPulse,
  Users,
  Award,
  MoreVertical,
  Edit2,
  Trash2,
  Crown,
  ChevronRight,
  Printer,
  Sparkles,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function AthletesPage() {
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState<'ALL' | 'MALE' | 'FEMALE'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Dialog State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAthlete, setEditingAthlete] = useState<Athlete | null>(null);
  const [deleteConfirmAthlete, setDeleteConfirmAthlete] = useState<Athlete | null>(null);

  // Selected Athlete for Right-Pane Dossier
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);

  const { data: teamData } = useGetTeam();
  const activeSeason = teamData?.seasons?.find((s) => s.is_active);

  const { data: response, isLoading } = useGetAthletes({
    season_id: activeSeason?.id,
  });

  const deleteAthlete = useDeleteAthlete();
  const setCaptain = useSetCaptain();

  const athletes = response?.items || [];
  const summary = response?.summary || {
    total: 0,
    males: 0,
    females: 0,
    activeFit: 0,
    medicalHold: 0,
  };

  // Filtered Athletes
  const filteredAthletes = useMemo(() => {
    return athletes.filter((a) => {
      // Search
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        a.full_name.toLowerCase().includes(q) ||
        (a.player_id && a.player_id.toLowerCase().includes(q)) ||
        (a.position && a.position.toLowerCase().includes(q)) ||
        String(a.jersey_number).includes(q);

      // Gender
      const matchGender = genderFilter === 'ALL' || a.gender === genderFilter;

      // Status
      let matchStatus = true;
      if (statusFilter === 'ACTIVE') {
        matchStatus = a.status === 'ACTIVE';
      } else if (statusFilter === 'INJURED') {
        matchStatus = a.status === 'INJURED';
      } else if (statusFilter === 'CAPTAIN') {
        matchStatus = a.rosters?.some((r) => r.is_captain) || false;
      }

      return matchSearch && matchGender && matchStatus;
    });
  }, [athletes, search, genderFilter, statusFilter]);

  // Selected athlete for dossier (defaults to first athlete if none selected)
  const selectedAthlete = useMemo(() => {
    if (selectedAthleteId) {
      const found = athletes.find((a) => a.id === selectedAthleteId);
      if (found) return found;
    }
    return filteredAthletes.length > 0 ? filteredAthletes[0] : null;
  }, [athletes, filteredAthletes, selectedAthleteId]);

  // Handlers
  const handleOpenCreate = () => {
    setEditingAthlete(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (athlete: Athlete) => {
    setEditingAthlete(athlete);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirmAthlete) return;
    await deleteAthlete.mutateAsync(deleteConfirmAthlete.id);
    setDeleteConfirmAthlete(null);
    if (selectedAthleteId === deleteConfirmAthlete.id) {
      setSelectedAthleteId(null);
    }
  };

  const handleMakeCaptain = async (athlete: Athlete) => {
    const activeRoster = athlete.rosters?.find((r) => r.season?.is_active || r.season_id === activeSeason?.id);
    if (activeRoster) {
      await setCaptain.mutateAsync(activeRoster.id);
    }
  };

  // Helper: calculate athlete age without unstable Date.now() in SSR
  const calculateAge = (dobString?: string) => {
    if (!dobString) return 22;
    const birthYear = parseInt(dobString.substring(0, 4), 10);
    return isNaN(birthYear) ? 22 : 2026 - birthYear;
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-slate-900">
      <Sidebar />

      <div className="pl-72">
        <Header title="Active Squad Roster" category="Team Management" />

        <main className="w-full pt-16 min-h-screen p-8">
          <div className="flex flex-col w-full max-w-7xl mx-auto space-y-6">
            {/* Top Command & Actions Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <span>Squad Management</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                  <span className="font-semibold text-slate-900">Active Roster</span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
                    Active Squad Roster & Athlete Profiles
                  </h1>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-200">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                    {activeSeason?.name || 'Kejurkab DIY 2026 Ready'}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <Button
                  variant="outline"
                  onClick={() => window.print()}
                  className="bg-white hover:bg-slate-50 border-slate-200 text-xs font-semibold h-10 px-3.5 gap-2 text-slate-700 shadow-xs"
                >
                  <FileDown className="w-4 h-4 text-slate-500" />
                  <span>Export Squad (PDF/CSV)</span>
                </Button>
                <Button
                  onClick={handleOpenCreate}
                  className="bg-[#b91c1c] hover:bg-[#991b1b] text-white text-xs font-semibold h-10 px-4 gap-2 shadow-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>+ Registrasi Atlet Baru</span>
                </Button>
              </div>
            </div>

            {/* KPI Summary Tiles (4 Tiles) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Tile 1: Total Registered */}
              <div className="p-5 rounded-2xl bg-white shadow-xs border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Total Pool Atlet
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-red-700">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold font-mono text-slate-900">
                    {summary.total}
                  </span>
                  <span className="text-xs text-slate-500">Atlet Terdaftar</span>
                </div>
                <div className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> {summary.males} Putra
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> {summary.females} Putri
                  </span>
                  <span className="text-[11px] text-emerald-600 font-bold ml-auto font-mono">
                    IKF 50:50
                  </span>
                </div>
              </div>

              {/* Tile 2: Match Ready */}
              <div className="p-5 rounded-2xl bg-white shadow-xs border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Siap Tanding (Fit)
                  </span>
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold font-mono text-slate-900">
                    {summary.activeFit}
                  </span>
                  <span className="text-xs text-emerald-600 font-semibold">Match Ready</span>
                </div>
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                  <span>Starter Formasi 8 (4M / 4F)</span>
                  <span className="font-mono font-bold text-slate-800">
                    {summary.total > 0
                      ? `${Math.round((summary.activeFit / summary.total) * 100)}%`
                      : '0%'}
                  </span>
                </div>
              </div>

              {/* Tile 3: Medical Hold */}
              <div className="p-5 rounded-2xl bg-white shadow-xs border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Medical Hold / Rehab
                  </span>
                  <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                    <HeartPulse className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold font-mono text-rose-600">
                    {summary.medicalHold}
                  </span>
                  <span className="text-xs text-slate-500">Atlet Cedera</span>
                </div>
                <div className="mt-3 flex items-center gap-1.5 pt-2 border-t border-slate-100 text-xs text-rose-700">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                  <span>Dalam pantauan tim medis Bantul</span>
                </div>
              </div>

              {/* Tile 4: Tactical Reserves */}
              <div className="p-5 rounded-2xl bg-white shadow-xs border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Rotasi & Cadangan
                  </span>
                  <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Flame className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold font-mono text-slate-900">
                    {Math.max(0, summary.total - 8)}
                  </span>
                  <span className="text-xs text-slate-500">Player Rotasi</span>
                </div>
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                  <span>Siap Diturunkan</span>
                  <span className="font-mono font-semibold text-amber-700">100% Eligible</span>
                </div>
              </div>
            </div>

            {/* Interactive Search & Filter Strip */}
            <div className="p-4 rounded-2xl bg-white shadow-xs border border-slate-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari berdasarkan nama, jersey #, ID atlet, atau posisi..."
                    className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white transition-all"
                  />
                </div>

                {/* Quick Filters */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  <button
                    onClick={() => {
                      setGenderFilter('ALL');
                      setStatusFilter('ALL');
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                      genderFilter === 'ALL' && statusFilter === 'ALL'
                        ? 'bg-[#b91c1c] text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    Semua ({athletes.length})
                  </button>
                  <button
                    onClick={() => setGenderFilter(genderFilter === 'MALE' ? 'ALL' : 'MALE')}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
                      genderFilter === 'MALE'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    Putra ({summary.males})
                  </button>
                  <button
                    onClick={() => setGenderFilter(genderFilter === 'FEMALE' ? 'ALL' : 'FEMALE')}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
                      genderFilter === 'FEMALE'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    Putri ({summary.females})
                  </button>
                  <button
                    onClick={() => setStatusFilter(statusFilter === 'CAPTAIN' ? 'ALL' : 'CAPTAIN')}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
                      statusFilter === 'CAPTAIN'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <Crown className="w-3.5 h-3.5 text-amber-500" />
                    Kapten Tim
                  </button>
                  <button
                    onClick={() => setStatusFilter(statusFilter === 'INJURED' ? 'ALL' : 'INJURED')}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
                      statusFilter === 'INJURED'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    Medical Hold ({summary.medicalHold})
                  </button>
                </div>
              </div>

              {/* View Switcher */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-red-600" />
                  <span>Kartu Skuad</span>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    viewMode === 'table'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>Tabel Data</span>
                </button>
              </div>
            </div>

            {/* Dual-Pane Layout: Left Squad Cards/Table & Right Active Dossier */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Pane (7-8 cols) */}
              <div className="lg:col-span-7 xl:col-span-8 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-900">
                      Daftar Anggota Skuad
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-200/80 font-mono text-xs font-semibold text-slate-700">
                      {filteredAthletes.length} Atlet
                    </span>
                  </div>
                </div>

                {isLoading ? (
                  <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
                    Memuat data atlet dari server...
                  </div>
                ) : filteredAthletes.length === 0 ? (
                  <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
                    <Users className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-sm font-semibold text-slate-700">
                      Tidak ada atlet yang cocok dengan filter pencarian
                    </p>
                    <p className="text-xs text-slate-400">
                      Coba ganti filter atau daftarkan atlet baru.
                    </p>
                  </div>
                ) : viewMode === 'grid' ? (
                  /* Detailed Grid View */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredAthletes.map((athlete) => {
                      const isSelected = selectedAthlete?.id === athlete.id;
                      const activeRoster = athlete.rosters?.find(
                        (r) => r.season?.is_active || r.season_id === activeSeason?.id,
                      );
                      const isCaptain = activeRoster?.is_captain;

                      return (
                        <div
                          key={athlete.id}
                          onClick={() => setSelectedAthleteId(athlete.id)}
                          className={`p-5 rounded-2xl bg-white shadow-xs border transition-all relative overflow-hidden group cursor-pointer ${
                            isSelected
                              ? 'ring-2 ring-red-600 border-red-300 shadow-md bg-red-50/20'
                              : 'border-slate-200/80 hover:border-slate-300 hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="flex items-center gap-3">
                              {/* Avatar with Gender Indicator */}
                              <div className="relative flex-shrink-0">
                                <div
                                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base shadow-xs ${
                                    athlete.gender === 'MALE'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-purple-100 text-purple-800'
                                  }`}
                                >
                                  {athlete.full_name.charAt(0)}
                                </div>
                                <span
                                  className={`absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold text-white shadow-xs ${
                                    athlete.gender === 'MALE' ? 'bg-blue-600' : 'bg-purple-600'
                                  }`}
                                >
                                  {athlete.gender === 'MALE' ? 'M' : 'F'}
                                </span>
                              </div>

                              <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-base text-red-700 font-black">
                                    #{String(athlete.jersey_number).padStart(2, '0')}
                                  </span>
                                  <span className="font-bold text-sm text-slate-900 truncate">
                                    {athlete.full_name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-xs">
                                  {isCaptain && (
                                    <span className="font-bold text-amber-600 flex items-center gap-0.5">
                                      <Crown className="w-3 h-3 text-amber-500" />
                                      Kapten Tim •
                                    </span>
                                  )}
                                  <span className="text-slate-600 font-medium truncate">
                                    {athlete.position || 'Player'}
                                  </span>
                                </div>
                                <span className="text-[11px] text-slate-400">
                                  ID: {athlete.player_id} • {calculateAge(athlete.date_of_birth)} thn
                                </span>
                              </div>
                            </div>

                            {/* Status Badge */}
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                                athlete.status === 'ACTIVE'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : athlete.status === 'INJURED'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
                            >
                              {athlete.status === 'ACTIVE'
                                ? '100% Fit'
                                : athlete.status === 'INJURED'
                                ? 'Cedera'
                                : athlete.status}
                            </span>
                          </div>

                          {/* Tactical Role & Division Assignment */}
                          <div className="p-2.5 rounded-xl bg-slate-50 mb-3 flex items-center justify-between border border-slate-100">
                            <div className="flex flex-col">
                              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                                Penugasan Taktis
                              </span>
                              <span className="text-xs font-bold text-slate-800">
                                {athlete.position || 'All-Round Player'}
                              </span>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-white text-slate-700 font-mono text-[10px] font-bold border border-slate-200">
                              {athlete.gender === 'MALE' ? 'KUADRAN PUTRA' : 'KUADRAN PUTRI'}
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center justify-between pt-1 gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAthleteId(athlete.id);
                              }}
                              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all text-center ${
                                isSelected
                                  ? 'bg-red-700 text-white shadow-xs'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                            >
                              {isSelected ? 'Sedang Ditinjau' : 'Tinjau Profil'}
                            </button>

                            <DropdownMenu>
                              <DropdownMenuTrigger
                                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                                title="Aksi Tambahan"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44 bg-white border border-slate-200">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEdit(athlete);
                                  }}
                                  className="text-xs cursor-pointer gap-2"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                                  Edit Profil
                                </DropdownMenuItem>
                                {!isCaptain && (
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMakeCaptain(athlete);
                                    }}
                                    className="text-xs cursor-pointer gap-2 text-amber-700"
                                  >
                                    <Crown className="w-3.5 h-3.5 text-amber-500" />
                                    Jadikan Kapten Tim
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteConfirmAthlete(athlete);
                                  }}
                                  className="text-xs cursor-pointer gap-2 text-red-600 focus:text-red-700"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Hapus / Arsipkan
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Table View */
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                          <tr>
                            <th className="py-3 px-4"># No</th>
                            <th className="py-3 px-4">Nama Lengkap</th>
                            <th className="py-3 px-4">Gender</th>
                            <th className="py-3 px-4">Posisi</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4">Kontak</th>
                            <th className="py-3 px-4 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredAthletes.map((athlete) => {
                            const isSelected = selectedAthlete?.id === athlete.id;
                            const activeRoster = athlete.rosters?.find((r) => r.season?.is_active);
                            const isCaptain = activeRoster?.is_captain;

                            return (
                              <tr
                                key={athlete.id}
                                onClick={() => setSelectedAthleteId(athlete.id)}
                                className={`cursor-pointer transition-colors ${
                                  isSelected ? 'bg-red-50/40' : 'hover:bg-slate-50'
                                }`}
                              >
                                <td className="py-3 px-4 font-mono font-bold text-red-700">
                                  #{String(athlete.jersey_number).padStart(2, '0')}
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex flex-col">
                                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                                      {athlete.full_name}
                                      {isCaptain && (
                                        <Crown className="w-3.5 h-3.5 text-amber-500" />
                                      )}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      {athlete.player_id}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <span
                                    className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                      athlete.gender === 'MALE'
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'bg-purple-50 text-purple-700'
                                    }`}
                                  >
                                    {athlete.gender === 'MALE' ? 'Putra (M)' : 'Putri (F)'}
                                  </span>
                                </td>
                                <td className="py-3 px-4 font-medium text-slate-700">
                                  {athlete.position || '-'}
                                </td>
                                <td className="py-3 px-4">
                                  <span
                                    className={`px-2 py-0.5 rounded-full font-bold text-[10px] font-mono ${
                                      athlete.status === 'ACTIVE'
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : athlete.status === 'INJURED'
                                        ? 'bg-rose-50 text-rose-700'
                                        : 'bg-slate-100 text-slate-700'
                                    }`}
                                  >
                                    {athlete.status}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                                  {athlete.phone || '-'}
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenEdit(athlete);
                                      }}
                                      className="p-1 hover:bg-slate-200 rounded text-slate-600"
                                      title="Edit"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setDeleteConfirmAthlete(athlete);
                                      }}
                                      className="p-1 hover:bg-red-50 rounded text-red-600"
                                      title="Hapus"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Pane: Active Tactical Dossier (5 cols on lg, 4 on xl) */}
              <div className="lg:col-span-5 xl:col-span-4 sticky top-24">
                {selectedAthlete ? (
                  <div className="p-6 rounded-2xl bg-white shadow-md border border-slate-200/90 space-y-5">
                    {/* Dossier Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                          Active Tactical Dossier
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                          title="Cetak Dossier"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Selected Athlete Profile Summary */}
                    <div className="flex items-start gap-4">
                      <div className="relative flex-shrink-0">
                        <div
                          className={`w-20 h-20 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-md border-2 ${
                            selectedAthlete.gender === 'MALE'
                              ? 'bg-blue-100 text-blue-800 border-blue-200'
                              : 'bg-purple-100 text-purple-800 border-purple-200'
                          }`}
                        >
                          {selectedAthlete.full_name.charAt(0)}
                        </div>
                        <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full font-mono text-xs font-bold bg-[#b91c1c] text-white shadow-xs">
                          #{String(selectedAthlete.jersey_number).padStart(2, '0')}
                        </span>
                      </div>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-slate-900 truncate">
                            {selectedAthlete.full_name}
                          </h3>
                          <span
                            className={`px-2 py-0.2 rounded-full text-[10px] font-bold font-mono ${
                              selectedAthlete.gender === 'MALE'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-purple-50 text-purple-700'
                            }`}
                          >
                            {selectedAthlete.gender === 'MALE' ? 'PUTRA' : 'PUTRI'}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-red-700">
                          {selectedAthlete.rosters?.some((r) => r.is_captain)
                            ? 'Kapten Tim Utama • '
                            : ''}
                          {selectedAthlete.position || 'Attacker / Rebounder'}
                        </span>
                        <p className="text-[11px] text-slate-500 mt-1">
                          ID: {selectedAthlete.player_id} • Usia {calculateAge(selectedAthlete.date_of_birth)} tahun
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              selectedAthlete.status === 'ACTIVE'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                selectedAthlete.status === 'ACTIVE'
                                  ? 'bg-emerald-600'
                                  : 'bg-rose-600'
                              }`}
                            />
                            {selectedAthlete.status === 'ACTIVE'
                              ? 'Green Cleared (Fit)'
                              : 'Medical Rest Hold'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Physical Dimension Grid */}
                    <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">
                          No. Punggung
                        </span>
                        <span className="font-mono text-sm font-bold text-slate-900">
                          #{selectedAthlete.jersey_number}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">
                          Gender
                        </span>
                        <span className="font-mono text-sm font-bold text-slate-900">
                          {selectedAthlete.gender === 'MALE' ? 'Putra' : 'Putri'}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">
                          Status Roster
                        </span>
                        <span className="font-mono text-sm font-bold text-emerald-700">
                          Terdaftar
                        </span>
                      </div>
                    </div>

                    {/* Tactical Competencies (IKF Standard) */}
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                          Kompetensi Taktis IKF
                        </span>
                        <span className="font-mono text-xs text-red-700 font-bold">
                          IKF Rating
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-slate-700">Shooting Precision (Jarak Jauh)</span>
                            <span className="font-mono font-bold text-red-700">88%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full bg-red-600 rounded-full" style={{ width: '88%' }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-slate-700">Rebound Control & Boxing</span>
                            <span className="font-mono font-bold text-slate-900">82%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full bg-blue-600 rounded-full" style={{ width: '82%' }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-slate-700">Transisi Zona (40m Sprint)</span>
                            <span className="font-mono font-bold text-slate-900">90%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full bg-red-700 rounded-full" style={{ width: '90%' }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-slate-700">Visi Assist & Kerja Sama Tim</span>
                            <span className="font-mono font-bold text-emerald-600">85%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full bg-emerald-600 rounded-full" style={{ width: '85%' }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Catatan Medis & Kontak */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                        Kontak & Informasi Tambahan
                      </span>
                      <div className="text-slate-700">
                        <span className="text-slate-400">Telepon:</span> {selectedAthlete.phone || 'Tidak tercantum'}
                      </div>
                      <div className="text-slate-700">
                        <span className="text-slate-400">Kontak Darurat:</span>{' '}
                        {selectedAthlete.emergency_contact
                          ? `${selectedAthlete.emergency_contact} (${selectedAthlete.emergency_phone || '-'})`
                          : 'Tidak ada'}
                      </div>
                      {selectedAthlete.notes && (
                        <div className="pt-1 text-slate-600 italic border-t border-slate-200 mt-1">
                          &quot;{selectedAthlete.notes}&quot;
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-2 flex items-center gap-2">
                      <Button
                        onClick={() => handleOpenEdit(selectedAthlete)}
                        variant="outline"
                        className="flex-1 text-xs h-9 gap-1.5 border-slate-300"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit Data Atlet
                      </Button>
                      {!selectedAthlete.rosters?.some((r) => r.is_captain) && (
                        <Button
                          onClick={() => handleMakeCaptain(selectedAthlete)}
                          className="text-xs h-9 gap-1.5 bg-amber-600 hover:bg-amber-700 text-white"
                        >
                          <Crown className="w-3.5 h-3.5" />
                          Jadikan Kapten
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-400">
                    Pilih atlet dari daftar untuk melihat Active Tactical Dossier.
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Dialog Registrasi & Edit Atlet */}
      <AthleteFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        athlete={editingAthlete}
        activeSeasonId={activeSeason?.id}
      />

      {/* Dialog Konfirmasi Hapus Atlet */}
      <Dialog
        open={!!deleteConfirmAthlete}
        onOpenChange={(open) => !open && setDeleteConfirmAthlete(null)}
      >
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl border border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              Arsipkan / Hapus Atlet
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 pt-2">
              Apakah Anda yakin ingin menghapus atlet{' '}
              <strong className="text-slate-900">
                {deleteConfirmAthlete?.full_name} (#{deleteConfirmAthlete?.jersey_number})
              </strong>
              ? Data atlet akan diarsipkan dan dilepaskan dari penugasan roster aktif.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmAthlete(null)}
              className="text-xs h-9 px-4"
            >
              Batal
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleteAthlete.isPending}
              className="bg-red-700 hover:bg-red-800 text-white text-xs h-9 px-4 gap-2"
            >
              {deleteAthlete.isPending ? 'Menghapus...' : 'Ya, Hapus Atlet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
