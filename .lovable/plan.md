
# Rencana Perbaikan Bug -- Analisis Terkini

## Bug yang Masih Aktif

### 1. TINGGI: `usePackageTypes` Query Tabel 404
**File**: `src/hooks/usePackageTypes.ts`
Tabel `package_types` tidak ada di database. Setiap page load = 404 + console warning.
**Fix**: Hapus query, return hardcoded defaults langsung (data statis, tidak perlu DB).

### 2. TINGGI: `useCompanyFeatures` Query Tabel 404 + Editor Rusak
**File**: `src/hooks/useCompanyFeatures.ts`, `CompanyFeaturesEditor.tsx`
Tabel `company_features` tidak ada. Editor admin upsert ke tabel yang tidak ada.
**Fix**: Baca/tulis dari `website_settings.custom_sections.features` (pattern sama seperti stats).

### 3. SEDANG: PackageCard Harga Rp0
**File**: `src/components/packages/PackageCard.tsx`
Paket dengan semua harga = 0 menampilkan "Rp0". Menyesatkan.
**Fix**: Filter harga > 0, tampilkan "Hubungi Kami" jika semua 0.

### 4. SEDANG: Badge `forwardRef` Warning
**File**: `src/components/ui/badge.tsx`
Console: `Function components cannot be given refs` dari PackageCard.
**Fix**: Wrap Badge dengan `React.forwardRef`.

### 5. SEDANG: Footer Render Contact Kosong
**File**: `src/components/layout/DynamicFooter.tsx`
Phone, email, address kosong dari DB tapi tetap render icon tanpa teks + link kosong.
**Fix**: Skip item jika value kosong.

### 6. RENDAH: Dummy Social Icons Tanpa Link
**File**: `src/components/layout/DynamicFooter.tsx`
Jika tidak ada social media, 3 dummy icons ditampilkan tanpa href.
**Fix**: Hapus dummy fallback.

### 7. RENDAH: Initial Loader Cleanup
**File**: `src/main.tsx`
Pastikan `#initialLoader` dan `loading-state` class dihapus setelah React mount.

---

## File yang Dimodifikasi

| File | Perubahan |
|:---|:---|
| `src/hooks/usePackageTypes.ts` | Return defaults tanpa query |
| `src/hooks/useCompanyFeatures.ts` | Baca dari `custom_sections.features` |
| `src/components/admin/appearance/CompanyFeaturesEditor.tsx` | Tulis ke `custom_sections.features` |
| `src/components/packages/PackageCard.tsx` | Handle harga 0 |
| `src/components/ui/badge.tsx` | `forwardRef` |
| `src/components/layout/DynamicFooter.tsx` | Skip contact/social kosong |
| `src/main.tsx` | Hapus initial loader |

## Prioritas

| # | Prioritas | Item |
|:--|:----------|:-----|
| 1 | TINGGI | Fix `usePackageTypes` 404 |
| 2 | TINGGI | Fix `useCompanyFeatures` 404 + editor |
| 3 | SEDANG | PackageCard harga Rp0 |
| 4 | SEDANG | Badge forwardRef |
| 5 | SEDANG | Footer contact kosong |
| 6 | RENDAH | Hapus dummy social icons |
| 7 | RENDAH | Initial loader cleanup |
