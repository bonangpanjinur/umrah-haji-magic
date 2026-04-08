

# Analisis Kekurangan Alur Pemesanan & Rencana Perbaikan

## Ringkasan Alur Saat Ini

```text
PackageDetail → PackageBookingForm (pilih departure + kamar + PIC)
  → BookingPage/BookingWizard (2 step: Data Jamaah → Review)
    → BookingSuccess (kode booking + instruksi bayar)
      → MyBookings → BookingDetail → PaymentUpload
```

---

## Bug & Kekurangan yang Ditemukan

### 1. KRITIS: Race Condition pada Kuota Keberangkatan
**File**: `useBookingWizardDynamic.ts` baris 191-203

Update `booked_count` dilakukan dengan pola read-then-write tanpa lock:
```
SELECT booked_count → UPDATE booked_count + totalPax
```
Jika 2 user booking bersamaan, keduanya baca `booked_count` yang sama → overselling. Tidak ada validasi server-side apakah kuota masih cukup sebelum insert booking.

**Fix**: Buat database function `increment_booked_count(departure_id, pax)` yang atomic dengan validasi `booked_count + pax <= quota`.

### 2. KRITIS: Diskon Kupon Tidak Disimpan ke Database
**File**: `StepReviewDynamic.tsx` + `useBookingWizardDynamic.ts`

Kupon divalidasi di `StepReviewDynamic` tapi `onCouponApplied` callback **tidak pernah di-pass** dari `BookingWizard`. Hasilnya:
- Diskon tampil di UI tapi `submitBooking()` menghitung `totalPrice` **tanpa diskon**
- Field `discount_amount` di tabel `bookings` selalu 0
- Kupon `used_count` tidak di-increment setelah booking berhasil

**Fix**: Propagate coupon/referral state dari StepReview ke BookingWizard, lalu masukkan ke `submitBooking()`.

### 3. TINGGI: `HotelDisplay` forwardRef Warning
**File**: `src/components/hotels/HotelDisplay.tsx`

Console error: "Function components cannot be given refs" dari `PackageBookingForm`. Komponen `HotelDisplay` dirender di dalam `<span>` yang mungkin menerima ref dari parent.

**Fix**: Wrap `HotelDisplay` dengan `React.forwardRef`.

### 4. TINGGI: Tidak Ada Validasi Kuota Saat Masuk Halaman Booking
**File**: `BookingWizard.tsx`

User bisa buka `/booking/:packageId?departure=...&quad=10` langsung via URL. Tidak ada pengecekan apakah kuota departure masih cukup untuk jumlah penumpang yang diminta. User bisa submit booking melebihi kuota.

**Fix**: Validasi `booked_count + totalPassengers <= quota` saat BookingWizard mount dan sebelum submit.

### 5. TINGGI: `remaining_amount` Tidak Di-set Saat Booking
**File**: `useBookingWizardDynamic.ts` baris 149-166

Kolom `remaining_amount` **tidak diisi** saat insert booking (field nullable). Tapi `BookingDetail` dan `PaymentUpload` menampilkan `booking.remaining_amount` untuk sisa pembayaran. Akibatnya, sisa bayar tampil `null` atau `Rp0`.

**Fix**: Set `remaining_amount: totalPrice` saat insert booking.

### 6. SEDANG: Passenger Data Minimal — Tidak Ada NIK/Passport
**File**: `StepPassengersDynamic.tsx`, `useBookingWizardDynamic.ts`

`DynamicPassengerData` hanya memiliki `fullName`, `gender`, `phone`, `passengerType`. Tidak ada field NIK, email, tanggal lahir. Saat create customer di `submitBooking()`, record customer hanya punya nama dan gender — data lainnya kosong. Ini menyulitkan proses verifikasi dan operasional.

**Fix**: Tambah field NIK dan tanggal lahir (minimal) di `DynamicPassengerData` dan form `StepPassengersDynamic`.

### 7. SEDANG: Layout Inkonsisten — BookingPage vs BookingSuccess
**File**: `BookingPage.tsx` vs `BookingSuccess.tsx`

