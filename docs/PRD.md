# KORFBALL BANTUL TEAM MANAGEMENT SYSTEM
### Platform Manajemen Operasional Satu Tim Korfball untuk Atlet, Coach, dan Manager

| Metadata Dokumen | Nilai |
|------------------|-------|
| **Versi** | 1.0 |
| **Tanggal Terbit** | 2026-10-08 |
| **Status** | Draft |
| **Penulis / Pemilik** | Fadhil Alif |
| **Target Release / Deadline** | MVP pilot 6–8 minggu setelah kickoff development |

---

## 1. Latar Belakang & Masalah Bisnis

### 1.1 Latar Belakang

Korfball Bantul membutuhkan cara yang lebih terstruktur untuk mengelola operasional satu tim, terutama data atlet, roster, jadwal latihan, kehadiran, pertandingan, statistik dasar, dan komunikasi tim.

Dalam konteks tim olahraga komunitas/amateur, informasi operasional berpotensi tersebar pada chat, spreadsheet, catatan pribadi, dan komunikasi lisan. Kondisi tersebut menyulitkan coach atau manager untuk menjawab pertanyaan sederhana secara cepat, misalnya:

- Siapa saja atlet aktif dalam roster saat ini?
- Berapa persentase kehadiran setiap atlet dalam satu periode latihan?
- Siapa yang tersedia untuk pertandingan tertentu?
- Siapa saja yang dipilih ke dalam match squad?
- Bagaimana riwayat pertandingan dan performa dasar tim?
- Kapan latihan atau pertandingan berikutnya?
- Apakah anggota tim sudah menerima perubahan jadwal atau pengumuman?

MVP ini dibangun untuk menyelesaikan problem operasional tersebut pada **satu tim Korfball Bantul terlebih dahulu**, tanpa mencoba langsung menyelesaikan kebutuhan seluruh pengurus daerah atau KONI.

Keputusan product utama pada fase ini adalah memprioritaskan **frekuensi penggunaan dan kemudahan operasional harian** dibandingkan breadth fitur. Produk dianggap berhasil apabila satu tim dapat menggunakan sistem secara konsisten untuk mengelola satu siklus aktivitas latihan dan pertandingan.

### 1.2 Pendekatan Solusi

Sistem dirancang sebagai **web application modular** dengan pendekatan **modular monolith** pada backend untuk menjaga kesederhanaan implementasi MVP dan tetap menyediakan pemisahan domain yang jelas.

Arsitektur awal yang diusulkan:

`Next.js + TypeScript` → `REST API` → `NestJS` → `PostgreSQL`

Domain utama dipisahkan secara logis menjadi:

1. Identity & Access
2. Team & Athlete
3. Training
4. Attendance
5. Match
6. Statistics
7. Communication
8. Reporting & Audit

Model data harus dirancang agar satu tim menjadi tenant/logical boundary pada MVP, tetapi tidak mengunci desain database sehingga pada fase berikutnya dapat berkembang menjadi multi-team atau federation-level platform.

---

## 2. Tujuan Produk & Indikator Keberhasilan

| Kode | Tujuan Produk (Goal) | Deskripsi | Indikator Keberhasilan (Success Metric / KPI) |
|------|----------------------|-----------|-----------------------------------------------|
| G-01 | Sentralisasi Data Tim | Menyediakan satu sumber data untuk atlet, staff, roster, jadwal, dan status anggota tim. | ≥95% anggota aktif tim tercatat di sistem; tidak ada duplicate Player ID aktif. |
| G-02 | Simplifikasi Operasional Latihan | Memungkinkan coach/manager membuat sesi latihan dan mencatat kehadiran tanpa spreadsheet manual. | Pembuatan training session ≤2 menit; attendance satu sesi ≤2 menit untuk maksimal 30 anggota. |
| G-03 | Simplifikasi Operasional Pertandingan | Memungkinkan manager/coach mengelola match squad, hasil pertandingan, dan statistik dasar. | Match record dapat dibuat ≤3 menit; hasil pertandingan tersimpan tanpa duplicate match. |
| G-04 | Meningkatkan Visibilitas Anggota | Memberikan athlete akses ke jadwal, attendance, roster pertandingan, dan statistik pribadi. | ≥80% atlet aktif melakukan login minimal sekali dalam 30 hari pada pilot. |
| G-05 | Meningkatkan Ketepatan Komunikasi | Menyediakan announcement terpusat untuk perubahan jadwal dan informasi penting tim. | ≥90% announcement penting memiliki status published dan timestamp yang tercatat. |
| G-06 | Menyediakan Reporting Dasar | Memudahkan manager/coach melihat performa operasional tim per periode/season. | Attendance, match record, dan statistik pemain dapat ditampilkan dan diekspor sesuai filter aktif. |
| G-07 | Validasi Product dengan User Nyata | Menguji MVP pada satu tim Korfball Bantul sebelum memperluas scope ke organisasi yang lebih besar. | Minimal 1 coach/manager dan ≥10 atlet menggunakan MVP dalam pilot sekurang-kurangnya 4 minggu. |

---

## 3. Pengguna Target & Persona

| Role Pengguna | Deskripsi Tanggung Jawab | Kebutuhan Utama pada Sistem | Hak Akses |
|---------------|--------------------------|-----------------------------|-----------|
| **Team Manager / Admin** | Mengelola data tim, anggota, jadwal, pertandingan, komunikasi, dan laporan. | CRUD data tim/anggota; roster; calendar; attendance review; match; announcement; export. | Read, Create, Update, Delete, Publish, Export |
| **Coach** | Menyusun latihan, memantau attendance, memilih squad, dan mencatat evaluasi/performa dasar. | Training builder; attendance; availability; match squad; player stats; team analytics. | Read, Create, Update, Publish, Export |
| **Athlete** | Mengikuti latihan dan pertandingan serta menjaga status ketersediaan pribadi. | Profile; schedule; availability; attendance confirmation; roster; statistik pribadi; announcement. | Read, Update own profile/availability, Confirm |
| **Viewer** | Pengurus/official yang membutuhkan akses baca tanpa perubahan data. | Melihat roster, jadwal, hasil pertandingan, dan laporan yang diberikan izin. | Read, Export terbatas |

### 3.1 Matriks Hak Akses Utama

