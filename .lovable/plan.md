

# Rencana Perbaikan Bug CSS/JS -- Analisis Terkini

## Temuan Setelah Analisis

Banyak bug dari rencana sebelumnya **sudah diperbaiki**: `user-scalable=no` sudah dihapus, fallback `:root` vars sudah ada, `font-arabic` sudah didefinisikan, `QueryClient` sudah dikonfigurasi, `ErrorBoundary` sudah punya reload guard, navbar sudah close on route change, `prefers-reduced-motion` sudah ditambahkan, search widget sudah `bg-card`, sidebar/chart CSS vars sudah ada di ThemeProvider.

Berikut bug yang **masih aktif**:

---

### 1. KRITIS: `useDepartures` Query `packages(name, category)` -- Kolom `category` Tidak Ada

**File**: `src/hooks/useDepartures.ts` baris 19

Query `.select('*, packages(name, category), ...')` gagal karena tabel `packages` tidak punya kolom `category`. Network request mengembalikan **400 error**: `column packages_1.category does not exist`.

Ini menyebabkan **halaman homepage gagal memuat departures** untuk search widget dan **halaman admin departures** rusak total.

**Fix**: Ganti `packages(name, category)` menjadi `packages(name, package_type)` karena `package_type` adalah kolom yang benar.

### 2. TINGGI: Footer Logo `dark:brightness-0 dark:invert` Tidak Efektif

**File**: `src/components/layout/DynamicFooter.tsx` baris 166, 203

Class `dark:brightness-0 dark:invert` hanya aktif jika `<html class="dark">` -- tapi aplikasi ini **tidak menggunakan dark mode class**. Tema dikelola via CSS variables, bukan Tailwind dark mode. Jadi logo di footer **tidak pernah diinvert**, dan jika footer bg gelap (sidebar bg gelap), logo bisa invisible.

**Fix**: Deteksi lightness dari sidebar background CSS variable, atau gunakan `brightness-0 invert` tanpa `dark:` prefix karena footer selalu pakai `bg-sidebar` yang bisa gelap.

### 3. TINGGI: `@import` CSS di Akhir File -- Invalid per CSS Spec

**File**: `src/index.css` baris 241

`@import url('...Amiri...')` ditempatkan **di akhir file** setelah semua rules. Per spesifikasi CSS, `@import` harus berada **sebelum semua aturan lain** (kecuali `@charset`). Browser modern mungkin mengabaikan import ini, menyebabkan font Amiri **tidak pernah dimuat**.

**Fix**: Pindahkan `@import` ke **baris pertama** sebelum `@tailwind base`.

### 4. SEDANG: Hero Stats Masih Query Tabel `hero_stats` yang 404

**File**: `src/hooks/useHeroStats.ts`

Meskipun sudah ada fallback ke `DEFAULT_HERO_STATS`, setiap page load tetap mengirim request ke `hero_stats` yang return **404**. Ini menghasilkan console warning dan network noise yang tidak perlu.

Sementara `website_settings.custom_sections.stats` sudah punya data stats (dari DB response), hero section **tidak membaca** data itu -- malah query tabel terpisah yang tidak ada.

**Fix**: Baca stats dari `custom_sections.stats` di `website_settings` (sudah ada datanya) alih-alih query tabel `hero_stats`. Hapus request 404 yang sia-sia.

### 5. SEDANG: `DynamicHeroSection` Memanggil `useDepartures()` yang Gagal

**File**: `src/components/home/DynamicHeroSection.tsx` baris 22

Karena `useDepartures()` query gagal (bug #1), hero section memanggil hook yang error. Meskipun `departures` fallback ke `undefined`, ini tetap menghasilkan error di console dan wasted network request.

**Fix**: Setelah fix bug #1, ini otomatis terselesaikan. Tapi lebih baik buat query departures terpisah yang lebih ringan khusus untuk homepage (hanya ambil `departure_date` untuk populate bulan).

### 6. RENDAH: Duplikat Font Preload di `index.html`

**File**: `index.html` baris 24-26

Ada `<link rel="preload" ...>` dan `<link rel="stylesheet" ...>` untuk Google Fonts (Plus Jakarta Sans + Inter), **tapi** ThemeProvider bisa menimpa font ini dengan font lain dari database (saat ini: Playfair Display + Lato). Jadi preload font yang salah = wasted bandwidth.

**Fix**: Hapus hardcoded font preload dari `index.html`. Biarkan `ThemeProvider.loadGoogleFonts()` yang menangani loading font secara dinamis.

---

## Ringkasan File yang Dimodifikasi

| File | Perubahan |
|:---|:---|
| `src/hooks/useDepartures.ts` | `packages(name, category)` → `packages(name, package_type)` |
| `src/components/layout/DynamicFooter.tsx` | Hapus `dark:` prefix pada logo invert, gunakan conditional berdasarkan sidebar lightness |
| `src/index.css` | Pindahkan `@import url('...Amiri...')` ke baris pertama |
| `src/hooks/useHeroStats.ts` | Baca dari `website_settings.custom_sections.stats` bukan query tabel 404 |
| `src/components/home/DynamicHeroSection.tsx` | Gunakan stats dari settings, bukan `useHeroStats()` |
| `index.html` | Hapus hardcoded font preload (Plus Jakarta Sans + Inter) |

## Prioritas

| # | Prioritas | Item |
|:--|:----------|:-----|
| 1 | **KRITIS** | Fix `useDepartures` -- `category` → `package_type` (400 error aktif) |
| 2 | **TINGGI** | Fix `@import` posisi di CSS (font Arab mungkin tidak dimuat) |
| 3 | **TINGGI** | Fix footer logo invert (tidak efektif tanpa dark class) |
| 4 | **SEDANG** | Hero stats: baca dari `custom_sections` bukan tabel 404 |
| 5 | **SEDANG** | Bersihkan hero departures query |
| 6 | **RENDAH** | Hapus font preload yang tidak terpakai |

