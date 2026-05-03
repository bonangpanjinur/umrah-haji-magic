# Analisis Menu Admin (Top-Down) & Rencana Perbaikan

## TEMUAN STRUKTURAL (KRITIS — harus diperbaiki dulu)

### A. KRITIS: Tabel `menu_items` TIDAK ADA di Database
- `useDynamicMenus.ts` query `from('menu_items')` → **gagal diam-diam**
- Akibat: sidebar `AdminLayoutDynamicImproved` selalu menampilkan "Tidak ada menu tersedia" / kosong, kecuali ada fallback (tidak ada)
- Subscription realtime `public:menu_items_changes` juga error
- **Fix**: Buat tabel `menu_items` + seed dari daftar route di `AdminRoutes.tsx`, ATAU ubah hook untuk pakai konstanta hardcoded (lebih cepat & aman). Rekomendasi: hardcoded constant + tetap sediakan tabel untuk override visibility.

### B. KRITIS: `role_permissions` ada tapi TIDAK DIPAKAI untuk filter sidebar
- Tabel `role_permissions` punya 14+ permission_key per role, tapi `useDynamicMenus` sengaja **tidak melakukan filtering** (komentar: "no permission filtering")
- `useMenuAccess` juga selalu return `true`
- Akibat: semua staf (sales, marketing, finance, operational, equipment, agent) **melihat & bisa akses semua menu admin** — termasuk Finance, HR, Settings, Permissions
- `ProtectedRoute` hanya cek `isAdmin()` (luas), tidak per-permission
- **Fix**: Implementasikan filtering: tiap menu punya `required_permission`, hook `usePermissions()` baca `role_permissions`, sidebar & route guard pakai key yang sama.

### C. KRITIS: `isAdmin()` Terlalu Luas
- `roles.length > 0 && !roles.every(r => r==='customer'||r==='jamaah')` → role `agent` juga dianggap admin dan bisa masuk `/admin`
- Padahal agent punya panel sendiri (`/agent`)
- **Fix**: Pisahkan `isStaff()` (akses /admin shell) dari `isAgent()`. Agent tidak boleh lewat `ALL_STAFF_ROLES` di AdminRoutes.

### D. SEDANG: Error Console "Cannot read properties of undefined (reading 'payload')"
- Tipikal datang dari Supabase realtime channel saat tabel tidak ada (menu_items) atau query subscription invalid
- Hilang otomatis setelah fix A.

---

## AUDIT PER MENU (urut dari atas sidebar)

Group sidebar (asumsi urutan standar `group_name` di seed): **Dashboard → Produk & Operasional → Jamaah & Agent → Keuangan → SDM → Pemasaran → Pengaturan**

### 1. Dashboard (`/admin`)
- OK secara fungsi. Stats per branch sudah respect role.
- Minor: query `equipment_items.stock_quantity` & `customer_documents.status` perlu dipastikan kolomnya ada (cek nanti, biasanya OK).

### 2. Analytics (`/admin/analytics`)
- Cek: beberapa chart masih dummy / 404 jika tabel tidak ada. Konfirmasi saat eksekusi.

### 3. Paket (`/admin/packages`, `/admin/packages/:id`, `/admin/package-types`, `/admin/departures`)
- Bug terbaru sudah disebut: harga di admin belum ambil termurah dari `departures` (di website sudah benar).
- **Fix**: `AdminPackages` list & `AdminPackageDetail` → tampilkan "mulai dari" = MIN(`departures.price_*`) per paket.
- `AdminPackageTypes` & `AdminDepartures`: pastikan kolom `package_type` (bukan `category`) sudah konsisten — dari rencana lama sudah difix, verifikasi.

### 4. Booking (`/admin/bookings`, `/admin/bookings/create`, `/admin/bookings/:id`)
- PIC selection sudah dipasang sebelumnya — verifikasi tampil di create & detail.
- Card "Bantuan Langkah" yang menutup harga saat scroll → perlu sticky/collapsible (sudah disebut sebelumnya, cek apakah sudah).

### 5. Pembayaran (`/admin/payments`)
- Cek: filter status, export, dan upload bukti.

### 6. Keuangan: PL / Cash / AR / AP / Vendors
- AR: tombol reminder piutang sudah direncanakan — verifikasi.
- Vendors & AP: pastikan tidak query tabel yang belum ada.

### 7. Pelanggan & Jamaah (`/admin/customers`, `/admin/customers/:id`, `/admin/document-verification`)
- Fitur hapus jamaah duplikat NIK (owner/super_admin/manager) — verifikasi sudah ada button + konfirmasi + audit log.
- Document verification: status badge & approve/reject flow.

### 8. Agen (`/admin/agents`)
- Daftar agen + commission. Tidak boleh muncul ke role `agent` sendiri.

### 9. Cabang (`/admin/branches`)
- Hanya super_admin/owner yang boleh.