| Modul | Manager | Coach | Athlete | Viewer |
|------|:------:|:-----:|:------:|:------:|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Team Profile | CRUD | Read | Read | Read |
| Athlete Registry | CRUD | Read/Update terbatas | Read own | Read |
| Roster | CRUD | CRUD | Read | Read |
| Schedule | CRUD | CRUD | Read | Read |
| Training Session | CRUD | CRUD | Read | Read |
| Attendance | CRUD | CRUD | Confirm own | Read |
| Availability | CRUD | Update/Read | Update own | Read |
| Match | CRUD | CRUD | Read | Read |
| Match Squad | CRUD | CRUD | Read own status | Read |
| Match Result | CRUD | CRUD | Read | Read |
| Player Statistics | CRUD | CRUD | Read own | Read |
| Announcement | CRUD/Publish | Create/Publish | Read | Read |
| Reports | Export | Export | Own data | Export terbatas |
| Documents | CRUD | Read/Upload sesuai izin | Read own | Read |
| Audit Log | Read | Read terbatas | Tidak tersedia | Tidak tersedia |
| Settings | CRUD | Read | Own settings | Tidak tersedia |

---

## 4. Ruang Lingkup Proyek (Scope)

### 4.1 Dalam Ruang Lingkup (In-Scope)

- [ ] Autentikasi login/logout berbasis email dan password.
- [ ] Role-based access control untuk Manager, Coach, Athlete, dan Viewer.
- [ ] Team profile untuk satu tim Korfball Bantul.
- [ ] Athlete registry: data profil, nomor punggung, posisi, status, join date, dan kontak dasar.
- [ ] Staff registry untuk Coach dan Manager.
- [ ] Roster aktif dan roster per pertandingan.
- [ ] Season management minimal untuk membedakan data antar musim.
- [ ] Calendar aktivitas tim: training, match, meeting, dan event internal.
- [ ] Training session management: tanggal, waktu, venue, objective, notes, dan activities.
- [ ] Training drill/library sederhana.
- [ ] Attendance training dengan status Present, Late, Absent, Excused.
- [ ] Athlete availability untuk training/match.
- [ ] Match management: opponent, venue, competition, waktu, tipe home/away, dan notes.
- [ ] Match squad selection.
- [ ] Match result recording.
- [ ] Match event recording minimal untuk goal dan pemain terkait.
- [ ] Statistik pertandingan dasar: appearances, starting/substitute, minutes, goals, assists, cards.
- [ ] Player statistics aggregation per season.
- [ ] Team statistics dasar: matches, wins, losses, win rate, goals for, goals against.
- [ ] Announcement dan pengelolaan informasi tim.
- [ ] Dashboard role-aware.
- [ ] Filter dan search untuk data utama.
- [ ] Export data operasional minimal CSV/XLSX untuk attendance, roster, match, dan statistics.
- [ ] Audit log untuk perubahan data kritis.
- [ ] Error handling standar untuk frontend dan backend.
- [ ] Responsive web interface untuk desktop dan mobile browser.

### 4.2 Di Luar Ruang Lingkup (Out-of-Scope)

- ⛔ Multi-tenant federation platform pada rilis MVP.
- ⛔ Integrasi dengan KONI atau organisasi olahraga eksternal.
- ⛔ Sistem registrasi atlet resmi tingkat Pengda/Indonesia.
- ⛔ Payment gateway atau iuran anggota otomatis.
- ⛔ Native mobile app iOS/Android.
- ⛔ Integrasi Garmin, Apple Health, Google Fit, atau wearable lainnya.
- ⛔ Medical record lengkap dan penyimpanan diagnosis/rekam medis.
- ⛔ AI untuk talent identification, player ranking, atau automated coaching.
- ⛔ Video analysis dan computer vision.
- ⛔ Live streaming pertandingan.
- ⛔ Public tournament marketplace.
- ⛔ Social media feed kompleks.
- ⛔ SSO organisasi atau integrasi identity provider eksternal.
- ⛔ Advanced tactical board dan playbook animation.

---

## 5. Spesifikasi Fungsional

### 5.1 Dashboard

**Tujuan**: Menyediakan ringkasan operasional tim yang relevan sesuai role pengguna setelah login.

#### A. Komponen Antarmuka (UI Components)

| Komponen UI | Tipe Elemen | Fungsi & Perilaku (Behavior) |
|-------------|-------------|-------------------------------|
| Team Header | Header / Summary Card | Menampilkan nama tim, season aktif, logo, dan role pengguna. |
| Next Activity | Information Card | Menampilkan aktivitas tim terdekat berdasarkan `start_datetime` yang paling dekat dan belum selesai. |
| Athlete Count | KPI Card | Menampilkan jumlah athlete dengan status Active. |
| Attendance KPI | KPI Card | Menampilkan rata-rata attendance pada periode default 30 hari terakhir. |
| Match Record | KPI Card | Menampilkan jumlah pertandingan, menang, kalah pada season aktif. |
| Upcoming Events | List | Menampilkan maksimal 5 aktivitas berikutnya. |
| Recent Results | List | Menampilkan maksimal 5 match terakhir yang sudah berstatus Completed. |
| Quick Action | Button Group | Manager/Coach dapat membuat Training atau Match dari dashboard. |

#### B. Struktur Data Utama

| Nama Tampilan | Sumber Data (Field/DB) | Tipe Data | Format / Rumus Tampilan |
|---------------|------------------------|-----------|-------------------------|
| Active Athletes | `athletes.status` | Integer | `COUNT(status = ACTIVE)` |
| Attendance | `training_attendance.status` | Decimal | `Present / eligible attendance records * 100`, dibulatkan 1 desimal |
| Matches | `matches.season_id` | Integer | `COUNT(completed matches)` |
| Wins | `matches.result` | Integer | `COUNT(result = WIN)` |
| Win Rate | `matches.result` | Decimal | `Wins / Completed Matches * 100`; `0%` jika tidak ada match selesai |
| Next Activity | `activities.start_datetime` | DateTime | `DD MMM YYYY, HH:mm` |

#### C. Data Source

Data dashboard mengambil data teragregasi dari `teams`, `seasons`, `athletes`, `training_sessions`, `training_attendance`, dan `matches` menggunakan endpoint dashboard khusus agar frontend tidak melakukan agregasi bisnis sendiri.

---

### 5.2 Authentication, User & Role Management

**Tujuan**: Mengamankan akses sistem dan memastikan tiap pengguna hanya dapat melakukan tindakan sesuai role.

#### A. Field Form

| Nama Field | Tipe Input | Wajib | Aturan Validasi | Nilai Default / Sumber Opsi |
|------------|------------|-------|-----------------|-----------------------------|
| Email | Email Input | Ya | Valid email; lowercase untuk canonical value; maks. 254 karakter | Kosong |
| Password | Password Input | Ya saat create/login | Min. 8 karakter; wajib mengandung huruf dan angka | Kosong |
| Full Name | Text Input | Ya | 2–100 karakter; trim whitespace | Kosong |
| Role | Select | Ya untuk Manager/Coach provisioning | Hanya `MANAGER`, `COACH`, `ATHLETE`, `VIEWER` | Role diberikan Manager |
| Athlete ID | Select/Autocomplete | Hanya role Athlete | Wajib menunjuk athlete record aktif | Data athlete |
| Account Status | Select | Ya saat administrasi | `ACTIVE`, `DISABLED` | `ACTIVE` |

