# KORFBALL BANTUL TEAM MANAGEMENT SYSTEM — AI Agent Instructions & Guidelines (AGENTS.md)

Dokumen ini adalah instruksi operasional resmi (Guidelines) bagi AI Agent (serta pengembang manapun) yang akan memodifikasi, menambah, atau merefaktor source code pada repositori ini.

---

## 🛑 1. Aturan Mutlak (Hard Constraints)

AI AGENT **DILARANG KERAS** melanggar aturan-aturan berikut:
1. **NO DIRECT DB ACCESS DARI FRONTEND**: Frontend (Next.js) sama sekali tidak boleh memanggil database NeonDB secara langsung. Semua komunikasi data wajib melalui layer HTTP ke REST API NestJS.
2. **NO CLIENT-SIDE CALCULATIONS**: Perhitungan agregat, result pertandingan, *attendance rate*, atau komputasi metrik final harus dikalkulasi dan di-serve oleh NestJS (Backend). Frontend hanya bertugas menampilkan (rendering).
3. **ONLY SPECIFIED STACK**: Jangan mengusulkan atau meng-install package di luar arsitektur yang telah disepakati (misal: Jangan pakai Prisma jika sudah disepakati TypeORM, Jangan pakai Fetch jika sudah disepakati Axios).
4. **MANDATORY SWAGGER / OPENAPI REGISTRATION**: Setiap kali membuat Controller atau Endpoint baru pada Backend NestJS, AI Agent dan Developer **WAJIB MENDAFTARKAN DAN MENDEKORASINYA SECARA LENGKAP PADA SWAGGER** (`@ApiTags`, `@ApiOperation`, `@ApiResponse`, `@ApiBearerAuth`, `@ApiParam`, `@ApiBody`). Dilarang keras membiarkan endpoint tanpa dokumentasi Swagger. Akses UI Swagger selalu tersedia di `http://localhost:4000/api/docs`.

---

## 🛠️ 2. Standar Teknologi & Ekosistem
- **Backend**: NestJS, TypeORM, PostgreSQL (NeonDB)
- **Frontend**: Next.js (App Router disarankan jika relevan), TypeScript, Tailwind CSS, ShadcnUI, React Hook Form, Zod, Zustand, TanStack Query, Axios.
- **Autentikasi**: Neon Auth
- **Penyimpanan File**: Neon Object Storage

---

## 🔌 3. Standar Kontrak API (NestJS -> Next.js)

### Pola Base URL:
`http://localhost:4000/api/v1`

### Format Standard Response JSON:
Semua API (berhasil atau gagal) harus mereturn struktur yang konsisten (Interceptor NestJS dapat digunakan untuk standardisasi ini):
```json
{
  "success": true,
  "data": { ... },
  "message": "Operasi berhasil",
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50
  }
}
```
**Untuk Error:**
```json
{
  "success": false,
  "error": "Bad Request",
  "message": ["player_id harus unik"],
  "statusCode": 400
}
```

---

## 🏗️ 4. Pola Implementasi (Implementation Pattern)

### Backend (NestJS):
Ikuti arsitektur standar NestJS:
- `Modules`: Mengatur boundary setiap domain (TeamModule, MatchModule).
- `Controllers`: Hanya menangani HTTP Request, DTO validation (via `class-validator` / Zod), dan return format.
- `Services`: Menyimpan *core business logic*, perhitungan agregat.
- `Entities` (TypeORM): Definisi skema tabel.
- `Swagger Decorators (WAJIB)`: Setiap Controller WAJIB didekorasi `@ApiTags('[Nama Modul]')`, dan setiap handler method WAJIB didekorasi `@ApiOperation({ summary: '...' })`, `@ApiResponse()`, serta `@ApiBearerAuth('JWT-auth')` untuk route terproteksi.

### Frontend (Next.js):
- **Axios Instance**: Buat *custom axios instance* (`src/lib/axios.ts`) untuk mengelola Bearer token (Neon Auth) & global error handling.
- **TanStack Query Hooks**: Buat custom hooks untuk fetching data (misal: `useGetAthletes()`, `useCreateAthlete()`). Jangan memanggil axios secara sporadis di dalam komponen secara langsung.
- **Zustand**: Gunakan hanya untuk *client global state* (misal: theme, UI toggles, state yang tidak ada di server).
- **Form validation**: WAJIB menggunakan `react-hook-form` dikombinasikan dengan `@hookform/resolvers/zod`.

---

## ✅ 5. Prosedur Pengerjaan Menggunakan PROGRESS.md
Setiap kali AI Agent memulai sebuah instruksi koding yang kompleks:
1. Periksa `docs/PROGRESS.md` untuk mengetahui fase mana yang sedang dikerjakan.
2. Kerjakan tugas sesuai dengan checklist pada fase terkait.
3. Selalu pertahankan modularitas kode.
4. Lakukan penulisan *types/interfaces* TypeScript secara ketat (*Strict Mode*). Jangan gunakan `any`.
5. Apabila menemukan blokade (blocker), komunikasikan terlebih dahulu alih-alih membuat asumsi arsitektural yang melenceng dari panduan ini.
