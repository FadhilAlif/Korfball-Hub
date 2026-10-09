'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Bell, Calendar, ChevronRight, Users, Shield, Trophy } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useGetTeam } from '../../hooks/useTeams';

interface HeaderProps {
  title?: string;
  category?: string;
}

export function Header({ title, category }: HeaderProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { data: team } = useGetTeam();

  // Find active season
  const activeSeason = team?.seasons?.find((s) => s.is_active);

  // Compute breadcrumbs if not explicitly passed
  let section = category;
  let pageName = title;

  if (!pageName) {
    if (pathname.includes('/athletes')) {
      section = 'Team Management';
      pageName = 'Active Squad Roster';
    } else if (pathname.includes('/team')) {
      section = 'Team Management';
      pageName = 'Profil Tim & Musim';
    } else if (pathname.includes('/training')) {
      section = 'Training Operations';
      pageName = 'Sessions & Drills';
    } else if (pathname.includes('/attendance')) {
      section = 'Training Operations';
      pageName = 'Attendance Logger';
    } else if (pathname.includes('/matches')) {
      section = 'Competition';
      pageName = 'Match Schedules & Results';
    } else {
      section = 'Main';
      pageName = 'Dashboard';
    }
  }

  // Format today's date in Indonesian on client mount
  const [today, setToday] = React.useState('');

  React.useEffect(() => {
    setToday(
      new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(new Date()),
    );
  }, []);

  return (
    <header className="fixed top-0 left-72 right-0 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 z-30 flex items-center justify-between px-8">
      {/* Left: Breadcrumbs & Active Season Tag */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Users className="w-4 h-4 text-slate-400" />
          <span>{section}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="font-semibold text-slate-900">{pageName}</span>
        </div>

        {activeSeason && (
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
            <span>{activeSeason.name}</span>
          </div>
        )}
      </div>

      {/* Right: Date Badge, Notifications, User Indicator */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600">
          <Calendar className="w-3.5 h-3.5 text-red-600" />
          <span>{today}</span>
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <span className="text-red-700 font-bold">Korfball Bantul</span>
        </div>

        <button
          type="button"
          aria-label="Notifikasi"
          className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600 ring-2 ring-white" />
        </button>

        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-red-800 text-white font-bold text-xs flex items-center justify-center uppercase shadow-sm">
            {user?.full_name ? user.full_name.charAt(0) : 'K'}
          </div>
          <div className="hidden xl:flex flex-col">
            <span className="text-xs font-semibold text-slate-900 leading-tight">
              {user?.full_name || 'Coach Fadhil Alif'}
            </span>
            <span className="text-[10px] text-slate-500 leading-tight">
              {user?.role || 'COACH'} • Korfball Bantul
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