### 10. Kamar (`/admin/room-assignments`)
- Auto-pair teman kamar saat nomor sama (rencana lama). Verifikasi update RLS `booking_passengers` sudah ada policy UPDATE.

### 11. Tabungan (`/admin/savings`)
- Insert error `remaining_amount` (rencana lama). Verifikasi default value sudah set + tombol "Konversi ke Booking".

### 12. Loyalty / Referrals / Coupons / Support / Leads
- Cek query 404. Leads analytics & detail.

### 13. HR (`/admin/hr`, `/admin/hr/payroll`)
- Absensi manual dialog (rencana lama) — verifikasi.
- Hak akses ketat (hanya HR/owner).

### 14. Manasik / Itinerary / Haji / Visa / Equipment / Bus
- Pastikan tidak ada query 404 (`gallery_items`, `about_page_content` sudah difix sebelumnya).

### 15. WhatsApp / Marketing / Landing Pages / Static Pages / Testimonials
- Editor landing page: cek save berfungsi.
- Static pages: konten dinamis untuk footer.

### 16. Appearance / Settings / Permissions / Reports
- Permissions matrix: harus benar-benar mempengaruhi sidebar (lihat poin B).
- Settings: tab hak akses harus ter-link ke `role_permissions`.

### 17. Master Data / Airlines / Airports / Hotels / Muthawifs / Bus Providers
- CRUD standar. Cek tombol delete & RLS.

---

## RENCANA PERBAIKAN — PRIORITAS

| # | Prioritas | Item | File Utama |
|:--|:--|:--|:--|
| 1 | **KRITIS** | Buat tabel `menu_items` + seed dari `AdminRoutes.tsx` (group, label, path, icon, sort_order, required_permission) | Migration SQL |
| 2 | **KRITIS** | Implementasikan filter sidebar berdasar `role_permissions`: hook `usePermissions()` + filter di `useDynamicMenus` | `useDynamicMenus.ts`, `usePermissions.ts` (baru) |
| 3 | **KRITIS** | Route guard per-permission di `ProtectedRoute` (prop `permission`) + apply ke setiap `<Route>` admin | `ProtectedRoute.tsx`, `AdminRoutes.tsx` |
| 4 | **KRITIS** | Pisahkan `isStaff()` vs `isAgent()`; keluarkan `agent` dari `ALL_STAFF_ROLES` admin | `useAuth.tsx`, `AdminRoutes.tsx` |
| 5 | **TINGGI** | Fix harga "mulai dari" di Admin Packages list & detail (MIN dari departures) | `AdminPackages.tsx`, `AdminPackageDetail.tsx`, `usePackages.ts` |
| 6 | **TINGGI** | Verifikasi & perbaiki bug realtime payload undefined (akan hilang setelah #1) + tambah guard subscription | `useDynamicMenus.ts` |
| 7 | **TINGGI** | Verifikasi fitur tertunda: PIC selection, Hapus jamaah, Reminder AR, Auto-pair kamar, Absensi manual, Konversi tabungan → booking. Fix yang belum jadi. | berbagai admin pages |
| 8 | **SEDANG** | Sticky/collapsible "Bantuan Langkah" pada `/booking` agar tidak menutup card harga saat scroll | `BookingWizard.tsx` |
| 9 | **SEDANG** | UI Permission Matrix: grouping per modul, label lengkap, link ke menu key | `AdminSettings.tsx` (tab Permissions) |
| 10 | **RENDAH** | Audit query 404 sisa (gallery_items, dll yang belum bersih) | scan + fix |

## Detail Teknis Singkat

**Skema `menu_items`** (jika belum dibuat):
```
menu_items (id uuid pk, key text unique, label text, path text,
            icon text, group_name text, sort_order int,
            required_permission text references role_permissions(permission_key) by key,
            is_active bool default true)
```
Seed berisi ~50 baris sesuai `AdminRoutes.tsx` (dashboard, analytics, packages, departures, equipment, savings, master-data, branches, bookings, payments, finance, finance-cash, finance/ar, finance/ap, vendors, customers, document-verification, agents, coupons, loyalty, referrals, support, leads, room-assignments, reports, advanced-reports, scheduled-reports, hr, hr/payroll, haji, itinerary-templates, offline-content, documents-generator, whatsapp, marketing-materials, appearance, static-pages, testimonials, landing-pages, settings, package-types, manasik, visa).

**`usePermissions` hook**:
- Fetch sekali: `select role,permission_key from role_permissions where is_enabled=true and role in (myRoles)`
- Return `Set<string>` permission keys + `can(key)`.

**Filter sidebar**:
- `useDynamicMenus` filter `menus.filter(m => can(m.required_permission))`.
- Super admin bypass.

**Route guard**:
- `<ProtectedRoute permission="finance.view">` redirect `/admin` jika tidak punya.

Setelah disetujui, saya kerjakan urutan #1 → #4 dulu (struktural), kemudian #5–#7 (fitur), lalu sisanya.
