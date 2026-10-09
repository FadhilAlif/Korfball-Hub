'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Users,
  Calendar,
  ClipboardCheck,
  Trophy,
  Bell,
  Settings,
  LogOut,
  Shield,
  FileText,
  LayoutDashboard,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { signOut } from '../../lib/neon-auth';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = async () => {
    await signOut();
    clearAuth();
    router.push('/login');
  };

  const navSections: NavSection[] = [
    {
      title: 'Main',
      items: [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'Team Management',
      items: [
        { label: 'Active Roster & Atlet', href: '/athletes', icon: Users },
        { label: 'Profil Tim & Musim', href: '/team', icon: Shield },
      ],
    },
    {
      title: 'Training Operations',
      items: [
        { label: 'Sessions & Drills', href: '/training', icon: Calendar },
        { label: 'Attendance Logger', href: '/attendance', icon: ClipboardCheck },
      ],
    },
    {
      title: 'Competition',
      items: [
        { label: 'Match Schedules & Result', href: '/matches', icon: Trophy },
      ],
    },
    {
      title: 'Administrative',
      items: [
        { label: 'Announcements', href: '/announcements', icon: Bell },
        { label: 'Documents & Storage', href: '/documents', icon: FileText },
      ],
    },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-[#0E121A] border-r border-slate-800/60 z-50 flex flex-col justify-between overflow-y-auto">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white font-black text-lg shadow-md shadow-red-900/50">
              K
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white text-base tracking-tight">Korfball Hub</span>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">
                Bantul Reg. Management
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#181F2C] text-slate-300 border border-slate-700/60">
            DIY
          </span>
        </div>

        {/* Navigation Sections */}
        <nav className="flex flex-col gap-4 px-4 py-5">
          {navSections.map((section) => (
            <div key={section.title} className="flex flex-col gap-1">
              <span className="px-3 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {section.title}
              </span>
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#b91c1c] text-white shadow-sm'
                        : 'text-slate-300 hover:bg-[#181F2C] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-600 text-white">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-slate-800/60 bg-[#0E121A]">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#181F2C] border border-slate-800/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-xs uppercase">
                {user?.full_name ? user.full_name.charAt(0) : 'U'}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#181F2C]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-white truncate">
                {user?.full_name || 'Pengguna'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono truncate">
                {user?.role || 'MEMBER'}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Keluar"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