#### B. Behavior

- User baru hanya dapat dibuat oleh Manager.
- Athlete account harus dapat dikaitkan ke tepat satu athlete profile aktif.
- Password tidak pernah dikembalikan oleh API.
- Login mengembalikan session/JWT sesuai implementasi final.
- User disabled tidak dapat login.

---

### 5.3 Team & Athlete Management

**Tujuan**: Menyediakan master data utama tim dan athlete yang menjadi sumber data bagi training, attendance, match, dan reporting.

#### A. Team Form

| Nama Field | Tipe Input | Wajib | Aturan Validasi | Nilai Default / Sumber Opsi |
|------------|------------|-------|-----------------|-----------------------------|
| Team Name | Text Input | Ya | 3–100 karakter; unik dalam scope season aktif | `Korfball Bantul` |
| Category | Select | Ya | Maks. 50 karakter | Nilai konfigurasi tim |
| Region | Text Input | Ya | 2–100 karakter | `Bantul` |
| Season | Select | Ya | Harus season aktif/tersedia | Active season |
| Home Venue | Text Input | Tidak | Maks. 200 karakter | Kosong |
| Description | Textarea | Tidak | Maks. 1.000 karakter | Kosong |

#### B. Athlete Form

| Nama Field | Tipe Input | Wajib | Aturan Validasi | Nilai Default / Sumber Opsi |
|------------|------------|-------|-----------------|-----------------------------|
| Player ID | Text Input | Ya | Unik; 3–30 karakter; alphanumeric + `-`/`_` | Manual oleh Manager |
| Full Name | Text Input | Ya | 2–100 karakter | Kosong |
| Display Name | Text Input | Tidak | Maks. 80 karakter | Full Name |
| Date of Birth | Date Picker | Ya | Tanggal valid dan tidak boleh di masa depan | Kosong |
| Gender | Select | Ya | `MALE`, `FEMALE` | Konfigurasi sistem |
| Jersey Number | Number Input | Ya | Integer 0–99; unik di active roster | Kosong |
| Position | Select | Tidak | Nilai position harus berasal dari master position | Konfigurasi sistem |
| Join Date | Date Picker | Ya | Tidak boleh setelah hari ini untuk athlete existing | Hari ini saat create |
| Status | Select | Ya | `ACTIVE`, `UNAVAILABLE`, `INJURED`, `SUSPENDED`, `INACTIVE` | `ACTIVE` |
| Phone | Text Input | Tidak | 8–20 karakter; hanya angka dan karakter telepon umum | Kosong |
| Emergency Contact | Text Input | Tidak | Maks. 100 karakter | Kosong |
| Emergency Phone | Text Input | Tidak | 8–20 karakter | Kosong |
| Notes | Textarea | Tidak | Maks. 500 karakter; tidak boleh berisi diagnosis medis | Kosong |

#### C. Data Grid

Kolom utama:

`Player ID`, `Name`, `Jersey Number`, `Position`, `Status`, `Join Date`, `Attendance 30D`, `Actions`.

Search berdasarkan `Player ID`, `Full Name`, dan `Display Name`. Filter berdasarkan `Status`, `Position`, dan `Gender`.

---

### 5.4 Roster & Athlete Availability

**Tujuan**: Memisahkan daftar athlete aktif dengan squad yang tersedia/terpilih untuk aktivitas tertentu.

#### A. Roster Management

| Komponen | Tipe | Fungsi |
|----------|------|--------|
| Active Roster | Multi-select / Table | Menentukan athlete yang menjadi anggota aktif tim pada season. |
| Jersey Number | Number Input | Menetapkan nomor punggung unik dalam active roster. |
| Captain | Toggle | Menandai maksimal satu captain aktif pada team-season. |
| Status | Select | `ACTIVE`, `INACTIVE`. |
| History | Read-only Table | Menampilkan perubahan roster berdasarkan tanggal efektif. |

#### B. Availability Form

| Nama Field | Tipe Input | Wajib | Aturan Validasi | Nilai Default |
|------------|------------|-------|-----------------|---------------|
| Activity | Select | Ya | Harus merujuk training/match yang valid | Aktivitas yang dibuka |
| Availability | Select | Ya | `AVAILABLE`, `MAYBE`, `UNAVAILABLE` | `AVAILABLE` |
| Reason | Textarea | Tidak | Maks. 250 karakter | Kosong |

#### C. Behavior

- Athlete hanya dapat mengubah availability miliknya sendiri.
- Manager/Coach dapat melihat availability seluruh athlete.
- Athlete berstatus `INACTIVE` tidak dapat dipilih ke active roster baru.
- Athlete yang `SUSPENDED` tidak dapat dipilih ke match squad.

---

### 5.5 Calendar & Schedule Management

**Tujuan**: Menjadi sumber jadwal tunggal untuk aktivitas tim.

#### A. UI Components

| Komponen UI | Tipe Elemen | Fungsi & Perilaku |
|-------------|-------------|-------------------|
| Calendar | Month/Week/List View | Menampilkan seluruh aktivitas team-season. |
| Activity Type Filter | Multi-select | Filter `TRAINING`, `MATCH`, `MEETING`, `EVENT`. |
| Date Range | Date Range Picker | Membatasi rentang kalender. |
| Create Activity | Primary Button | Membuka form sesuai jenis aktivitas. |
| Activity Detail | Drawer/Modal | Menampilkan detail dan participant status. |

#### B. Activity Fields

| Nama Field | Tipe Input | Wajib | Validasi | Sumber |
|------------|------------|-------|----------|--------|
| Activity Type | Select | Ya | Salah satu tipe yang didukung | Master type |
| Title | Text Input | Ya | 3–120 karakter | Manual |
| Start DateTime | DateTime | Ya | Harus valid; untuk aktivitas baru tidak boleh sama dengan end datetime | Manual |
| End DateTime | DateTime | Ya | Lebih besar dari start | Manual |
| Venue | Text Input | Tidak | Maks. 200 karakter | Manual |
| Notes | Textarea | Tidak | Maks. 500 karakter | Manual |
| Status | Select | Ya | `SCHEDULED`, `CANCELLED`, `COMPLETED` | `SCHEDULED` |

---

### 5.6 Training Session & Drill Management

