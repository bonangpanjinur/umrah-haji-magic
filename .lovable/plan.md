
# Rencana Pengembangan & Perbaikan Lanjutan

Setelah menyelesaikan 4 fase fondasi (Stabilitas, Arsitektur, Shared Components, Data Layer), berikut adalah rencana pengembangan berikutnya yang dibagi dalam 5 fase strategis.

---

## Fase 5: Adopsi Data Layer Hooks ke Halaman yang Ada

Saat ini hooks seperti `useCustomers`, `useBookings`, `useLeads` sudah dibuat tapi belum dipakai di halaman admin. Halaman-halaman masih menulis query Supabase langsung di komponen.

**Yang dikerjakan:**
- Refactor `AdminCustomers.tsx` agar menggunakan `useCustomers()` bukan query inline
- Refactor `AdminLeads.tsx` agar menggunakan `useLeads()` 
- Refactor `AdminPayments.tsx` - extract verify mutation ke hook `usePayments()`
- Refactor `AdminDashboard.tsx` - extract 3 query menjadi hook `useDashboardStats()`
- Refactor `AgentDashboard.tsx` agar menggunakan `useAgents()`

**Dampak:** Menghilangkan duplikasi query, konsistensi cache, dan komponen lebih bersih.

---

## Fase 6: Adopsi Shared Components ke Halaman

Komponen `DataTable`, `StatusBadge`, `LoadingState`, `EmptyState`, dan `ConfirmDialog` sudah dibuat tapi belum dipakai di halaman admin.

**Yang dikerjakan:**
- `AdminCustomers.tsx` - ganti table manual dengan `DataTable` + `StatusBadge`
- `AdminPayments.tsx` - ganti table manual dengan `DataTable` + `StatusBadge`
- `AdminLeads.tsx` - integrasikan `StatusBadge` untuk lead status
- `AdminBookings.tsx` - ganti table manual dengan `DataTable`
- Semua halaman - ganti loading skeleton manual dengan `LoadingState`, ganti empty state manual dengan `EmptyState`
- Semua dialog konfirmasi delete - ganti dengan `ConfirmDialog`

**Dampak:** UI lebih konsisten, kode halaman berkurang signifikan (estimasi -40% LOC per halaman).

---

## Fase 7: Fitur Kritis yang Belum Ada

### 7A. Sistem Notifikasi Email Transaksional
- Buat edge function `send-email` menggunakan Lovable AI atau layanan email
- Trigger email otomatis untuk: booking baru, pembayaran diverifikasi, perubahan status
- Tabel `email_logs` untuk tracking

### 7B. Payment Gateway (Midtrans/Xendit)
- Buat edge function `create-payment` untuk generate payment link
- Buat edge function `payment-webhook` untuk terima callback otomatis
- Update status pembayaran otomatis tanpa verifikasi manual
- Tabel `payment_transactions` untuk tracking gateway

### 7C. Dashboard Real-time
- Aktifkan Supabase Realtime di tabel `bookings` dan `payments`
- Dashboard admin update otomatis tanpa refresh
- Notifikasi real-time saat ada booking/pembayaran baru

---

## Fase 8: UX & Mobile Improvements

**Yang dikerjakan:**
- Perbaiki responsiveness AdminLayout sidebar di tablet (768px-1024px)
- Tambah "pull to refresh" di halaman Jamaah Portal (PWA)
- Tambah skeleton loading yang lebih baik di semua halaman
- Tambah breadcrumb navigation di halaman admin
- Perbaiki form validation feedback (inline error, highlight field)
- Tambah keyboard shortcut untuk navigasi admin (Ctrl+K search)

---

## Fase 9: Keamanan & Performa

### Keamanan
- Audit semua edge function - pastikan validasi input dengan Zod
- Tambah rate limiting di edge function kritis (login, payment)
- Review RLS policies - pastikan branch isolation benar-benar enforce
- Implementasi session timeout (auto logout setelah inaktif)

### Performa
- Lazy load route modules (React.lazy + Suspense) - saat ini semua page di-import eager
- Optimasi query dashboard - gunakan database views atau materialized views
- Implementasi pagination server-side untuk tabel dengan data banyak (customers, bookings)
- Image optimization - compress bukti transfer sebelum upload

---

## Urutan Prioritas Eksekusi

```text
Fase 5 (Adopsi Hooks)     ← Paling mudah, dampak langsung
    |
Fase 6 (Adopsi Components) ← Mudah, UI konsisten
    |
Fase 7A (Email)            ← Fitur kritis untuk bisnis
Fase 7C (Realtime)         ← UX boost besar
    |
Fase 8 (UX/Mobile)         ← Polish
    |
Fase 7B (Payment Gateway)  ← Butuh API key external
Fase 9 (Security/Perf)     ← Optimasi lanjutan
```

---

## Detail Teknis

### Fase 5 - Contoh Refactor
Sebelum:
```typescript
// AdminCustomers.tsx - 30 baris query inline
const { data: customers } = useQuery({
  queryKey: ['admin-customers'],
  queryFn: async () => {
    const { data, error } = await supabase.from('customers').select('*')...
  }
});
```

Sesudah:
```typescript
// AdminCustomers.tsx - 1 baris
const { data: customers, isLoading } = useCustomerList();
```

### Fase 6 - Contoh Refactor
Sebelum: ~80 baris table manual (TableHeader, TableBody, TableRow, dll)
Sesudah: ~15 baris DataTable dengan column config

### Fase 7B - Payment Gateway Architecture
```text
Customer -> Edge Function (create-payment)
    -> Midtrans/Xendit API -> Payment Page
    -> Customer bayar
    -> Webhook -> Edge Function (payment-webhook)
    -> Update DB otomatis
```

### Fase 9 - Lazy Loading
```typescript
// Sebelum
import AdminDashboard from "@/pages/admin/AdminDashboard";

// Sesudah
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
```

---

## Estimasi File yang Akan Dibuat/Diubah

| Fase | File Baru | File Diubah | Estimasi |
|------|-----------|-------------|----------|
| 5 | 1-2 hooks baru | 5-6 halaman | Ringan |
| 6 | 0 | 5-8 halaman | Ringan |
| 7A | 1 edge function, 1 migration | 2-3 halaman | Sedang |
| 7B | 2 edge functions, 1 migration | 3-4 halaman | Berat |
| 7C | 0 migration (ALTER) | 2-3 halaman | Ringan |
| 8 | 1-2 components | 5-10 halaman | Sedang |
| 9 | 0-1 | 5-8 file | Sedang |
