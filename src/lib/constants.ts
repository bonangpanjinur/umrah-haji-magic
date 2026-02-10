// === Status Labels ===
export const BOOKING_STATUS_LABELS: Record<string, string> = {
  pending: 'Menunggu',
  confirmed: 'Dikonfirmasi',
  cancelled: 'Dibatalkan',
  completed: 'Selesai',
  waiting_payment: 'Menunggu Pembayaran',
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  unpaid: 'Belum Bayar',
  partial: 'Sebagian',
  paid: 'Lunas',
  refunded: 'Dikembalikan',
};

export const DOCUMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Menunggu',
  verified: 'Terverifikasi',
  rejected: 'Ditolak',
};

export const LEAD_STATUS_LABELS: Record<string, string> = {
  new: 'Baru',
  contacted: 'Dihubungi',
  qualified: 'Qualified',
  proposal: 'Proposal',
  negotiation: 'Negosiasi',
  won: 'Menang',
  lost: 'Kalah',
};

// === Room Types ===
export const ROOM_TYPE_LABELS: Record<string, string> = {
  quad: 'Quad (4 orang)',
  triple: 'Triple (3 orang)',
  double: 'Double (2 orang)',
  single: 'Single (1 orang)',
};

// === Role Labels ===
export const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  owner: 'Owner',
  branch_manager: 'Branch Manager',
  finance: 'Finance',
  sales: 'Sales',
  operational: 'Operasional',
  marketing: 'Marketing',
  agent: 'Agen',
  customer: 'Customer',
  jamaah: 'Jamaah',
  equipment: 'Equipment',
};

// === Gender ===
export const GENDER_LABELS: Record<string, string> = {
  male: 'Laki-laki',
  female: 'Perempuan',
};

// === Pagination ===
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
