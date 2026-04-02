

# Analisis Bug & Rencana Hak Akses Komprehensif

## BAGIAN A: BUG YANG DITEMUKAN

### BUG KRITIS 1: `role_permissions` Tabel Tidak Pernah Dipakai (Dead Feature)

Tabel `role_permissions` berisi 14 permission keys dan 8 roles -- admin bisa toggle checkbox di `/admin/permissions`. **Tapi data ini tidak pernah dibaca oleh aplikasi.** Sidebar (`AdminLayout.tsx`) menggunakan hardcoded `allowedRoles` per group. `ProtectedRoute.tsx` hanya cek `allowedRoles` prop statis. Artinya: admin mengubah permission di UI, tapi **tidak ada efek sama sekali**.

### BUG KRITIS 2: Tidak Ada Proteksi Route Per-Halaman

Semua route `/admin/*` dilindungi oleh `ADMIN_ROLES` yang sama (8 roles). Artinya user `sales` bisa langsung akses `/admin/finance`, `/admin/users`, `/admin/permissions`, `/admin/security` -- cukup ketik URL. Sidebar hanya menyembunyikan menu, bukan memblokir akses.

### BUG KRITIS 3: Permission Keys Tidak Lengkap

Database hanya punya 14 permission keys, tapi sidebar punya 40+ menu items yang dikelompokkan ke 10 groups. Banyak modul tidak punya permission key:
- **Keuangan**: `finance_pl`, `finance_cash`, `finance_ar`, `finance_ap`, `payroll` -- tidak ada
- **HR**: `hr_employees`, `hr_attendance`, `hr_schedules` -- tidak ada
- **Operasional detail**: `equipment`, `room_assignments`, `visa`, `manasik`, `haji` -- tidak ada
- **Konten**: `appearance`, `static_pages`, `testimonials`, `marketing_materials` -- tidak ada
- **Sistem**: `security_audit`, `2fa`, `whatsapp`, `coupons`, `loyalty`, `referrals`, `savings` -- tidak ada

### BUG 4: `isAdmin()` Terlalu Luas

Fungsi `isAdmin()` di `useAuth.tsx` return `true` untuk semua 8 staff roles termasuk `equipment`. Ini dipakai di `ProtectedRoute.tsx` untuk bypass role check (line 43-46). Akibatnya, jika `allowedRoles` berisi `super_admin`, user `equipment` tetap lolos karena `isAdmin()` = true.

---

## BAGIAN B: RENCANA PERBAIKAN HAK AKSES KOMPREHENSIF

### Arsitektur Baru

```text
┌─────────────────────────────────────────────────┐
│           role_permissions (Database)            │
│  role × permission_key × is_enabled             │
└──────────────────────┬──────────────────────────┘
                       │
          ┌────────────▼────────────┐
          │   usePermissions() hook  │
          │  - fetch on login       │
          │  - cache di AuthContext  │
          │  - hasPermission(key)   │
          └────────────┬────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
   Sidebar         ProtectedRoute   Component
   (filter menu)   (block URL)      (hide buttons)
```

### Langkah 1: Perluas Permission Keys di Database

Tambah permission keys baru via migration `INSERT ... ON CONFLICT DO NOTHING`:

| Kategori | Permission Keys Baru |
|:---|:---|
| Keuangan | `finance_pl`, `finance_cash`, `finance_ar`, `finance_ap` |
| HR | `hr`, `payroll` |
| Operasional | `equipment`, `room_assignments`, `visa`, `manasik`, `haji`, `itinerary_templates` |
| Tabungan & Loyalty | `savings`, `loyalty`, `referrals`, `coupons` |
| Konten | `appearance`, `static_pages`, `testimonials`, `marketing_materials`, `offline_content` |
| Komunikasi | `whatsapp`, `support_tickets` |
| Sistem | `security_audit`, `2fa`, `branches`, `document_verification`, `document_generator` |

Default values per role sesuai ROLE_ACCESS_MATRIX.md (contoh: `finance` enabled untuk `finance_pl`, `finance_cash`, `finance_ar`, `finance_ap`, `payments`; disabled untuk `hr`, `appearance`, dll).

