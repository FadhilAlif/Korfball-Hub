# KORFBALL BANTUL TEAM MANAGEMENT SYSTEM — User Flow

Dokumen ini memetakan alur interaksi logis dari sudut pandang *user journey* untuk fitur-fitur kritikal pada MVP, berdasarkan PRD dan Architecture yang telah disetujui.

---

## 1. Flow Otentikasi dan Dashboard (All Roles)

```mermaid
flowchart TD
    A[Buka Aplikasi Web] --> B{Punya Sesi Aktif?}
    B -->|Tidak| C[Halaman Login Neon Auth]
    C --> D[Input Email & Password]
    D --> E{Kredensial Valid?}
    E -->|Tidak| C
    E -->|Ya| F[Menerima JWT / Cookie]
    B -->|Ya| F
    F --> G[Panggil Endpoint Dashboard]
    G --> H{Cek Role User}
    H -->|Manager/Coach| I[Tampilkan Semua Metrik & Quick Actions]
    H -->|Athlete| J[Tampilkan Jadwal, Stats Pribadi & Announcement]
    H -->|Viewer| K[Tampilkan Read-Only Summary]
```

---

## 2. Flow Persiapan Latihan (Training Workflow)

Alur di mana pelatih membuat jadwal, pemain konfirmasi, dan pelatih mencatat kehadiran sesudahnya.

```mermaid
sequenceDiagram
    autonumber
    actor Coach
    actor Athlete
    participant System as Web App & API

    Coach->>System: 1. Create Training Session (Tanggal, Jam, Venue)
    System-->>Coach: 2. Status = SCHEDULED, Notifikasi dibuat
    Athlete->>System: 3. Buka Dashboard, lihat "Next Activity"
    Athlete->>System: 4. Set Availability (AVAILABLE / UNAVAILABLE)
    System-->>Athlete: 5. Ketersediaan tersimpan
    
    note right of Coach: Setelah Sesi Latihan Berlangsung
    
    Coach->>System: 6. Buka halaman Attendance untuk sesi tersebut
    System-->>Coach: 7. Tampilkan list Roster Aktif
    Coach->>System: 8. Tandai kehadiran (Present/Absent/Late) & Save
    System-->>Coach: 9. Attendance Tersimpan, Statistik di-recalculate
```

---

## 3. Flow Pencatatan Pertandingan (Match Workflow)

Alur end-to-end pembuatan pertandingan, penentuan skuad, dan input hasil akhir.

```mermaid
sequenceDiagram
    autonumber
    actor Manager
    actor Coach
    participant System as Web App & API

    Manager->>System: 1. Create Match (Lawan, Tanggal, Venue)
    System-->>Manager: 2. Match berstatus SCHEDULED
    
    Coach->>System: 3. Buka tab Match Squad
    Coach->>System: 4. Pilih Athlete untuk Starting & Sub
    System-->>Coach: 5. Roster Pertandingan Terkunci
    
    note right of Coach: Setelah Pertandingan Selesai
    
    Coach->>System: 6. Update Match Score (Team vs Opponent)
    Coach->>System: 7. Input Match Events (Gol by Player X)
    Coach->>System: 8. Ubah Status menjadi COMPLETED
    System-->>Coach: 9. Verifikasi Final Score & Lock Match
    System-->>System: 10. Hitung Win/Loss/Draw & Update Statistik
```

---

## 4. Flow Komunikasi (Announcement)

```mermaid
flowchart TD
    A[Manager/Coach klik Create Announcement] --> B[Isi Judul, Body, Priority]
    B --> C[Pilih Target: ALL_TEAM, ATHLETE, dsb.]
    C --> D{Kapan Dipublish?}
    D -->|Sekarang| E[Set Status = PUBLISHED]
    D -->|Nanti| F[Set Status = DRAFT / Jadwal]
    
    E --> G[Tersimpan di DB]
    
    H[Athlete Login] --> I[Cek Announcement Target]
    I --> J[Tampilkan Banner Urgent jika Prioritas Tinggi]
    I --> K[Tampilkan di list biasa jika Prioritas Normal]
```

---

## 5. Flow Ekspor Data & Pelaporan (Reporting)

```mermaid
flowchart LR
    A[Manager Akses Menu Reports] --> B[Pilih Jenis Laporan (Absensi/Match)]
    B --> C[Set Filter: Season, Date Range, Status]
    C --> D[Klik Export CSV]
    D --> E[Next.js Panggil API NestJS `/export`]
    E --> F[NestJS Query ke PostgreSQL dengan Filter]
    F --> G[NestJS Generate File Stream (CSV)]
    G --> H[Next.js Trigger Download di Browser Manager]
```
