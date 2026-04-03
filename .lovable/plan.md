

# Rencana Perbaikan Bug CSS/JS

## Bug yang Ditemukan

### 1. KRITIS: `user-scalable=no` Memblokir Zoom Aksesibilitas
**File**: `index.html` baris 5
`maximum-scale=1.0, user-scalable=no` mencegah pengguna zoom di mobile. Ini melanggar WCAG 2.1 dan buruk untuk aksesibilitas.
**Fix**: Hapus `maximum-scale=1.0, user-scalable=no`.

### 2. KRITIS: CSS Variables Tidak Ada di `:root` — Halaman Putih Kosong
**File**: `src/index.css`
Semua default CSS variable dihapus dari `:root` (baris 11-21). Jika localStorage kosong DAN database belum merespons, **semua warna tidak terdefinisi** → `hsl(var(--background))` = invalid → halaman putih, teks tak terlihat.
**Fix**: Tambahkan fallback CSS variables di `:root` sebagai baseline.

### 3. TINGGI: `font-arabic` Class Tidak Terdefinisi
**File**: Dipakai di 5 file (`DynamicHeroSection.tsx`, `HeroSection.tsx`, `JamaahDoaPanduan.tsx`, dll) tapi **tidak ada definisi** di CSS atau Tailwind config. Font Arab menggunakan font default sans-serif.
**Fix**: Tambahkan `font-arabic` di `index.css` dan load font Arab (Amiri/Scheherazade).

### 4. TINGGI: Missing CSS Variables untuk Sidebar Foreground & Chart
**File**: `tailwind.config.ts` mereferensikan `--sidebar-primary-foreground`, `--sidebar-accent-foreground`, `--chart-1` s/d `--chart-5`, tapi `ThemeProvider.tsx` **tidak pernah menghasilkan** variable ini. Footer dan sidebar UI menggunakan `hsl(undefined)` → warna fallback browser (hitam/transparan).
**Fix**: Tambahkan variable ini di `generateCSSVariables()`.

### 5. SEDANG: `QueryClient` Tanpa Konfigurasi Retry/Stale
**File**: `src/App.tsx` baris 18 — `new QueryClient()` tanpa opsi. Default: 3 retry, infinite stale time = request berulang saat error, dan data tidak pernah di-refetch otomatis.
**Fix**: Konfigurasi `retry: 1`, `staleTime: 5 * 60 * 1000`, `refetchOnWindowFocus: false`.

### 6. SEDANG: Footer Logo `brightness-0 invert` Hardcoded
**File**: `DynamicFooter.tsx` baris 166, 203 — `brightness-0 invert` diterapkan pada logo footer. Ini membuat logo selalu putih, tapi jika sidebar background terang (white), logo jadi invisible.
**Fix**: Deteksi lightness dari `--sidebar-background` atau gunakan conditional class.

### 7. SEDANG: Search Widget Hero — Warna Hardcoded Putih
**File**: `DynamicHeroSection.tsx` baris 100 — `bg-white` hardcoded pada search widget. Jika tema dark/custom, ini mencolok dan tidak konsisten.
**Fix**: Ganti `bg-white` → `bg-card`.

### 8. RENDAH: Mobile Navbar Tidak Menutup saat Navigate
**File**: `DynamicNavbar.tsx` — state `isOpen` di-close via `onClick` pada setiap link, tapi jika user menekan tombol Back browser, menu tetap terbuka karena tidak listen ke `location` changes.
**Fix**: Tambahkan `useEffect` yang menutup menu saat `location.pathname` berubah.

### 9. RENDAH: `ErrorBoundary` Auto-Reload tanpa Guard
**File**: `ErrorBoundary.tsx` baris 29-32 — jika chunk error berulang, `componentDidCatch` memanggil `window.location.reload()` tanpa limit. Sudah ada guard di `main.tsx` (MAX_RELOAD_ATTEMPTS=3) tapi `ErrorBoundary` bypass itu.
**Fix**: Gunakan counter dari `sessionStorage` di `ErrorBoundary` juga.

### 10. RENDAH: Hardcoded WhatsApp Number di PackageBookingForm
**File**: `PackageBookingForm.tsx` baris 350 — `6281234567890` hardcoded. Seharusnya ambil dari `website_settings.footer_whatsapp`.
**Fix**: Baca dari `useWebsiteSettings()`.

### 11. RENDAH: Animated Elements Tanpa `prefers-reduced-motion` Guard
**File**: `index.css` — `.animate-fade-in`, `.animate-slide-up`, dll tidak dihentikan untuk user yang memilih reduced motion.
**Fix**: Tambahkan `@media (prefers-reduced-motion: reduce) { .animate-* { animation: none; } }`.

---

## Ringkasan File yang Dimodifikasi

| File | Perubahan |
|:---|:---|
| `index.html` | Hapus `user-scalable=no`, `maximum-scale=1.0` |
| `src/index.css` | Tambah fallback `:root` vars, `font-arabic`, `prefers-reduced-motion` |
| `src/App.tsx` | Konfigurasi `QueryClient` default options |
| `src/components/providers/ThemeProvider.tsx` | Tambah `--sidebar-primary-foreground`, `--sidebar-accent-foreground`, `--chart-1`~`5` |
| `src/components/home/DynamicHeroSection.tsx` | `bg-white` → `bg-card` |
| `src/components/layout/DynamicNavbar.tsx` | Close menu on `location` change |
| `src/components/layout/DynamicFooter.tsx` | Conditional logo invert |
| `src/components/packages/PackageBookingForm.tsx` | Ambil WA number dari settings |
| `src/components/ErrorBoundary.tsx` | Tambah reload counter guard |