**Tujuan**: Membantu coach/manager membuat rencana latihan dan menyimpan histori sesi latihan.

#### A. Training Session Header

| Nama Field | Tipe Input | Wajib | Aturan Validasi | Nilai Default |
|------------|------------|-------|-----------------|---------------|
| Session Date | Date Picker | Ya | Tanggal valid | Hari ini |
| Start Time | Time Input | Ya | Format `HH:mm` | Kosong |
| End Time | Time Input | Ya | Harus setelah start | Kosong |
| Venue | Text Input | Tidak | Maks. 200 karakter | Home Venue |
| Coach | Select | Ya | User harus memiliki role Coach dan status aktif | Coach aktif |
| Objective | Textarea | Ya | 5–500 karakter | Kosong |
| Notes | Textarea | Tidak | Maks. 1.000 karakter | Kosong |

#### B. Training Activities

| Nama Field | Tipe Input | Wajib | Validasi & Batasan | Catatan Logika |
|------------|------------|-------|--------------------|----------------|
| Activity Name | Select/Text | Ya | 3–100 karakter | Dapat memilih dari drill library atau custom activity |
| Category | Select | Ya | `WARMUP`, `TECHNICAL`, `TACTICAL`, `CONDITIONING`, `GAME`, `COOLDOWN`, `OTHER` | Master kategori |
| Duration | Number | Ya | Integer 1–180 menit | Total durasi activity tidak boleh melebihi durasi session |
| Objective | Textarea | Tidak | Maks. 300 karakter | Kosong |
| Notes | Textarea | Tidak | Maks. 500 karakter | Kosong |
| Sequence | Integer | Ya | Positif dan unik dalam satu session | Auto-increment |

#### C. Drill Library

| Nama Field | Tipe Input | Wajib | Validasi |
|------------|------------|-------|----------|
| Drill Name | Text Input | Ya | 3–120 karakter; unik case-insensitive dalam team |
| Category | Select | Ya | Harus kategori valid |
| Difficulty | Select | Tidak | `BEGINNER`, `INTERMEDIATE`, `ADVANCED` |
| Description | Textarea | Ya | 10–2.000 karakter |
| Recommended Duration | Number | Tidak | Integer 1–180 |
| Required Players | Number | Tidak | Integer 1–30 |
| Equipment | Text Input | Tidak | Maks. 300 karakter |
| Coach Notes | Textarea | Tidak | Maks. 1.000 karakter |

---

### 5.7 Attendance Management

**Tujuan**: Mencatat kehadiran athlete per training secara cepat dan menghasilkan metrik attendance yang konsisten.

#### A. Attendance UI

| Komponen UI | Tipe Elemen | Fungsi & Perilaku |
|-------------|-------------|-------------------|
| Athlete List | Data Table | Menampilkan seluruh active roster untuk session. |
| Attendance Status | Segmented Control | Memilih `PRESENT`, `LATE`, `ABSENT`, `EXCUSED`. |
| Bulk Action | Button | Menandai seluruh athlete sebagai `PRESENT`, lalu dapat dikoreksi per individu. |
| Notes | Text Input | Menyimpan catatan singkat, maks. 250 karakter. |
| Save Attendance | Primary Button | Menyimpan seluruh perubahan dalam satu transaction. |

#### B. Attendance Summary

Rumus utama:

`Attendance Rate = (PRESENT + LATE) / Eligible Sessions * 100`

`Excused` dan `ABSENT` tidak dihitung sebagai hadir. Session yang `CANCELLED` tidak masuk denominator.

#### C. Data Grid

| Nama Kolom UI | Sumber Data | Tipe Data | Format |
|---------------|-------------|-----------|--------|
| Session Date | `training_sessions.start_datetime` | Date | `DD MMM YYYY` |
| Athlete | `athletes.full_name` | String | Teks biasa |
| Status | `training_attendance.status` | Enum | Label status |
| Notes | `training_attendance.notes` | String | Teks biasa |
| Updated At | `training_attendance.updated_at` | DateTime | `YYYY-MM-DD HH:mm` |

---

### 5.8 Match & Squad Management

**Tujuan**: Mengelola jadwal pertandingan, opponent, squad, dan status pertandingan.

#### A. Match Form

| Nama Field | Tipe Input | Wajib | Aturan Validasi | Nilai Default / Sumber |
|------------|------------|-------|-----------------|-------------------------|
| Competition | Text/Select | Tidak | Maks. 120 karakter | Kosong |
| Opponent | Text Input | Ya | 2–120 karakter | Kosong |
| Match Date | Date Picker | Ya | Tanggal valid | Kosong |
| Start Time | Time Input | Ya | Valid `HH:mm` | Kosong |
| Venue | Text Input | Ya | 3–200 karakter | Kosong |
| Home/Away | Select | Ya | `HOME`, `AWAY`, `NEUTRAL` | `HOME` |
| Season | Select | Ya | Season harus valid | Active season |
| Notes | Textarea | Tidak | Maks. 1.000 karakter | Kosong |
| Status | Select | Ya | `SCHEDULED`, `LIVE`, `COMPLETED`, `CANCELLED` | `SCHEDULED` |

#### B. Match Squad

| Field | Tipe | Wajib | Validasi |
|-------|------|-------|----------|
| Athlete | Select | Ya | Harus active pada team-season |
| Squad Status | Select | Ya | `STARTING`, `SUBSTITUTE`, `UNAVAILABLE` |
| Captain | Toggle | Tidak | Maks. satu captain per match |
| Squad Note | Textarea | Tidak | Maks. 250 karakter |

#### C. Match List

Kolom:

`Date`, `Opponent`, `Competition`, `Venue`, `Home/Away`, `Status`, `Score`, `Result`, `Actions`.

Filter:

`Season`, `Competition`, `Opponent`, `Status`, `Result`, `Date Range`.

---

### 5.9 Match Recording & Player Statistics

**Tujuan**: Mencatat hasil pertandingan dan statistik pemain dasar dengan workflow yang cukup cepat digunakan saat atau setelah pertandingan.

#### A. Match Result Form

| Nama Field | Tipe Input | Wajib | Aturan Validasi | Catatan |
|------------|------------|-------|-----------------|---------|
| Team Score | Number Input | Ya setelah match selesai | Integer >= 0 | Nilai final hasil pertandingan |
| Opponent Score | Number Input | Ya setelah match selesai | Integer >= 0 | Nilai final lawan |
| Match Notes | Textarea | Tidak | Maks. 1.000 karakter | Ringkasan match |
| Result | Read-only | - | Dihitung backend dari score | `WIN`, `LOSS`, atau `DRAW` |

#### B. Match Event

