# KORFBALL BANTUL TEAM MANAGEMENT SYSTEM — API Documentation (OpenAPI/Swagger)

Dokumen ini mendefinisikan standar dan panduan Swagger/OpenAPI untuk REST API NestJS.

---

## 🌐 Akses Dokumentasi Interaktif (Swagger UI)

Saat server backend berjalan di lokal:
- **Base API URL**: `http://localhost:4000/api/v1`
- **Swagger Interactive UI**: [`http://localhost:4000/api/docs`](http://localhost:4000/api/docs)
- **OpenAPI JSON Spec**: `http://localhost:4000/api/docs-json`

---

## 🛑 Aturan Mutlak Pendaftaran Endpoint ke Swagger

Setiap developer atau AI Agent yang menambahkan atau mengubah endpoint backend **WAJIB MENGIKUTI STANDAR INI**:

1. **Tag Controller**:
   Setiap Controller wajib memiliki `@ApiTags('[Domain]')`.
   ```typescript
   @ApiTags('Athletes')
   @Controller('athletes')
   export class AthletesController {}
   ```

2. **Ringkasan Operasi**:
   Setiap method endpoint wajib memiliki `@ApiOperation({ summary: '...' })`.
   ```typescript
   @Get()
   @ApiOperation({ summary: 'Mengambil daftar seluruh atlet tim aktif' })
   async findAll() {}
   ```

3. **Status Code & Skema Response**:
   Wajib mendokumentasikan `@ApiResponse()` untuk status sukses (200/201) dan error umum (400, 401, 403, 404).
   ```typescript
   @ApiResponse({ status: 200, description: 'Data atlet berhasil diambil' })
   @ApiResponse({ status: 401, description: 'Unauthorized - Token tidak valid' })
   ```

4. **Proteksi Autentikasi**:
   Untuk semua endpoint yang membutuhkan login/akses hak istimewa, wajib menambahkan:
   ```typescript
   @ApiBearerAuth('JWT-auth')
   ```

5. **Param & Body DTO**:
   - Jika menerima URL path parameter: gunakan `@ApiParam({ name: 'id', type: 'string', format: 'uuid' })`.
   - Jika menerima Query parameter: gunakan `@ApiQuery({ name: 'search', required: false })`.
   - Jika menerima JSON Body: gunakan DTO dengan properti yang didekorasi `@ApiProperty()`.

---

## 📋 Katalog Modul & Tag API yang Direncanakan

| Modul / Tag | Deskripsi | Route Path |
|---|---|---|
| **`Health & System`** | Status kesehatan server dan ping | `/api/v1` |
| **`Auth`** | Validasi sesi pengguna & profil login | `/api/v1/auth` |
| **`Teams`** | Master profil tim dan season aktif | `/api/v1/teams` |
| **`Athletes`** | Registry atlet, roster tim, dan status pemain | `/api/v1/athletes` |
| **`Training`** | Jadwal latihan, drill activity, dan presensi (attendance) | `/api/v1/training` |
| **`Matches`** | Jadwal pertandingan, roster squad, dan pencatatan hasil/skor | `/api/v1/matches` |
| **`Announcements`** | Pengumuman tim dan broadcast informasi | `/api/v1/announcements` |
| **`Documents`** | Unggah dan unduh file regulasi/dokumen privat | `/api/v1/documents` |
| **`Reports`** | Ekspor laporan kehadiran dan statistik (CSV/XLSX) | `/api/v1/reports` |
