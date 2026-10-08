# KORFBALL BANTUL TEAM MANAGEMENT SYSTEM — User Stories

Dokumen ini mendefinisikan kebutuhan pengguna dalam bentuk *User Stories* (Kisah Pengguna) yang dipisahkan berdasarkan Role/Aktor, merujuk pada spesifikasi fungsional di `PRD.md`.

## Role: Team Manager / Admin

### Autentikasi & Akun
- **US-M1**: Sebagai Manager, saya ingin mengundang/mendaftarkan akun Coach dan Athlete agar mereka bisa login ke dalam platform.
- **US-M2**: Sebagai Manager, saya ingin menonaktifkan akun anggota yang sudah keluar dari tim agar mereka tidak dapat lagi mengakses data internal.

### Team & Athlete Registry
- **US-M3**: Sebagai Manager, saya ingin memperbarui profil utama tim (nama, kategori, *home venue*) agar data tersebut relevan di musim berjalan.
- **US-M4**: Sebagai Manager, saya ingin menambahkan profil atlet baru beserta kontak darurat mereka sehingga data anggota terpusat dengan aman.
- **US-M5**: Sebagai Manager, saya ingin menentukan Roster Aktif untuk satu musim agar jelas siapa yang berhak dipanggil latihan dan bertanding.

### Penjadwalan & Pertandingan
- **US-M6**: Sebagai Manager, saya ingin membuat kalender kegiatan tim (Meeting, Event) agar atlet terinformasi dari jauh hari.
- **US-M7**: Sebagai Manager, saya ingin membuat agenda pertandingan (lawan, tempat, waktu) agar coach dapat mulai menyusun skuad.

### Komunikasi & Laporan
- **US-M8**: Sebagai Manager, saya ingin membuat pengumuman (Announcement) berskala tim agar saya tidak perlu menyebar pesan panjang di grup WhatsApp.
- **US-M9**: Sebagai Manager, saya ingin mengekspor data absensi latihan ke CSV agar saya bisa membuat laporan bulanan untuk pengurus.

---

## Role: Coach (Pelatih)

### Latihan (Training) & Drill
- **US-C1**: Sebagai Coach, saya ingin membuat *Training Session* dengan spesifikasi detail (durasi, objektif) agar rencana latihan terekam jelas.
- **US-C2**: Sebagai Coach, saya ingin melihat respons ketersediaan (Availability) atlet sebelum latihan agar saya tahu berapa banyak yang diperkirakan hadir.
- **US-C3**: Sebagai Coach, saya ingin menandai absensi (Present, Late, Absent, Excused) setelah sesi latihan selesai dengan cepat via *bulk action*.

### Match Squad & Statistics
- **US-C4**: Sebagai Coach, saya ingin memilih *Match Squad* dari roster aktif sebelum hari H pertandingan.
- **US-C5**: Sebagai Coach, saya ingin mencatat *Team Score*, *Opponent Score*, serta *Match Events* (seperti pencetak gol) sesaat setelah pertandingan selesai.
- **US-C6**: Sebagai Coach, saya ingin melihat *Player Statistics* (menit bermain, gol, persentase kehadiran) agar saya punya data objektif untuk evaluasi pemain.

---

## Role: Athlete (Atlet)

### Profil Pribadi & Ketersediaan
- **US-A1**: Sebagai Atlet, saya ingin dapat login ke dashboard personal saya untuk melihat pengumuman terbaru dan jadwal tim.
- **US-A2**: Sebagai Atlet, saya ingin memperbarui *Availability* saya (Hadir / Tidak / Mungkin) untuk sesi latihan atau pertandingan minggu ini agar pelatih mengetahuinya.
- **US-A3**: Sebagai Atlet, saya ingin melihat rekap kehadiran dan statistik pribadi saya (gol yang dicetak, dsb.) di musim ini.

### Pertandingan & Informasi
- **US-A4**: Sebagai Atlet, saya ingin melihat Roster Pertandingan (Match Squad) untuk mengetahui apakah saya dipanggil menjadi *Starting* atau *Substitute*.
- **US-A5**: Sebagai Atlet, saya ingin mengunduh atau membaca *Team Document* (Regulasi, Tata Tertib) yang dibagikan secara publik kepada tim.

---

## Role: Viewer (Pengurus Daerah/KONI)

### Observasi Data Dasar
- **US-V1**: Sebagai Viewer, saya ingin melihat tabel agregat jumlah menang/kalah tim tanpa bisa mengubah skornya.
- **US-V2**: Sebagai Viewer, saya ingin melihat daftar atlet yang terdaftar aktif di dalam roster tim saat ini.
- **US-V3**: Sebagai Viewer, saya ingin melihat rangkuman kehadiran dan jadwal tanpa melihat detail medis atau catatan taktis internal tim.