| Nama Field | Tipe Input | Wajib | Validasi |
|------------|------------|-------|----------|
| Event Type | Select | Ya | MVP minimal `GOAL`; extensible untuk event lain |
| Athlete | Select | Ya untuk `GOAL` | Harus ada pada squad match |
| Event Time | Number/Input | Tidak | Integer 0–9999 detik atau format waktu yang konsisten |
| Notes | Textarea | Tidak | Maks. 250 karakter |

#### C. Player Match Statistics

| Statistik | Tipe | Sumber / Rumus |
|----------|------|----------------|
| Appearance | Boolean | `TRUE` jika player masuk squad dan dimainkan sesuai pencatatan pertandingan |
| Starting | Boolean | Berasal dari squad status |
| Substitute | Boolean | Berasal dari squad status |
| Minutes Played | Integer | Diinput/di-update coach/manager; `0–180` untuk validasi MVP |
| Goals | Integer | `COUNT(match_events where event_type = GOAL and athlete_id = player)` |
| Assists | Integer | Diinput manual; integer >= 0 |
| Cards | Integer | Diinput manual; integer >= 0 |

> Catatan: Statistik di atas adalah **statistik operasional MVP**, bukan klaim bahwa semua field merupakan statistik resmi yang diwajibkan oleh regulasi korfball. Skema dibuat extensible agar field dapat disesuaikan berdasarkan kebutuhan coach/organizer pada fase berikutnya.

#### D. Team Statistics

| Metric | Formula |
|--------|---------|
| Completed Matches | `COUNT(matches WHERE status = COMPLETED)` |
| Wins | `COUNT(result = WIN)` |
| Losses | `COUNT(result = LOSS)` |
| Draws | `COUNT(result = DRAW)` |
| Win Rate | `Wins / Completed Matches * 100`, `0%` jika tidak ada match selesai |
| Goals For | `SUM(team_score)` |
| Goals Against | `SUM(opponent_score)` |
| Goals/Game | `Goals For / Completed Matches`, `0.0` jika tidak ada match selesai |

---

### 5.10 Communication & Announcements

**Tujuan**: Menyediakan kanal komunikasi terpusat untuk informasi operasional tim yang tidak membutuhkan chat dua arah real-time.

#### A. Announcement Form

| Nama Field | Tipe Input | Wajib | Validasi | Default |
|------------|------------|-------|----------|---------|
| Title | Text Input | Ya | 3–120 karakter | Kosong |
| Body | Rich Text/Textarea | Ya | 5–2.000 karakter | Kosong |
| Priority | Select | Ya | `NORMAL`, `IMPORTANT`, `URGENT` | `NORMAL` |
| Publish At | DateTime | Ya | Tidak boleh sebelum `created_at` | Sekarang |
| Expire At | DateTime | Tidak | Harus > `publish_at` | Kosong |
| Target Audience | Multi-select | Ya | `ALL_TEAM`, `COACH`, `ATHLETE`, `MANAGER` | `ALL_TEAM` |
| Status | Select | Ya | `DRAFT`, `PUBLISHED`, `ARCHIVED` | `DRAFT` |

#### B. Announcement Behavior

- Hanya Manager dan Coach yang dapat publish.
- Announcement `URGENT` harus menampilkan visual prominence lebih tinggi pada dashboard.
- Athlete hanya dapat membaca announcement yang ditujukan kepadanya atau `ALL_TEAM`.
- Announcement yang sudah `PUBLISHED` tidak dapat diubah tanpa membuat audit log.

---

### 5.11 Reports, Export, Documents & Audit

**Tujuan**: Menyediakan output administratif dan histori perubahan untuk penggunaan operasional dan evaluasi pilot.

#### A. Reports

Report minimum:

1. Athlete Directory
2. Training Attendance by Athlete
3. Training Attendance by Period
4. Match History
5. Match Statistics
6. Season Team Summary

#### B. Filter Report

| Filter | Data Source | Validasi |
|--------|-------------|----------|
| Season | `seasons.id` | Harus season valid |
| Date From | Query parameter | Valid date |
| Date To | Query parameter | `Date To >= Date From` |
| Athlete | `athletes.id` | Athlete harus berada pada team scope |
| Match Result | `matches.result` | `WIN/LOSS/DRAW` |

#### C. Export

- CSV wajib tersedia untuk semua report minimum.
- XLSX bersifat target MVP jika library export stabil pada stack final.
- Export mengikuti filter yang sedang aktif pada UI.
- File harus memiliki timestamp dan nama report yang jelas.

Format contoh:

`attendance-korfball-bantul-2026-10-08.csv`

#### D. Team Documents

Dokumen MVP dapat berupa:

- Team Regulation
- Competition Regulation
- Team Schedule
- Roster Document
- Meeting Notes

Metadata minimum:

`document_id`, `name`, `file_path/object_key`, `mime_type`, `file_size`, `uploaded_by`, `uploaded_at`.

Batas MVP:

- Maksimum file 10 MB.
- Tipe file: PDF, DOCX, XLSX, PNG, JPG.
- File publik tidak diperbolehkan secara default.

#### E. Audit Log

Audit log minimum mencatat:

`CREATE`, `UPDATE`, `DELETE`, `PUBLISH`, `LOGIN`, `DISABLE_ACCOUNT` pada entity kritis.

Kolom minimum:

`audit_id`, `actor_user_id`, `action`, `entity_type`, `entity_id`, `before_json`, `after_json`, `created_at`.

---

### 5.12 Aturan Bisnis Utama (Business Rules)