- `BookingPage` menggunakan `PublicLayout` (navbar statis)
- `BookingSuccess` juga `PublicLayout`
- Tapi `PackageDetail` menggunakan `DynamicPublicLayout` (navbar dinamis)

User yang datang dari `PackageDetail` → `BookingPage` akan melihat navbar berubah.

**Fix**: Ubah `BookingPage` dan `BookingSuccess` menggunakan `DynamicPublicLayout`.

### 8. SEDANG: Tidak Ada Konfirmasi Sebelum Submit Booking
**File**: `BookingWizard.tsx` baris 103-106

Tombol "Konfirmasi Booking" langsung memanggil `submitBooking()` tanpa dialog konfirmasi. User bisa tidak sengaja menekan tombol dan langsung tercatat sebagai booking.

**Fix**: Tambahkan `ConfirmDialog` sebelum submit.

### 9. RENDAH: PIC Source "Cabang/Agen" Tidak Validasi Pilihan
**File**: `PackageBookingForm.tsx` baris 159

`canProceed` hanya cek `selectedDeparture && totalPassengers > 0 && hasPricing && !doubleValidationError`. Jika user pilih PIC = "cabang" tapi tidak pilih cabang, atau PIC = "agen" tapi tidak pilih agen, booking tetap bisa lanjut tanpa data PIC yang lengkap.

**Fix**: Tambah validasi: jika `picSource === 'cabang'` maka `selectedBranchId` wajib, dsb.

### 10. RENDAH: Double Room Validation Message Kurang Jelas
**File**: `PackageBookingForm.tsx` baris 158

Validasi `roomAllocation.double % 2 !== 0` hanya menampilkan pesan teks. Seharusnya tombol +/- untuk Double langsung melompat per 2 (increment by 2) untuk mencegah input ganjil.

**Fix**: Ubah increment Double menjadi +2/-2 alih-alih validasi pasca-input.

---

## Rencana Implementasi

| # | Prioritas | Item | File |
|:--|:----------|:-----|:-----|
| 1 | KRITIS | Atomic quota update dengan DB function | Migration SQL + `useBookingWizardDynamic.ts` |
| 2 | KRITIS | Propagate diskon kupon ke submitBooking | `BookingWizard.tsx`, `useBookingWizardDynamic.ts` |
| 3 | TINGGI | Set `remaining_amount` saat insert | `useBookingWizardDynamic.ts` |
| 4 | TINGGI | Validasi kuota di BookingWizard mount | `BookingWizard.tsx` |
| 5 | TINGGI | Fix HotelDisplay forwardRef | `HotelDisplay.tsx` |
| 6 | SEDANG | Tambah NIK & tanggal lahir ke form | `StepPassengersDynamic.tsx`, `useBookingWizardDynamic.ts` |
| 7 | SEDANG | Layout konsisten (DynamicPublicLayout) | `BookingPage.tsx`, `BookingSuccess.tsx` |
| 8 | SEDANG | Dialog konfirmasi sebelum submit | `BookingWizard.tsx` |
| 9 | RENDAH | Validasi PIC source lengkap | `PackageBookingForm.tsx` |
| 10 | RENDAH | Double room increment by 2 | `PackageBookingForm.tsx` |

### Detail Teknis

**Migration SQL (Bug #1)**:
```sql
CREATE OR REPLACE FUNCTION public.increment_departure_booked(
  _departure_id uuid, _pax integer
) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public'
AS $$
DECLARE current_booked integer; current_quota integer;
BEGIN
  SELECT booked_count, quota INTO current_booked, current_quota
  FROM departures WHERE id = _departure_id FOR UPDATE;
  IF current_booked + _pax > current_quota THEN RETURN false; END IF;
  UPDATE departures SET booked_count = current_booked + _pax WHERE id = _departure_id;
  RETURN true;
END; $$;
```

**Bug #2 — Coupon flow**: Tambah state `appliedDiscount` dan `appliedCouponCode` di `BookingWizard`, pass sebagai props ke `StepReviewDynamic`, lalu kirim ke `submitBooking()` yang akan set `discount_amount` dan `total_price` dengan benar.

**Bug #5 — remaining_amount**: Satu baris tambahan di insert: `remaining_amount: totalPrice - discountAmount`.

