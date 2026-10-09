'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { LogIn, AlertCircle, Loader2 } from 'lucide-react';
import { signInWithEmail } from '../../lib/neon-auth';
import { useAuthStore } from '../../store/useAuthStore';
import apiClient from '../../lib/axios';

const loginSchema = z.object({
  email: z.string().email('Format email tidak valid').min(1, 'Email wajib diisi'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // 1. Sign in via Neon Auth
      const authResult = await signInWithEmail(values);

      // 2. Fetch user profile from backend NestJS (/api/v1/auth/me)
      localStorage.setItem('korfball_auth_token', authResult.token);
      document.cookie = `korfball_auth_token=${encodeURIComponent(authResult.token)}; path=/; max-age=604800; SameSite=Lax`;
      
      const profileRes = await apiClient.get<any, { success: boolean; data: any }>('/auth/me');
      
      if (profileRes.data?.user) {
        setAuth(authResult.token, profileRes.data.user, profileRes.data.athlete);
      }

      // 3. Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat masuk ke sistem.');
      localStorage.removeItem('korfball_auth_token');
      document.cookie = 'korfball_auth_token=; path=/; max-age=0; SameSite=Lax';
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (role: 'MANAGER' | 'COACH' | 'ATHLETE' | 'VIEWER') => {
    let token = 'demo-coach-jwt-token';
    let user: {
      id: string;
      email: string;
      full_name: string;
      role: 'MANAGER' | 'COACH' | 'ATHLETE' | 'VIEWER';
      status: 'ACTIVE' | 'DISABLED';
    } = {
      id: 'cb562430-1718-4bd0-8703-cc507758aa30',
      email: 'coach@korfballbantul.com',
      full_name: 'Budi Santoso (Coach)',
      role: 'COACH',
      status: 'ACTIVE',
    };

    if (role === 'MANAGER') {
      token = 'demo-manager-jwt-token';
      user = {
        id: '8af9ac81-8b1c-4cda-809c-668f3f5f9d35',
        email: 'manager@korfballbantul.com',
        full_name: 'Fadhil Manager',
        role: 'MANAGER',
        status: 'ACTIVE',
      };
    } else if (role === 'ATHLETE') {
      token = 'demo-athlete-jwt-token';
      user = {
        id: '43aa9df0-afb7-4294-94bc-d2f4961039f2',
        email: 'kb-01@korfballbantul.com',
        full_name: 'Andi Pratama',
        role: 'ATHLETE',
        status: 'ACTIVE',
      };
    } else if (role === 'VIEWER') {
      token = 'demo-viewer-jwt-token';
      user = {
        id: 'e0000000-0000-0000-0000-000000000001',
        email: 'viewer@korfballbantul.com',
        full_name: 'Bambang Pengda KONI',
        role: 'VIEWER',
        status: 'ACTIVE',
      };
    }

    setAuth(token, user);
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-200">
          <LogIn className="h-7 w-7 text-white" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-slate-900">
          Korfball Bantul Hub
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Sistem Manajemen Tim Atlet, Coach & Manager
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          {errorMessage && (
            <div className="mb-6 flex items-start gap-3 rounded-lg bg-red-50 p-4 border border-red-200 text-red-800 text-sm">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Alamat Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="contoh: coach@korfballbantul.com"
                  {...register('email')}
                  className={`block w-full appearance-none rounded-lg border px-3 py-2.5 shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 sm:text-sm transition-all ${
                    errors.email
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-600'
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register('password')}
                  className={`block w-full appearance-none rounded-lg border px-3 py-2.5 shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 sm:text-sm transition-all ${
                    errors.password
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-600'
                  }`}
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center items-center gap-2 rounded-lg bg-[#b91c1c] py-2.5 px-4 text-sm font-semibold text-white shadow-md shadow-red-900/20 hover:bg-[#991b1b] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Sedang Masuk...</span>
                  </>
                ) : (
                  <span>Masuk ke Akun</span>
                )}
              </button>

              <div className="pt-2">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-slate-400 font-semibold">
                      Atau Masuk Cepat per Role (Mode Uji)
                    </span>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('MANAGER')}
                    className="flex justify-center items-center gap-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 py-2 px-3 text-xs font-semibold text-slate-700 transition-all border border-slate-200 hover:border-slate-300 cursor-pointer"
                  >
                    <span>👔 Manager</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('COACH')}
                    className="flex justify-center items-center gap-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 py-2 px-3 text-xs font-semibold text-slate-700 transition-all border border-slate-200 hover:border-slate-300 cursor-pointer"
                  >
                    <span>📋 Coach</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('ATHLETE')}
                    className="flex justify-center items-center gap-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 py-2 px-3 text-xs font-semibold text-slate-700 transition-all border border-slate-200 hover:border-slate-300 cursor-pointer"
                  >
                    <span>🏃 Athlete</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('VIEWER')}
                    className="flex justify-center items-center gap-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 py-2 px-3 text-xs font-semibold text-slate-700 transition-all border border-slate-200 hover:border-slate-300 cursor-pointer"
                  >
                    <span>👁️ Viewer</span>
                  </button>
                </div>
              </div>
            </div>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-4 text-center text-xs text-slate-400">
            Korfball Bantul Team Management System &copy; 2026
          </div>
        </div>
      </div>
    </div>
  );
}