| Kode Rule | Pernyataan Aturan Bisnis (Rule Statement) | Lapisan Penegakan (Enforcement Layer) | Penanganan Jika Melanggar (Error Response) |
|-----------|--------------------------------------------|---------------------------------------|--------------------------------------------|
| **BR-01** | Setiap user harus memiliki email yang unik dan case-insensitive dalam sistem. | Backend + DB Unique Index | HTTP 409: `Email sudah terdaftar.` |
| **BR-02** | Setiap Athlete harus memiliki `Player ID` unik dalam team scope. | Backend + DB Unique Constraint | HTTP 409: `Player ID sudah digunakan.` |
| **BR-03** | Hanya athlete dengan status `ACTIVE` yang dapat menjadi anggota active roster. | Backend Service | HTTP 400: `Athlete tidak aktif dan tidak dapat dimasukkan ke roster.` |
| **BR-04** | Jersey number harus unik di dalam active roster pada team-season yang sama. | Backend + DB Constraint | HTTP 409: `Nomor punggung sudah digunakan pada roster aktif.` |
| **BR-05** | Satu team-season hanya boleh memiliki maksimal satu captain aktif. | Backend Service | HTTP 400: `Captain aktif hanya boleh satu.` |
| **BR-06** | Training session wajib memiliki `end_datetime > start_datetime`. | Backend Validation | HTTP 400: `Waktu selesai harus setelah waktu mulai.` |
| **BR-07** | Activity duration dalam satu training session tidak boleh melebihi total durasi session. | Backend Service | HTTP 400: `Total durasi activity melebihi durasi training.` |
| **BR-08** | Attendance tidak boleh dibuat untuk athlete yang bukan anggota active roster pada tanggal session, kecuali terdapat historical membership record yang valid. | Backend Service | HTTP 400: `Athlete tidak berada pada roster yang berlaku.` |
| **BR-09** | Training session berstatus `CANCELLED` tidak dihitung ke attendance rate. | Backend Reporting Logic | Data tidak masuk denominator attendance. |
| **BR-10** | Athlete hanya dapat mengubah availability dan profile field yang memang diizinkan untuk dirinya sendiri. | Authorization Middleware + Service | HTTP 403: `Anda tidak memiliki akses untuk mengubah data ini.` |
| **BR-11** | Athlete berstatus `SUSPENDED` tidak dapat dipilih ke match squad. | Backend Service | HTTP 400: `Athlete sedang suspended.` |
| **BR-12** | Match wajib memiliki opponent, date, time, venue, season, dan status. | Backend Validation | HTTP 400: `Field pertandingan wajib belum lengkap.` |
| **BR-13** | Match dengan status `COMPLETED` wajib memiliki team score dan opponent score. | Backend Service | HTTP 400: `Score final wajib diisi sebelum match diselesaikan.` |
| **BR-14** | Result `WIN/LOSS/DRAW` dihitung oleh backend dari final score dan tidak dapat diubah manual melalui client. | Backend Service | HTTP 400: `Result ditentukan otomatis dari score.` |
| **BR-15** | Match event `GOAL` hanya dapat dikaitkan ke athlete yang berada pada match squad. | Backend Service + FK | HTTP 400: `Athlete tidak terdaftar pada squad pertandingan.` |
| **BR-16** | Nilai statistik numerik seperti goals, assists, cards, dan minutes played tidak boleh negatif. | Backend Validation | HTTP 400: `Nilai statistik tidak boleh negatif.` |
| **BR-17** | `Minutes Played` pada satu match tidak boleh lebih dari 180 pada MVP. | Backend Validation | HTTP 400: `Minutes played melebihi batas validasi.` |
| **BR-18** | Match yang berstatus `COMPLETED` tidak boleh diubah score/result tanpa hak Manager/Coach dan harus menghasilkan audit log. | Authorization + Audit Service | HTTP 403/409 dan perubahan dicatat. |
| **BR-19** | Announcement dengan status `PUBLISHED` tidak boleh dihapus hard-delete; pengelolaan selanjutnya menggunakan `ARCHIVED`. | Backend Service | HTTP 400: `Published announcement harus diarsipkan.` |
| **BR-20** | File upload hanya boleh memiliki MIME type dan ukuran sesuai konfigurasi sistem. | Backend File Validation | HTTP 400: `Format atau ukuran file tidak diizinkan.` |
| **BR-21** | Export hanya memproses data sesuai filter aktif dan team scope pengguna. | Backend Query Layer | HTTP 403/400 jika scope/filter tidak valid. |
| **BR-22** | User disabled tidak dapat login atau mengakses protected endpoint. | Authentication Middleware | HTTP 401/403: `Akun tidak aktif.` |
| **BR-23** | Semua operasi create/update/delete pada entity kritis harus atomik. | Database Transaction | Transaction rollback dan HTTP 500 dengan correlation ID. |
| **BR-24** | Client tidak boleh menjadi sumber kebenaran untuk hasil agregasi statistik dan attendance rate. | Backend Service / Query Layer | Backend menghitung ulang saat read/save. |
| **BR-25** | Seluruh data lintas modul pada MVP harus terikat ke `team_id` dan, jika relevan, `season_id`. | Service Layer + DB Foreign Key | HTTP 400/403 apabila scope tidak valid. |
| **BR-26** | Record aktif tidak boleh dihapus hard-delete apabila masih memiliki child records kritis; gunakan soft delete atau status transition. | Backend + DB FK | HTTP 409: `Data masih memiliki histori terkait.` |
| **BR-27** | Hanya Manager yang dapat mengubah role atau men-disable account user. | Authorization Layer | HTTP 403: `Hanya Manager yang dapat melakukan tindakan ini.` |
| **BR-28** | Dashboard athlete hanya menampilkan statistik pribadi dan data tim yang memang boleh dibaca oleh athlete. | Authorization + Query Scope | HTTP 403 atau data terfilter sesuai ownership. |

---

## 6. Spesifikasi Non-Fungsional (NFR)

| Dimensi | Parameter | Spesifikasi / Target |
|---------|-----------|----------------------|
| **Teknologi Backend** | Runtime & Framework | Node.js / NestJS |
| **Teknologi Frontend** | Web Framework | Next.js + TypeScript, Zustand, TanStack (Query & Table) |
| **UI Framework** | Styling / Components | Tailwind CSS, ShadcnUI, React Hook Form + Zod |
| **HTTP Client** | Klien API Frontend | Axios (Global Interception & Secured) |
| **Database** | Database Engine | NeonDB PostgreSQL Cloud |
| **ORM** | Data Access | TypeORM |
| **Protokol Komunikasi** | API Format | RESTful JSON API via HTTP/HTTPS |
| **Authentication** | Auth Mechanism | NeonAuth |
| **Authorization** | Access Control | Role-Based Access Control + team/season scope |
| **Performa & Response Time** | SLA API | < 500ms untuk query reguler pada dataset MVP; < 2s untuk dashboard/report query normal |
| **Performa & Export** | Export | < 5s untuk export maksimal 10.000 row pada environment pilot |
| **Scalability** | Pilot Capacity | Minimal mendukung 100 user, 1 team, 5 season aktif/arsip tanpa perubahan arsitektur fundamental |
| **Data Integrity** | Consistency | ACID transactions, FK constraints, unique indexes, check constraints jika relevan |
| **Security** | Password | Password di-hash menggunakan algoritma password hashing standar; plaintext password dilarang disimpan |
| **Security** | Transport | HTTPS wajib pada environment production/pilot |
| **Security** | File Access | File private; akses melalui authorization check dan/atau signed URL dengan expiry |
| **Penyimpanan File** | Object Storage | NeonDB Object Storage / Cloud Storage |
| **Security** | Input Handling | Server-side validation, output encoding, parameterized queries, dan proteksi OWASP common risks |
| **Reliability** | Error Handling | Format error JSON standar dengan `code`, `message`, `details`, `traceId` |
| **Observability** | Logging | Structured application logs minimal untuk request, error, authentication failure, dan critical business action |
| **Auditability** | Audit Log | Perubahan data kritis tercatat dengan actor, entity, before, after, timestamp |
| **Frontend** | Responsive | Minimum supported viewport 360px mobile hingga desktop 1440px |
| **Accessibility** | Basic | Form memiliki label; keyboard navigation dasar; status tidak hanya dibedakan dengan warna |
| **Testing** | Unit Testing | Business rules inti dan validator memiliki unit test |
| **Testing** | Integration Testing | Endpoint penting: auth, athlete, attendance, match, result, export |
| **Code Quality** | Maintainability | Modular domain boundaries, DTO/request validation, service layer, repository/data access pattern yang konsisten |
| **Deployment** | Containerization | Dockerfile untuk frontend/backend dan Docker Compose untuk local development |
| **Backup** | Database Backup | Backup terjadwal pada environment pilot/production; retention ditentukan dalam deployment plan |