**File**: Migration SQL

### Langkah 2: Buat `usePermissions()` Hook + Integrasi ke AuthContext

- Fetch `role_permissions` saat login (di `fetchUserData`)
- Cache di AuthContext sebagai `permissions: Record<string, boolean>`
- Expose `hasPermission(key: string): boolean` -- return true jika super_admin/owner, atau jika `role_permissions` untuk user's role + key = enabled
- Super Admin & Owner selalu return true (bypass)

**File**: `useAuth.tsx`

### Langkah 3: Sidebar Dinamis Berdasarkan Permission

Ganti hardcoded `allowedRoles` di `NAV_GROUPS` dengan `permissionKey` per item. Contoh:

```typescript
{ label: 'Piutang Jamaah', icon: FileText, path: '/admin/finance/ar', permissionKey: 'finance_ar' },
```

Sidebar filter: `hasPermission(item.permissionKey)` bukan lagi `roles.includes(...)`.

**File**: `AdminLayout.tsx`

### Langkah 4: ProtectedRoute Enforces Permission

Tambah prop `permissionKey` opsional di `ProtectedRoute`. Jika ada, cek `hasPermission(key)` selain role check. Untuk route-level protection, bungkus setiap admin sub-route:

```typescript
<Route path="finance" element={
  <ProtectedRoute permissionKey="finance_pl">
    <AdminFinancePL />
  </ProtectedRoute>
} />
```

**File**: `ProtectedRoute.tsx`, `AdminRoutes.tsx`

### Langkah 5: Fix `isAdmin()` Logic

Ubah `isAdmin()` agar hanya return true untuk `super_admin`, `owner`, `branch_manager` -- sesuai definisi admin sebenarnya. Bukan semua 8 roles.

**File**: `useAuth.tsx`

### Langkah 6: Update Permission Matrix UI

Perluas `PERMISSION_LABELS` di `AdminRolePermissions.tsx` agar mencakup semua 40+ permission keys baru. Kelompokkan dalam tabs/sections agar tidak overwhelming.

**File**: `AdminRolePermissions.tsx`

---

## Matriks Hak Akses Detail (Default Values)

