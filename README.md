# Korfball Bantul Team Management System

Sistem manajemen operasional tim Korfball Bantul untuk atlet, coach, dan manager.

## Teknologi
- **Frontend**: Next.js, Tailwind CSS, ShadcnUI, Zustand, TanStack Query
- **Backend**: NestJS, TypeORM
- **Database**: NeonDB (PostgreSQL)
- **Autentikasi**: Neon Auth
- **Penyimpanan**: Neon Object Storage

## Struktur Repositori
- `apps/web`: Aplikasi Frontend (Next.js)
- `apps/api`: Aplikasi Backend (NestJS)
- `docs/`: Dokumentasi Sistem (PRD, Architecture, Progress)

## Persyaratan
- Node.js (v18+)
- npm (v9+)

## Menjalankan Aplikasi Lokal
Dari root direktori, jalankan:
```bash
npm install
npm run dev
```
Ini akan menjalankan Frontend di `localhost:3000` dan Backend di `localhost:4000`.