---

## 7. Ketentuan Deliverables & Struktur Penyerahan

| Item Deliverable | Format / Path | Status Wajib |
|------------------|---------------|--------------|
| Source Code Aplikasi | Git Repository Monorepo | **Wajib** |
| Frontend Application | `/apps/web` atau struktur monorepo ekuivalen | **Wajib** |
| Backend Application | `/apps/api` atau struktur monorepo ekuivalen | **Wajib** |
| Database Migration | `/apps/api/Migrations` atau path yang setara | **Wajib** |
| Database Initialization Script | `/Database/schema.sql` atau migration yang dapat di-run clean dari nol | **Wajib** |
| Seed Data Demo | `/Database/seed` | **Wajib** |
| API Contract | `/docs/API.md` atau OpenAPI/Swagger | **Wajib** |
| Documentation Setup & Run | `README.md` | **Wajib** |
| Architecture Documentation | `docs/ARCHITECTURE.md` | **Wajib** |
| Product Requirement Document | `docs/PRD.md` atau root `PRD.md` | **Wajib** |
| Database ERD | `docs/ERD.md` / image / Mermaid | **Wajib** |
| Unit Test Suite | `/tests/unit` | **Wajib** |
| Integration Test Suite | `/tests/integration` | Nilai Plus / Wajib sebelum pilot |
| Docker Configuration | `docker-compose.yml` + Dockerfiles | **Wajib** |
| Environment Example | `.env.example` | **Wajib** |
| Demo Account Documentation | `docs/DEMO.md` | **Wajib** |
| Export Templates | `/docs/export-samples` | Nilai Plus |
| Deployment Notes | `docs/DEPLOYMENT.md` | Nilai Plus / Wajib sebelum pilot |

### 7.1 Rekomendasi Struktur Repository

