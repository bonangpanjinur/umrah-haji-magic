# Rencana Perbaikan & Pengembangan Sistem Umroh

Berdasarkan audit menyeluruh terhadap menu admin, agent, operasional, jamaah, customer, dan publik — berikut peta lengkap fitur yang **belum ada**, yang **harus diperbaiki**, dan urutan pengerjaannya.

---

## A. FITUR YANG BELUM ADA (HARUS DIBUAT)

### A1. Database & Schema (Pondasi)
Tanpa ini, banyak menu akan 404/400:
- Tabel `menu_items` (sidebar dinamis) — saat ini belum ada, sidebar kosong
- Tabel `package_types` — referensi di kode tapi tidak ada
- Tabel `company_features` — referensi tapi tidak ada
- Kolom `month` di `departures` (untuk grouping bulanan)
- Kolom `airline`, `hotel_makkah`, `hotel_madinah` di `packages` (dipakai PackageCard tapi di-cast `as any`)
- Tabel `role_permissions` — sudah ada tapi tidak dipakai filter sidebar

### A2. Sistem Permission Granular (RBAC sebenarnya)
- Filter sidebar berdasar `role_permissions` (saat ini semua staff lihat semua menu)
- Prop `permission` di `ProtectedRoute` (saat ini di-ignore — komentar "Deprecated")
- Halaman admin **Role & Permissions** untuk super_admin mengatur akses per role
- Pemisahan yang jelas: `isStaff()` vs `isAgent()` vs `isCustomer()`

### A3. Fitur Bisnis yang Hilang
- **Refund Management** — workflow pengembalian dana (request → approve → kembalikan)
- **Cancellation Policy** per paket + workflow pembatalan booking
- **Waiting List** untuk paket yang full
- **Group Booking discount** (diskon rombongan otomatis)
- **Multi-currency display** (USD/SAR untuk landing internasional)
- **Voucher/Coupon redemption flow** di checkout (halaman admin Coupons sudah ada, integrasi belum)
- **PIC Fee splitting** otomatis ke wallet agent saat pembayaran lunas
- **Manasik Online** (zoom/youtube embed + attendance) — saat ini hanya jadwal offline
- **E-Sertifikat Manasik & Umroh** (PDF + QR verify)
- **Survey Kepuasan post-trip** otomatis kirim WA + simpan rating

### A4. Komunikasi & Marketing
- **Broadcast WhatsApp** ke segment (jamaah by departure, leads, agent)
- **Email Marketing** templates + send (campaign blast)
- **Push Notification** (PWA Web Push) untuk jamaah app
- **Chat in-app** customer ↔ admin (saat ini hanya helpdesk ticket)
- **Auto-reminder pelunasan** sudah ada — perlu **auto-reminder dokumen** (paspor, vaksin meningitis, foto)

### A5. Operasional Lapangan
- **Tracking Pesawat real-time** (integrasi flight API) di hari keberangkatan
- **Live tracking bus** (sudah ada SOS, perlu live map untuk semua bus)
- **Daily report Muthawif** (laporan harian tim lapangan)
- **Incident report** (laporan kejadian: jamaah sakit, hilang, dll)
- **Distribusi obat & medical kit** tracking

### A6. Finance Lanjutan
- **Cashflow forecast** 3-6 bulan ke depan
- **Budgeting per departure** vs realisasi
- **Tax/PPN management** invoice
- **Multi-bank reconciliation** otomatis (upload mutasi → match payment)
- **Komisi marketing/influencer** terpisah dari komisi agent

### A7. Jamaah PWA App (Belum Lengkap)
- **Itinerary harian dengan notifikasi** ("15 menit lagi makan siang")
- **Doa & Panduan offline** sudah ada — perlu **audio doa**
- **Kompas kiblat** + waktu sholat lokasi sekarang
- **Marketplace oleh-oleh** (optional)
- **Galeri foto bersama** per departure (upload + tag)
- **Forum/Group chat** per rombongan

### A8. Reporting & Analytics
- **Dashboard executive** (KPI utama: revenue, booking, agent performance)
- **Cohort analysis** customer retention
- **Funnel analytics** (visit → lead → booking → paid)
- **Agent leaderboard** publik internal

---

## B. FITUR YANG HARUS DIPERBAIKI / DISEMPURNAKAN

### B1. Auth & Akses (Kritikal)
- `isAdmin()` masih terlalu longgar — agent ikut masuk `/admin`
- Login redirect tidak konsisten (agent → `/agent`, customer → `/`, staff → `/admin`)
- Session timeout 30 menit belum aktif di semua role
- 2FA baru ada untuk super_admin — perlu opsional untuk semua admin

### B2. Sidebar & Navigasi
- Sidebar admin kosong karena `menu_items` table tidak ada
- Breadcrumb tidak konsisten antar halaman
- Mobile sidebar admin overlap dengan konten di tablet
- Notification bell belum realtime di semua role

### B3. Booking Wizard
- Card "Bantuan Langkah" menutupi info harga (sudah dilaporkan)
- Step PIC Selection tidak muncul untuk paket tertentu
- Validasi NIK duplikat hanya cek session, belum cek silang antar booking aktif
- Auto-save progress (jamaah refresh browser → data hilang)
- Pembayaran DP partial belum bisa langsung lanjut tanpa logout

### B4. Package Management
- Harga "starting from" di list belum tampil (MIN dari departures)
- Upload foto paket belum ada cropper/compress
- Itinerary builder masih textarea — perlu day-by-day visual
- Tidak ada preview "tampilan publik" sebelum publish