```text
Permission Key          │ BranchMgr │ Finance │ Sales │ Marketing │ Operational │ Equipment
────────────────────────┼───────────┼─────────┼───────┼───────────┼─────────────┼──────────
dashboard               │     ✅    │    ✅   │  ✅   │    ✅     │     ✅      │    ✅
analytics               │     ✅    │    ❌   │  ❌   │    ✅     │     ❌      │    ❌
packages                │     ✅    │    ❌   │  ✅   │    ✅     │     ✅      │    ❌
departures              │     ✅    │    ❌   │  ✅   │    ✅     │     ✅      │    ✅
bookings                │     ✅    │    ✅   │  ✅   │    ❌     │     ✅      │    ✅
payments                │     ✅    │    ✅   │  ❌   │    ❌     │     ❌      │    ❌
finance_pl              │     ✅    │    ✅   │  ❌   │    ❌     │     ❌      │    ❌
finance_cash            │     ✅    │    ✅   │  ❌   │    ❌     │     ❌      │    ❌
finance_ar              │     ✅    │    ✅   │  ❌   │    ❌     │     ❌      │    ❌
finance_ap              │     ✅    │    ✅   │  ❌   │    ❌     │     ❌      │    ❌
customers               │     ✅    │    ✅   │  ✅   │    ❌     │     ✅      │    ❌
leads                   │     ✅    │    ❌   │  ✅   │    ✅     │     ❌      │    ❌
agents                  │     ✅    │    ✅   │  ❌   │    ❌     │     ❌      │    ❌
branches                │     ✅    │    ❌   │  ❌   │    ❌     │     ❌      │    ❌
savings                 │     ✅    │    ✅   │  ✅   │    ❌     │     ❌      │    ❌
loyalty                 │     ✅    │    ❌   │  ✅   │    ✅     │     ❌      │    ❌
referrals               │     ✅    │    ❌   │  ✅   │    ✅     │     ❌      │    ❌
coupons                 │     ✅    │    ❌   │  ✅   │    ✅     │     ❌      │    ❌
haji                    │     ✅    │    ❌   │  ✅   │    ❌     │     ✅      │    ❌
manasik                 │     ✅    │    ❌   │  ✅   │    ❌     │     ✅      │    ❌
visa                    │     ✅    │    ❌   │  ❌   │    ❌     │     ✅      │    ❌
room_assignments        │     ✅    │    ❌   │  ❌   │    ❌     │     ✅      │    ❌
equipment               │     ✅    │    ❌   │  ❌   │    ❌     │     ✅      │    ✅
itinerary_templates     │     ✅    │    ❌   │  ❌   │    ❌     │     ✅      │    ❌
hr                      │     ✅    │    ❌   │  ❌   │    ❌     │     ❌      │    ❌
payroll                 │     ✅    │    ✅   │  ❌   │    ❌     │     ❌      │    ❌
document_verification   │     ✅    │    ❌   │  ❌   │    ❌     │     ✅      │    ❌
document_generator      │     ✅    │    ❌   │  ❌   │    ❌     │     ✅      │    ❌
offline_content         │     ✅    │    ❌   │  ❌   │    ❌     │     ✅      │    ❌
support_tickets         │     ✅    │    ❌   │  ✅   │    ❌     │     ✅      │    ❌
whatsapp                │     ✅    │    ❌   │  ✅   │    ✅     │     ❌      │    ❌
marketing_materials     │     ✅    │    ❌   │  ❌   │    ✅     │     ❌      │    ❌
master_data             │     ✅    │    ❌   │  ❌   │    ❌     │     ✅      │    ❌
appearance              │     ✅    │    ❌   │  ❌   │    ✅     │     ❌      │    ❌
static_pages            │     ✅    │    ❌   │  ❌   │    ✅     │     ❌      │    ❌
testimonials            │     ✅    │    ❌   │  ❌   │    ✅     │     ❌      │    ❌
users                   │     ✅    │    ❌   │  ❌   │    ❌     │     ❌      │    ❌
settings                │     ✅    │    ❌   │  ❌   │    ❌     │     ❌      │    ❌
security_audit          │     ❌    │    ❌   │  ❌   │    ❌     │     ❌      │    ❌
2fa                     │     ❌    │    ❌   │  ❌   │    ❌     │     ❌      │    ❌
reports                 │     ✅    │    ✅   │  ❌   │    ✅     │     ✅      │    ❌
```

*Super Admin & Owner: selalu full access, tidak perlu di-manage via tabel.*

---

## Ringkasan File yang Dimodifikasi

| File | Perubahan |
|:---|:---|
| Migration SQL | Insert 30+ permission keys baru dengan default values per role |
| `useAuth.tsx` | Tambah `permissions` state, `hasPermission()`, fix `isAdmin()` |
| `AdminLayout.tsx` | Ganti hardcoded `allowedRoles` → `permissionKey` per item, filter via `hasPermission()` |
| `ProtectedRoute.tsx` | Tambah prop `permissionKey`, enforce permission check |
| `AdminRoutes.tsx` | Bungkus setiap sub-route dengan `permissionKey` |
| `AdminRolePermissions.tsx` | Perluas `PERMISSION_LABELS` untuk 40+ keys, grouping UI |

## Prioritas

| # | Prioritas | Item |
|:--|:----------|:-----|
| 1 | **KRITIS** | Fix `isAdmin()` (terlalu luas, bypass semua) |
| 2 | **KRITIS** | Route-level protection per halaman admin |
| 3 | **KRITIS** | Integrasikan `role_permissions` ke sidebar + routing (dead feature) |
| 4 | **TINGGI** | Perluas permission keys (14 → 40+) |
| 5 | **TINGGI** | `usePermissions` hook + AuthContext integration |
| 6 | **SEDANG** | Update Permission Matrix UI (grouping, labels lengkap) |

