# Role Access Matrix - Sistem Manajemen Umrah & Haji

## Daftar Role dan Akses

### 🔐 SUPER ADMIN
**Akses**: Semua modul tanpa batasan
- Full access ke semua cabang
- Manage users & permissions
- System settings & appearance
- Semua data keuangan

### 👔 OWNER
**Akses**: Hampir semua modul
- Multi-cabang overview
- Laporan keuangan & P&L
- Manage branch managers
- Pengaturan sistem

### 🏢 BRANCH MANAGER
**Akses**: Data cabang sendiri
- Dashboard cabang
- Booking & payment (cabang)
- Jamaah & dokumen (cabang)
- Laporan cabang
- Assign staff ke tugas

### 💰 FINANCE
**Akses**: Modul keuangan
- ✅ Pembayaran & verifikasi
- ✅ Laba/Rugi (P&L)
- ✅ Vendor & Account Payable
- ✅ Agent commissions
- ❌ Tidak bisa edit paket/keberangkatan

### 📊 SALES
**Akses**: CRM & penjualan
- ✅ CRM Leads
- ✅ Booking (create/view)
- ✅ Jamaah (view/add)
- ❌ Tidak bisa verifikasi payment
- ❌ Tidak akses keuangan

### 📢 MARKETING
**Akses**: Konten & leads
- ✅ CRM Leads
- ✅ Analytics & reports
- ✅ Appearance/tampilan website
- ❌ Tidak bisa proses booking
- ❌ Tidak akses keuangan

### 🔧 OPERATIONAL
**Akses**: Operasional lapangan
- ✅ Manifest keberangkatan
- ✅ Rooming list management
- ✅ QR Code jamaah
- ✅ Check-in & attendance
- ✅ Luggage tracking
- ❌ Tidak akses keuangan

### 📦 EQUIPMENT
**Akses**: Perlengkapan
- ✅ Distribusi perlengkapan
- ✅ Stock management
- ✅ Luggage tracking
- ❌ Tidak akses data jamaah lengkap

---

## 🤝 AGENT (External Partner)

**Portal Khusus**: `/agent/*`

| Fitur | Akses |
|-------|-------|
| Dashboard komisi | ✅ |
| Daftarkan jamaah | ✅ |
| Data jamaah sendiri | ✅ |
| Dompet digital | ✅ |
| Request withdrawal | ✅ |
| Lihat paket tersedia | ✅ |
| Jamaah agen lain | ❌ |
| Akses admin panel | ❌ |

**Batasan Data**:
- Hanya lihat jamaah yang didaftarkan sendiri
- Hanya lihat komisi dari booking sendiri
- Tidak bisa edit data setelah booking confirmed

---

## 👤 CUSTOMER (Jamaah)

**Portal**: Website publik + customer area

| Fitur | Akses |
|-------|-------|
| Lihat paket | ✅ |
| Booking mandiri | ✅ |
| My bookings | ✅ |
| Upload pembayaran | ✅ |
| My savings (tabungan) | ✅ |
| Loyalty points | ✅ |
| Submit tiket support | ✅ |
| Data jamaah lain | ❌ |

---

## 🏬 Multi-Cabang Logic

### Data Isolation per Cabang
```
branch_manager: Hanya lihat data di cabang_id sendiri
sales: Hanya lihat leads/booking di cabang_id sendiri  
agent: Terikat ke cabang_id, hanya lihat data sendiri
jamaah: Data terpisah per cabang
```

### Cross-Branch Access (Owner/Super Admin Only)
- Bisa switch antar cabang
- Bisa lihat consolidated report
- Bisa manage semua branch managers

---

## Route Protection Summary

| Route | Allowed Roles |
|-------|---------------|
| `/admin/*` | super_admin, owner, branch_manager, finance, sales, marketing |
| `/admin/finance` | super_admin, owner, finance |
| `/admin/vendors` | super_admin, owner, finance |
| `/admin/users` | super_admin, owner |
| `/admin/permissions` | super_admin, owner |
| `/admin/branches` | super_admin, owner, branch_manager |
| `/operational/*` | super_admin, owner, branch_manager, operational, equipment |
| `/agent/*` | super_admin, owner, agent |
| `/customer/*` | Any authenticated user |

---

## RLS (Row Level Security) Rules

Semua tabel penting menggunakan RLS:

1. **bookings**: Filter by branch_id atau agent_id
2. **customers**: Filter by branch_id atau user_id
3. **agent_wallets**: Hanya agent sendiri
4. **loyalty_points**: Hanya customer sendiri
5. **support_tickets**: User sendiri + staff assigned
6. **vendor_costs**: Finance + Admin only