### B5. Customer & Jamaah
- Hapus duplikat NIK belum ada UI (hanya query manual)
- Bulk import customer (CSV) belum ada
- Foto paspor belum auto-OCR (extract nomor & expiry)
- Riwayat perjalanan customer belum ditampilkan di profil

### B6. Operasional
- Room assignment auto-pair gender belum sempurna (kadang mismatched)
- Manifest PDF belum include foto jamaah
- Equipment checklist belum ada signature digital
- QR scan check-in kadang lambat (perlu offline-first)

### B7. Finance
- Verifikasi pembayaran belum ada batch approve
- Invoice PDF belum auto-kirim WhatsApp setelah lunas
- Komisi agent kadang dobel-hitung kalau ada cancellation
- Export Excel laporan belum include filter aktif

### B8. HR
- Manual attendance perlu approval flow
- Payroll belum support komponen variable (lembur, bonus, potongan)
- Slip gaji PDF belum ada
- Cuti/izin workflow belum ada

### B9. Whitelabel & Multi-tenant
- Branding per cabang belum apply ke email & invoice
- Domain custom per agent belum bisa
- Theme switcher belum tersimpan per user

### B10. UI/UX Umum
- Banyak loading skeleton hilang → flash empty state
- Empty state generic — perlu CTA spesifik per modul
- Error toast tidak konsisten (kadang technical message)
- Mobile responsiveness admin masih banyak yang patah

### B11. Performance & Quality
- Beberapa query tidak pakai pagination (>1000 row limit)
- N+1 query di list booking & customer
- Gambar belum lazy load di publik
- Bundle size besar (perlu code splitting per route)
- Banyak `as any` cast karena schema mismatch — perlu sync types

---

## C. RENCANA PENGERJAAN BERTAHAP

### 🔴 FASE 1 — Pondasi & Stabilisasi (Wajib Duluan, ~1 minggu)
**Tujuan: sistem tidak crash, sidebar muncul, akses benar**
1. Migrasi DB: buat `menu_items`, `package_types`, `company_features`, tambah kolom `month`/`airline`/`hotel_*` di `packages` & `departures`
2. Seed `menu_items` dari `AdminRoutes.tsx`
3. Aktifkan filter sidebar berbasis `role_permissions`
4. Aktifkan `permission` prop di `ProtectedRoute`
5. Fix `isAdmin()` — pisah `isStaff/isAgent/isCustomer`
6. Hapus semua `as any` setelah schema sync (regen types)
7. Login redirect per role

### 🟠 FASE 2 — Perbaikan Booking & Package (~1 minggu)
1. Fix card "Bantuan Langkah" overlap
2. Tampilkan harga "starting from" (MIN departures)
3. PIC selection step muncul konsisten
4. Validasi NIK duplikat cross-booking
5. Auto-save wizard progress (localStorage)
6. Itinerary day-by-day visual builder
7. Preview publik paket sebelum publish

### 🟡 FASE 3 — Operasional & Finance (~1-2 minggu)
1. Refund & cancellation workflow
2. Verifikasi pembayaran batch + auto-kirim invoice WA
3. Voucher/coupon integrasi checkout
4. Manifest PDF + foto jamaah
5. Equipment checklist signature digital
6. Slip gaji PDF + komponen variable payroll
7. Cuti/izin workflow HR

### 🟢 FASE 4 — Komunikasi & Engagement (~1 minggu)
1. Broadcast WhatsApp ke segment
2. Email marketing campaign
3. Push notification PWA jamaah
4. Survey kepuasan post-trip otomatis
5. Auto-reminder dokumen (paspor expiry dll)
6. Chat in-app customer ↔ admin

### 🔵 FASE 5 — Jamaah PWA Lanjutan (~1 minggu)
1. Audio doa
2. Kompas kiblat & waktu sholat
3. Galeri foto bersama per departure
4. Forum/group chat per rombongan
5. Itinerary harian + notifikasi waktu

### 🟣 FASE 6 — Analytics & Whitelabel (~1 minggu)
1. Dashboard executive KPI
2. Cohort & funnel analytics
3. Agent leaderboard
4. Branding cabang apply ke email/invoice
5. Custom domain per agent
6. Cashflow forecast & budgeting per departure

### ⚪ FASE 7 — Polish & Performance (ongoing)
1. Pagination semua list
2. Fix N+1 queries
3. Lazy load gambar publik
4. Code splitting per route
5. Loading skeleton & empty state konsisten
6. Mobile responsiveness admin
7. E-sertifikat manasik & umroh
8. Tracking pesawat & live bus map

---

## Detail Teknis (Untuk Eksekusi)

- **Schema regeneration**: setelah Fase 1 migrasi, regen `src/integrations/supabase/types.ts` — hapus semua `as any` cast.
- **Permission engine**: gunakan `useDynamicMenus` + helper `hasPermission(key)` dari `role_permissions`. Cache di `useAuth`.
- **Realtime**: pastikan `supabase_realtime` publication include: `notifications`, `bookings`, `payments`, `whatsapp_logs`.
- **PWA push**: pakai `web-push` lib + edge function `send-push`. VAPID keys disimpan di secrets.
- **Flight tracking**: integrasi AviationStack atau FlightAware (perlu API key dari user).
- **OCR paspor**: pakai Lovable AI Gateway `google/gemini-2.5-flash` untuk extract nomor & expiry dari foto.

---

## Konfirmasi

Apakah saya mulai dari **Fase 1 (Pondasi & Stabilisasi)**? Atau ada fase/fitur tertentu yang ingin diprioritaskan duluan?
