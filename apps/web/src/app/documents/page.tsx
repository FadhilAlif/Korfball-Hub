'use client';

import React, { useState, useRef } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import {
  useGetDocuments,
  useUploadDocument,
  useDeleteDocument,
  DocumentItem,
} from '@/hooks/useDocuments';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  ExternalLink,
  ChevronRight,
  Database,
  HardDrive,
  ShieldCheck,
  Clock,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  File,
  FileImage,
  FileArchive,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function DocumentsPage() {
  const { data, isLoading, error, refetch } = useGetDocuments();
  const uploadDoc = useUploadDocument();
  const deleteDoc = useDeleteDocument();

  const [customName, setCustomName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isExportingAttendance, setIsExportingAttendance] = useState(false);
  const [isExportingMatches, setIsExportingMatches] = useState(false);

  const documents = data?.items || [];
  const summary = data?.summary || {
    totalDocuments: 0,
    totalBytes: 0,
    formattedTotalSize: '0.0 KB',
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    setUploadSuccess(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('Ukuran file maksimal adalah 10 MB');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      if (!customName) {
        setCustomName(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Pilih file terlebih dahulu');
      return;
    }

    try {
      setUploadError(null);
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (customName.trim()) {
        formData.append('name', customName.trim());
      }

      await uploadDoc.mutateAsync(formData);
      setUploadSuccess(`Berkas "${selectedFile.name}" berhasil diunggah ke Neon Object Storage.`);
      setSelectedFile(null);
      setCustomName('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      setUploadError(err.message || 'Gagal mengunggah berkas.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus dokumen "${name}"?`)) return;
    try {
      await deleteDoc.mutateAsync(id);
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus dokumen');
    }
  };

  const handleExportAttendanceCsv = async () => {
    try {
      setIsExportingAttendance(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('korfball_auth_token') : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const response = await fetch(`${apiUrl}/training/export/csv`, {
        headers: {
          Authorization: `Bearer ${token || 'demo-coach-jwt-token'}`,
        },
      });

      if (!response.ok) {
        throw new Error('Gagal mengunduh CSV presensi');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rekap_presensi_korfball_bantul_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(err.message || 'Gagal ekspor CSV presensi');
    } finally {
      setIsExportingAttendance(false);
    }
  };

  const handleExportMatchesCsv = async () => {
    try {
      setIsExportingMatches(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('korfball_auth_token') : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const response = await fetch(`${apiUrl}/matches/export/csv`, {
        headers: {
          Authorization: `Bearer ${token || 'demo-coach-jwt-token'}`,
        },
      });

      if (!response.ok) {
        throw new Error('Gagal mengunduh CSV jadwal pertandingan');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rekap_jadwal_pertandingan_bantul_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(err.message || 'Gagal ekspor CSV pertandingan');
    } finally {
      setIsExportingMatches(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    if (fileType.includes('image')) return <FileImage className="w-5 h-5 text-blue-500" />;
    if (fileType.includes('sheet') || fileType.includes('csv')) return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
    if (fileType.includes('zip') || fileType.includes('rar')) return <FileArchive className="w-5 h-5 text-amber-500" />;
    return <File className="w-5 h-5 text-slate-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-slate-900">
      <Sidebar />

      <div className="pl-72">
        <Header title="Documents & Storage" category="Administrative" />

        <main className="w-full pt-16 min-h-screen p-8">
          <div className="flex flex-col w-full max-w-7xl mx-auto space-y-6">
            {/* Top Navigation Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <span>Administrative</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                  <span className="font-semibold text-slate-900">Documents & Storage Hub</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
                  Manajemen Dokumen & Pusat Ekspor Laporan
                </h1>
                <p className="text-xs text-slate-500">
                  Penyimpanan berkas terintegrasi Neon Object Storage (S3-compatible) & pusat unduh rekap data CSV.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700 h-9 gap-1.5 text-xs shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Segarkan</span>
                </Button>
              </div>
            </div>

            {/* KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Total Berkas
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 mt-0.5 font-sans">
                    {summary.totalDocuments}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Dokumen terdaftar</div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <HardDrive className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Kapasitas Terpakai
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 mt-0.5 font-sans">
                    {summary.formattedTotalSize}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Bucket: uploads</div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Penyedia Storage
                  </div>
                  <div className="text-sm font-extrabold text-slate-900 mt-0.5 font-sans truncate max-w-[140px]">
                    Neon Object S3
                  </div>
                  <div className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    ap-southeast-1
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Keamanan Akses
                  </div>
                  <div className="text-sm font-extrabold text-slate-900 mt-0.5 font-sans">
                    Presigned URL
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    Kedaluwarsa 1 jam
                  </div>
                </div>
              </div>
            </div>

            {/* Export Center Cards (CSV) */}
            <div className="bg-gradient-to-br from-slate-900 to-[#121927] p-6 rounded-2xl border border-slate-800 text-white shadow-md">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-semibold">
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    Pusat Ekspor Laporan Resmi
                  </div>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    Ekspor Data Operasional Tim ke CSV (Spreadsheet Excel Compatible)
                  </h2>
                  <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                    Unduh rekap data komprehensif untuk pelaporan ke KONI Kab. Bantul, Pengda Korfball DIY, maupun arsip pelatih. Format CSV terstandarisasi dengan pemisah koma dan encoding UTF-8.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <Button
                    onClick={handleExportAttendanceCsv}
                    disabled={isExportingAttendance}
                    className="bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs h-10 px-4 gap-2 shadow-sm"
                  >
                    {isExportingAttendance ? (
                      <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                    ) : (
                      <Download className="w-4 h-4 text-emerald-600" />
                    )}
                    <span>Unduh Rekap Presensi Latihan (.csv)</span>
                  </Button>

                  <Button
                    onClick={handleExportMatchesCsv}
                    disabled={isExportingMatches}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs h-10 px-4 gap-2 shadow-sm"
                  >
                    {isExportingMatches ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <Download className="w-4 h-4 text-white" />
                    )}
                    <span>Unduh Rekap Pertandingan (.csv)</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Document Upload & Storage Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Upload Form Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs h-fit space-y-5">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
                  <div className="h-8 w-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Unggah Dokumen Baru</h3>
                    <p className="text-[11px] text-slate-500">Maks. 10 MB per berkas</p>
                  </div>
                </div>

                <form onSubmit={handleUpload} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="doc-name" className="text-xs font-semibold text-slate-700">
                      Nama Dokumen (Opsional)
                    </Label>
                    <Input
                      id="doc-name"
                      placeholder="Cth: Surat Dispensasi Kejurda 2026"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="doc-file" className="text-xs font-semibold text-slate-700">
                      Pilih Berkas File
                    </Label>
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-red-400 transition-colors bg-slate-50/50">
                      <input
                        ref={fileInputRef}
                        id="doc-file"
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="doc-file"
                        className="cursor-pointer flex flex-col items-center justify-center gap-2"
                      >
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                          <Upload className="w-5 h-5 text-slate-600" />
                        </div>
                        <div className="text-xs font-medium text-slate-700">
                          {selectedFile ? (
                            <span className="font-bold text-slate-900">{selectedFile.name}</span>
                          ) : (
                            <span>Klik untuk telusuri berkas dari komputer</span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          PDF, DOCX, PNG, JPG, ZIP (Maks. 10MB)
                        </div>
                      </label>
                    </div>
                  </div>

                  {uploadError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 font-medium">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  {uploadSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-700 font-medium">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{uploadSuccess}</span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={!selectedFile || uploadDoc.isPending}
                    className="w-full bg-[#b91c1c] hover:bg-[#991b1b] text-white text-xs font-semibold h-10 gap-2 shadow-xs"
                  >
                    {uploadDoc.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Mengunggah ke S3...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Simpan ke Object Storage</span>
                      </>
                    )}
                  </Button>
                </form>
              </div>

              {/* Right Column: Document List Table */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">Daftar Dokumen Tersimpan</h3>
                      <p className="text-[11px] text-slate-500">
                        {documents.length} berkas dalam repositori tim Bantul
                      </p>
                    </div>
                  </div>
                </div>

                {isLoading ? (
                  <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-7 h-7 animate-spin text-red-600" />
                    <span className="text-xs">Memuat repositori dokumen...</span>
                  </div>
                ) : documents.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
                    <div className="h-14 w-14 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-700">Belum Ada Dokumen</p>
                      <p className="text-xs text-slate-400 max-w-sm">
                        Unggah berkas sertifikat atlet, berkas izin pertandingan, atau administrasi tim menggunakan form di sebelah kiri.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-50/70 text-slate-500 font-semibold border-b border-slate-100">
                        <tr>
                          <th className="py-3 px-4">Nama Dokumen</th>
                          <th className="py-3 px-4">Tipe Berkas</th>
                          <th className="py-3 px-4">Ukuran</th>
                          <th className="py-3 px-4">Waktu Unggah</th>
                          <th className="py-3 px-4 text-right">Tindakan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {documents.map((doc: DocumentItem) => (
                          <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div className="shrink-0">{getFileIcon(doc.file_type || '')}</div>
                                <div className="min-w-0">
                                  <div className="font-semibold text-slate-900 truncate max-w-xs">
                                    {doc.name}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono truncate max-w-xs">
                                    {doc.file_url}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                              {doc.file_type || 'application/octet-stream'}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700 font-medium">
                              {formatFileSize(doc.file_size)}
                            </td>
                            <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                              {new Date(doc.created_at).toLocaleString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {doc.view_url && (
                                  <a
                                    href={doc.view_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center h-8 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-medium gap-1 shadow-2xs"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                                    <span>Buka</span>
                                  </a>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(doc.id, doc.name)}
                                  disabled={deleteDoc.isPending}
                                  className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
