
# Rencana Perbaikan Bug -- Analisis Terkini

## Bug yang sudah diperbaiki sebelumnya (SKIP)
- `useDepartures` category -> package_type: SUDAH FIX
- `@import` Amiri di akhir file: SUDAH FIX (sekarang di baris 1)
- `user-scalable=no`: SUDAH FIX
- `:root` fallback vars: SUDAH FIX
- `font-arabic`: SUDAH FIX
- `useHeroStats` query tabel 404: SUDAH FIX (sekarang baca dari `website_settings`)
- Footer logo invert: SUDAH FIX (brightness-0 invert tanpa dark:)

---

## Bug yang Masih Aktif

### 1. TINGGI: `usePackageTypes` Query Tabel `package_types` yang Tidak Ada (404)

**File**: `src/hooks/usePackageTypes.ts`

Network logs menunjukkan request ke `package_types` return **404**: `Could not find the table 'public.package_types'`. Meskipun ada fallback ke `DEFAULT_PACKAGE_TYPES`, setiap page load menghasilkan 404 error + console warning. Hook ini cast `supabase as any` untuk menghindari type error -- tanda jelas tabel tidak ada.

**Fix**: Hapus query ke tabel yang tidak ada. Gunakan enum `package_type` dari packages langsung, atau hardcode default types (sudah ada). Hapus `(supabase as any)` cast.

### 2. TINGGI: `useCompanyFeatures` Query Tabel `company_features` yang Tidak Ada (404)

**File**: `src/hooks/useCompanyFeatures.ts` dan `src/components/admin/appearance/CompanyFeaturesEditor.tsx`

Sama seperti di atas -- tabel `company_features` tidak ada di database. Setiap page load = 404 error. Editor di admin juga upsert ke tabel yang tidak ada, jadi fitur "edit company features" di admin **tidak berfungsi sama sekali**.

**Fix**: Simpan company features di `website_settings.custom_sections.features` (pattern yang sama seperti stats). Update hook dan editor untuk baca/tulis ke sana.

### 3. SEDANG: `PackageCard` Harga Terendah = Rp0 untuk Paket Kosong

**File**: `src/components/packages/PackageCard.tsx` baris 14-19

`Math.min(0, 0, 0, 0)` = 0. Paket seperti "paket tabungan" dan "paket baru" punya semua harga = 0, sehingga ditampilkan sebagai **"Rp0"** di card. Ini menyesatkan pengguna.

**Fix**: Filter harga > 0 sebelum `Math.min()`. Jika semua 0, tampilkan "Hubungi Kami" bukan "Rp0".

### 4. SEDANG: Console Warning -- Badge Ref pada PackageCard

**File**: `src/components/ui/badge.tsx`

Console menunjukkan `Function components cannot be given refs` dari `Badge` di `PackageCard`. Badge menggunakan `<div>` tapi tidak wrapped dengan `forwardRef`. Tooltip atau parent component mungkin mencoba memberikan ref.

**Fix**: Wrap Badge component dengan `React.forwardRef`.

### 5. SEDANG: Footer Menampilkan Contact Kosong

**File**: `src/components/layout/DynamicFooter.tsx` baris 119-139

`renderContactInfo()` selalu render phone, email, address -- bahkan jika kosong (dari DB: `footer_phone: ""`, `footer_email: ""`, `footer_whatsapp: ""`). Ini menghasilkan icon tanpa teks, link `tel:` dan `mailto:` kosong.

**Fix**: Hanya render item contact jika nilainya tidak kosong. Skip seluruh section jika semua kosong.

### 6. RENDAH: Social Icons Dummy Ditampilkan

**File**: `src/components/layout/DynamicFooter.tsx` baris 108-114

Jika tidak ada social media yang dikonfigurasi (`!hasSocial`), footer menampilkan 3 **dummy icons** (Facebook, Instagram, YouTube) tanpa link. Ini misleading karena icons tidak mengarah ke mana pun.

**Fix**: Jangan tampilkan social icons jika tidak ada yang dikonfigurasi. Hapus dummy fallback.

### 7. RENDAH: Initial Loader Tidak Dihapus Setelah React Mount

**File**: `index.html` baris 144 + `src/main.tsx`

Element `#initialLoader` dengan class `loading-state` pada body ditampilkan saat load. Perlu dicek apakah ada kode yang menghapus loader ini setelah React mount. Jika tidak, loader bisa menutupi konten.

**Fix**: Pastikan `main.tsx` atau `App.tsx` menghapus `#initialLoader` dan `loading-state` class setelah mount.

---

## Ringkasan File yang Dimodifikasi

| File | Perubahan |
|:---|:---|
| `src/hooks/usePackageTypes.ts` | Hapus query ke tabel 404, gunakan hardcoded defaults saja |
| `src/hooks/useCompanyFeatures.ts` | Baca dari `website_settings.custom_sections.features` |
| `src/components/admin/appearance/CompanyFeaturesEditor.tsx` | Tulis ke `website_settings.custom_sections.features` |
| `src/components/packages/PackageCard.tsx` | Handle harga 0, tampilkan "Hubungi Kami" |
| `src/components/ui/badge.tsx` | Wrap dengan `React.forwardRef` |
| `src/components/layout/DynamicFooter.tsx` | Skip contact/social kosong, hapus dummy icons |
| `src/main.tsx` | Pastikan initial loader dihapus |

## Prioritas

| # | Prioritas | Item |
|:--|:----------|:-----|
| 1 | **TINGGI** | Fix `usePackageTypes` 404 query |
| 2 | **TINGGI** | Fix `useCompanyFeatures` 404 query + editor |
| 3 | **SEDANG** | PackageCard harga Rp0 |
| 4 | **SEDANG** | Badge forwardRef warning |
| 5 | **SEDANG** | Footer contact kosong |
| 6 | **RENDAH** | Hapus dummy social icons |
| 7 | **RENDAH** | Initial loader cleanup |
