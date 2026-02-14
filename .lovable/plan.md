

# Perbaikan Error "invalid input value for enum payment_status: verified"

## Akar Masalah

Error ini disebabkan oleh **database trigger**, bukan kode frontend.

Trigger `award_loyalty_points_on_payment` yang terpasang di tabel `payments` mengandung literal `'verified'` dalam logikanya. Setiap kali ada INSERT atau UPDATE di tabel `payments`, trigger ini otomatis dijalankan dan PostgreSQL gagal karena `'verified'` bukan nilai valid di enum `payment_status`.

Alur error:
1. Customer submit bukti pembayaran dengan status `'pending'` (kode frontend sudah benar)
2. PostgreSQL otomatis menjalankan trigger `tr_award_loyalty_points`
3. Trigger mencoba membandingkan `NEW.status = 'verified'` -- nilai `'verified'` tidak ada di enum
4. PostgreSQL menolak seluruh operasi INSERT, muncul error

Enum `payment_status` di database hanya berisi: `pending`, `partial`, `paid`, `refunded`, `failed`.

## Rencana Perbaikan

### Langkah 1: Perbaiki Database Trigger (Prioritas Utama)

Buat migrasi SQL untuk mengganti fungsi `award_loyalty_points_on_payment`:
- Ganti `'verified'` menjadi `'paid'` di semua referensi
- Ini langsung menyelesaikan error upload pembayaran

```sql
CREATE OR REPLACE FUNCTION award_loyalty_points_on_payment()
RETURNS TRIGGER AS $$
...
  IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') THEN
...
END;
$$ LANGUAGE plpgsql;
```

### Langkah 2: Bersihkan Referensi 'verified' di AdminPayments.tsx

Baris 507 masih ada kondisi `selectedPayment?.status === 'verified'` yang perlu dihapus karena status tersebut tidak pernah ada di database.

### Estimasi

| Langkah | Target | Kompleksitas |
|---------|--------|-------------|
| 1 | Database trigger function | Ringan (1 migrasi SQL) |
| 2 | AdminPayments.tsx baris 507 | Ringan (hapus kondisi) |

Total: 1 migrasi database + 1 file diubah. Error upload pembayaran akan langsung teratasi.

