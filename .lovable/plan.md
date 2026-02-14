
# Rencana Perbaikan: Error Payment Status & Build Errors

## Masalah Utama

**Error "invalid input value for enum payment_status: 'verified'"**

Penyebab: Kode mencoba menyimpan status `'verified'` ke kolom `payments.status`, tapi enum `payment_status` di database hanya berisi: `pending`, `partial`, `paid`, `refunded`, `failed`. Nilai `'verified'` tidak ada di database meskipun sudah ada di `types.ts` (karena migrasi sebelumnya gagal -- `ALTER TYPE ADD VALUE` tidak bisa dijalankan dalam transaction block).

**Solusi**: Tidak perlu menambah nilai enum baru. Cukup ganti logika verifikasi agar menggunakan status `'paid'` (bukan `'verified'`), karena secara bisnis "verified" = "paid". Ini lebih sederhana dan konsisten.

---

## Masalah Sekunder: 26 Build Errors di Edge Functions

Semua error ada di 2 file edge function:

### 1. `send-payment-reminder/index.ts` (9 errors)
- `whatsapp_config` query mengembalikan tipe `never` karena tabel tidak ada di types.ts
- `whatsapp_logs` insert juga `never`
- **Fix**: Tambah type assertion `.returns<any>()` atau cast ke `any` pada query whatsapp_config dan whatsapp_logs

### 2. `send-whatsapp-notification/index.ts` (17 errors)
- `customer:customers(full_name, phone)` mengembalikan array, bukan object -- Supabase join hasilnya perlu `.single()` atau akses `[0]`
- `error.message` -- `error` bertipe `unknown`
- **Fix**: Akses customer sebagai `booking.customer[0]` atau cast, dan cast error ke `Error`

---

## Rencana Eksekusi

### Langkah 1: Fix Payment Status (Prioritas Utama)

**File: `src/pages/admin/AdminPayments.tsx`**
- Ubah tipe mutation dari `'paid' | 'verified' | 'failed'` menjadi `'paid' | 'failed'`
- Hapus semua referensi ke `'verified'` -- gunakan `'paid'` saja
- Pada baris 79: `status: 'paid' | 'failed'`
- Pada baris 94: Hapus kondisi `|| status === 'verified'`

**File: `src/integrations/supabase/types.ts`** -- TIDAK BOLEH DIEDIT (auto-generated), tapi types.ts saat ini salah karena berisi `'verified'`. Ini akan tersinkron ulang saat migrasi berikutnya dijalankan.

### Langkah 2: Fix Edge Function `send-whatsapp-notification/index.ts`

- Semua akses `booking.customer.phone` dan `booking.customer.full_name` diganti dengan `booking.customer?.[0]?.phone` dan `booking.customer?.[0]?.full_name` (karena Supabase join mengembalikan array)
- Baris 249: Cast `error` ke `(error as Error).message`

### Langkah 3: Fix Edge Function `send-payment-reminder/index.ts`

- Query `whatsapp_config` dan insert `whatsapp_logs`: tambah type casting karena tabel ini mungkin tidak ada di generated types
- Cast `supabase` parameter dengan `as any` pada pemanggilan `sendWhatsApp`

### Langkah 4: Sinkronkan types.ts

- Buat migrasi kosong/dummy untuk trigger regenerasi types.ts, menghapus `'verified'` dari enum karena memang tidak ada di database

---

## Detail Teknis

### AdminPayments.tsx - Perubahan

```typescript
// SEBELUM (baris 79):
status: 'paid' | 'verified' | 'failed'

// SESUDAH:
status: 'paid' | 'failed'

// SEBELUM (baris 94):
if ((status === 'paid' || status === 'verified') && payment) {

// SESUDAH:
if (status === 'paid' && payment) {
```

### send-whatsapp-notification - Perubahan Pattern

```typescript
// SEBELUM:
booking.customer.phone
booking.customer.full_name

// SESUDAH:
const customer = Array.isArray(booking.customer) 
  ? booking.customer[0] 
  : booking.customer;
customer?.phone
customer?.full_name
```

### send-payment-reminder - Perubahan Pattern

```typescript
// Cast untuk whatsapp_config
const { data: config } = await supabase
  .from("whatsapp_config")
  .select("*")
  .single() as { data: any; error: any };

// Cast untuk whatsapp_logs  
await (supabase.from("whatsapp_logs") as any).insert({...});
```

---

## Estimasi

| Langkah | File | Kompleksitas |
|---------|------|-------------|
| 1 - Payment Status | AdminPayments.tsx | Ringan |
| 2 - WhatsApp Notification | send-whatsapp-notification/index.ts | Sedang |
| 3 - Payment Reminder | send-payment-reminder/index.ts | Sedang |
| 4 - Types sync | Migration dummy | Ringan |

Total: 4 file diubah, 0 file baru, semua 26 build errors akan teratasi.