```text
korfball-bantul-management/
├── apps/
│   ├── web/
│   └── api/
├── Database/
│   ├── schema.sql
│   └── seed/
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── ERD.md
│   ├── API.md
│   └── DEPLOYMENT.md
├── tests/
│   ├── unit/
│   └── integration/
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 8. Kriteria Penerimaan (Acceptance Criteria & Definition of Done)

### 8.1 Kriteria Minimum (Minimum Viable - Wajib Terpenuhi)

- [ ] Database schema/migration dapat diinisialisasi dari kondisi kosong tanpa error.
- [ ] Seed data dapat membuat minimal 1 team, 1 season, 1 Manager, 1 Coach, dan 10 Athlete demo.
- [ ] Login/logout berhasil dan protected route menolak user tanpa autentikasi.
- [ ] RBAC mencegah Athlete mengubah data athlete lain atau data match milik tim.
- [ ] Manager dapat membuat, melihat, mengubah, menonaktifkan athlete.
- [ ] Manager/Coach dapat membuat dan mengubah training session.
- [ ] Manager/Coach dapat membuat training activities dari drill library atau custom activity.
- [ ] Attendance dapat dicatat untuk seluruh active roster dan disimpan secara atomik.
- [ ] Attendance rate per athlete dan team dihitung oleh backend dengan rumus PRD.
- [ ] Athlete dapat melakukan availability confirmation untuk training/match miliknya sendiri.
- [ ] Manager/Coach dapat membuat match dan memilih match squad.
- [ ] Match squad tidak dapat memilih athlete suspended/inactive.
- [ ] Match score dapat disimpan dan result otomatis dihitung backend.
- [ ] Match event goal hanya dapat dikaitkan ke athlete yang berada dalam squad.
- [ ] Team dan player statistics diperbarui dari data pertandingan tanpa kalkulasi manual di frontend sebagai source of truth.
- [ ] Announcement dapat dibuat sebagai draft dan dipublish oleh role berwenang.
- [ ] Dashboard menampilkan next activity, active athletes, attendance, dan season match record.
- [ ] Search dan filter bekerja akurat pada athlete, training, dan match list.
- [ ] Export CSV menghasilkan data sesuai filter aktif dan team/season scope user.
- [ ] Operasi kritis menghasilkan audit log.
- [ ] UI dapat digunakan pada mobile browser minimal lebar 360px dan desktop 1440px.
- [ ] README memungkinkan pihak ketiga menjalankan aplikasi local dari clean checkout.

### 8.2 Kriteria Tingkat Lanjut (Advanced / Nilai Plus)

- [ ] Swagger/OpenAPI dapat digunakan untuk mencoba seluruh endpoint utama.
- [ ] Unit test mencakup edge cases: duplicate Player ID, duplicate jersey number, negative statistics, cancelled training, suspended athlete, dan invalid match result.
- [ ] Integration test mencakup complete flow: login → training → attendance → match → result → statistics.
- [ ] Error handling menghasilkan format JSON standar seragam dengan `traceId`.
- [ ] UI memiliki loading state, empty state, error state, toast notification, dan modal confirmation.
- [ ] Dashboard memiliki chart attendance trend dan match result trend.
- [ ] XLSX export tersedia selain CSV.
- [ ] Docker Compose dapat menjalankan frontend, backend, dan PostgreSQL dengan satu command.
- [ ] CI menjalankan lint/build/test secara otomatis pada setiap pull request.
- [ ] Deployment pilot tersedia pada HTTPS domain yang dapat digunakan oleh tim nyata.
- [ ] Basic product analytics mencatat active users dan feature usage tanpa menyimpan data sensitif yang tidak diperlukan.

### 8.3 Definition of Done per Feature

Sebuah feature dianggap selesai apabila seluruh kondisi berikut terpenuhi:

1. UI dan backend implementasinya tersedia.
2. Mandatory validation tersedia di frontend dan backend; backend menjadi source of truth.
3. Business rule terkait memiliki test atau bukti pengujian yang dapat diulang.
4. Loading, success, empty, validation error, authorization error, dan server error memiliki handling.
5. Data tersimpan dengan constraint database yang relevan.
6. Audit log dibuat apabila feature mengubah entity kritis.
7. Dokumentasi endpoint/UI singkat tersedia.
8. Feature lolos acceptance test sesuai PRD.

### 8.4 MVP Pilot Acceptance Scenario

#### Scenario A — Training Flow

```text
Manager login
→ Create Training
→ Publish/Save schedule
→ Athlete melihat jadwal
→ Athlete mengisi availability
→ Coach membuka attendance
→ Coach finalisasi attendance
→ Dashboard attendance berubah
```

Expected result: seluruh data training dan attendance konsisten tanpa input ulang di spreadsheet.

#### Scenario B — Match Flow

```text
Manager create Match
→ Select Squad
→ Athlete melihat squad
→ Coach/Manager input score/event
→ Set match to COMPLETED
→ Backend calculate result
→ Player goals aggregate
→ Team statistics update
→ Match masuk history
```

Expected result: satu entry pertandingan menjadi source untuk match history, player statistics, dan team statistics.

#### Scenario C — Access Control

```text
Athlete login
→ Open another athlete profile
→ Attempt PUT/DELETE
```

Expected result: system menolak request dengan HTTP 403 dan tidak ada perubahan data.

#### Scenario D — Export

```text
Manager filter Attendance
→ Select date range
→ Click Export CSV
```

Expected result: file hanya berisi data yang masuk filter aktif dan team scope manager.

---

## 9. 🤖 Rubrik Asesmen Kelengkapan PRD oleh AI Agent

Gunakan checklist penilaian ini saat AI Agent mengevaluasi apakah dokumen PRD sudah lengkap dan siap diimplementasikan.

### AI AGENT PRD AUDIT REPORT

- [x] **Konteks & Scope Jelas**: In-Scope dan Out-of-Scope dipisahkan secara eksplisit dengan fokus MVP satu tim.
- [x] **Spesifikasi Data Lengkap**: Field utama telah memiliki tipe input, mandatory status, validasi, dan sumber/default pada modul kritis.
- [x] **Business Rules Unik**: Aturan bisnis diberi kode BR-01 sampai BR-28 dan memiliki enforcement layer serta error handling.
- [x] **Pencegahan Kalkulasi Client**: Attendance rate, match result, dan statistik agregat ditegaskan sebagai source of truth backend.
- [x] **Non-Functional Spec Realistis**: Framework, database, API, performance target, security, testing, dan deployment MVP telah ditentukan.
- [x] **Acceptance Criteria Testable**: Kriteria minimum dapat diuji secara objektif dan dilengkapi scenario end-to-end.

**Skor Kelengkapan: 96 / 100**

**Catatan Gap / Rekomendasi Perbaikan:**

1. Definisi statistik pertandingan yang benar-benar dipakai coach Korfball Bantul masih perlu divalidasi melalui interview dengan coach/manager karena PRD ini sengaja tidak mengasumsikan seluruh statistik sebagai statistik resmi kompetisi.
2. Detail aturan pertandingan seperti quarter duration, substitution rule, scoring convention, tie-breaker, dan format kompetisi belum dimasukkan karena MVP fokus pada team management, bukan competition engine resmi.
3. Mekanisme autentikasi telah diputuskan menggunakan NeonAuth dan penyimpanan file menggunakan Object Storage bawaan/ekivalen. Detail implementasi integrasi, deployment provider, backup schedule, dan retention policy perlu ditetapkan pada `ARCHITECTURE.md` dan `DEPLOYMENT.md`.
4. Sebelum pilot, field dan workflow yang digunakan saat latihan/pertandingan aktual perlu diuji bersama minimal satu Coach dan satu Team Manager agar tidak terjadi overbuilding.

---

## Appendix A — Prioritas Modul MVP

| Prioritas | Modul | Alasan |
|-----------|-------|--------|
| P0 | Authentication & RBAC | Prasyarat seluruh fitur privat dan data ownership. |
| P0 | Athlete Registry | Master data seluruh aktivitas tim. |
| P0 | Roster | Menentukan siapa anggota aktif dan siapa yang dapat dipilih untuk aktivitas. |
| P0 | Calendar | Sumber jadwal utama tim. |
| P0 | Training | Aktivitas berfrekuensi tinggi dan titik utama penggunaan mingguan. |
| P0 | Attendance | Salah satu pain point operasional yang paling mudah diukur. |
| P0 | Match | Aktivitas utama kedua setelah training. |
| P0 | Match Squad | Kebutuhan langsung sebelum pertandingan. |
| P0 | Match Result | Basis histori dan analytics. |
| P0 | Basic Statistics | Memberikan value tambahan dari sekadar kalender/attendance. |
| P1 | Availability | Mengurangi koordinasi manual menjelang training/match. |
| P1 | Announcement | Sentralisasi komunikasi operasional. |
| P1 | Reports & CSV | Mendukung manager dan evaluasi pilot. |
| P1 | Audit Log | Menjaga accountability untuk perubahan data. |
| P1 | Drill Library | Memperkuat utility coach, tetapi tidak menjadi blocker untuk first usable release. |
| P2 | Documents | Berguna tetapi dapat diselesaikan setelah core workflow stabil. |
| P2 | Advanced Charts | Nice-to-have setelah data aktual terkumpul. |
| P2 | Push Notifications | Dapat ditambahkan setelah pilot membuktikan kebutuhan reminder. |

## Appendix B — Prinsip Product MVP

1. **Real workflow over feature count** — satu workflow latihan/pertandingan yang lengkap lebih penting daripada puluhan menu.
2. **Backend as source of truth** — seluruh business rules dan agregasi penting diverifikasi di backend.
3. **Mobile-friendly first** — coach/manager dapat memakai sistem dari lapangan melalui browser mobile.
4. **Historical data matters** — season dan effective roster dipertahankan agar histori tidak rusak saat data berubah.
5. **Simple before smart** — analytics canggih dan AI ditunda sampai data operasional cukup banyak dan kebutuhan terbukti.
6. **Pilot with one team** — keberhasilan MVP diukur berdasarkan penggunaan aktual oleh satu tim Korfball Bantul, bukan banyaknya modul yang selesai.
7. **Future-ready, not overengineered** — schema dan domain boundary disiapkan untuk ekspansi, tetapi implementasi MVP tetap modular monolith.
