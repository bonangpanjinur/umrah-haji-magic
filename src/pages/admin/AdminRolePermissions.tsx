import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Shield, Save, Users } from "lucide-react";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface Permission {
  id: string;
  role: AppRole;
  permission_key: string;
  is_enabled: boolean;
}

const PERMISSION_GROUPS: Record<string, { label: string; keys: Record<string, { label: string; description: string }> }> = {
  overview: {
    label: 'Overview',
    keys: {
      dashboard: { label: "Dashboard", description: "Akses halaman dashboard utama" },
      analytics: { label: "Analytics", description: "Lihat analitik dan statistik" },
    }
  },
  sales_crm: {
    label: 'Sales & CRM',
    keys: {
      leads: { label: "CRM Leads", description: "Kelola calon jamaah" },
      coupons: { label: "Kupon", description: "Kelola kupon diskon" },
    }
  },
  products_ops: {
    label: 'Produk & Operasional',
    keys: {
      packages: { label: "Paket", description: "Kelola paket umroh/haji" },
      departures: { label: "Keberangkatan", description: "Kelola jadwal keberangkatan" },
      bookings: { label: "Booking", description: "Kelola booking jamaah" },
      equipment: { label: "Perlengkapan", description: "Kelola perlengkapan jamaah" },
      itinerary_templates: { label: "Template Itinerary", description: "Kelola template itinerary" },
      savings: { label: "Tabungan", description: "Kelola tabungan umroh" },
      room_assignments: { label: "Kamar", description: "Kelola alokasi kamar" },
      operational: { label: "Modul Operasional", description: "Akses modul operasional (manifest, checkin, luggage, dll)" },
    }
  },
  finance: {
    label: 'Keuangan & Akuntansi',
    keys: {
      payments: { label: "Pembayaran", description: "Kelola verifikasi pembayaran" },
      finance_cash: { label: "Kas & Bank", description: "Kelola kas dan bank" },
      finance_ar: { label: "Piutang Jamaah", description: "Kelola piutang jamaah" },
      finance_ap: { label: "Hutang Vendor", description: "Kelola hutang vendor" },
      finance_pl: { label: "Laba Rugi", description: "Lihat laporan laba rugi" },
    }
  },
  jamaah_agent: {
    label: 'Jamaah & Agent',
    keys: {
      customers: { label: "Jamaah", description: "Lihat dan kelola data jamaah" },
      agents: { label: "Agen", description: "Kelola agen dan komisi" },
      branches: { label: "Cabang", description: "Kelola cabang" },
      loyalty: { label: "Loyalty", description: "Kelola program loyalty" },
      referrals: { label: "Referral", description: "Kelola program referral" },
      haji: { label: "Haji", description: "Kelola pendaftaran haji" },
      manasik: { label: "Manasik", description: "Kelola jadwal manasik" },
      visa: { label: "Visa", description: "Kelola proses visa" },
    }
  },
  hr: {
    label: 'SDM (HR)',
    keys: {
      hr: { label: "Data Karyawan", description: "Kelola data karyawan, absensi, departemen" },
      payroll: { label: "Penggajian", description: "Kelola payroll dan slip gaji" },
    }
  },
  communication: {
    label: 'Support & Komunikasi',
    keys: {
      support_tickets: { label: "Tiket Support", description: "Kelola tiket support" },
      whatsapp: { label: "WhatsApp", description: "Kelola notifikasi WhatsApp" },
      marketing_materials: { label: "Materi Promosi", description: "Kelola materi promosi" },
    }
  },
  master_data: {
    label: 'Master Data',
    keys: {
      master_data: { label: "Master Data", description: "Kelola hotel, maskapai, bandara, muthawif, dll" },
    }
  },
  documents: {
    label: 'Dokumen & Surat',
    keys: {
      document_verification: { label: "Verifikasi Dokumen", description: "Verifikasi dokumen jamaah" },
      document_generator: { label: "Generate Surat", description: "Generate surat dan dokumen" },
      offline_content: { label: "Konten Offline", description: "Kelola konten offline jamaah" },
    }
  },
  reports: {
    label: 'Laporan',
    keys: {
      reports: { label: "Laporan", description: "Akses semua jenis laporan" },
    }
  },
  system: {
    label: 'Pengaturan',
    keys: {
      users: { label: "Users & Hak Akses", description: "Kelola pengguna dan hak akses" },
      settings: { label: "Pengaturan", description: "Pengaturan sistem" },
      appearance: { label: "Tampilan", description: "Kelola tampilan website" },
      static_pages: { label: "Halaman Statis", description: "Kelola halaman statis" },
      testimonials: { label: "Testimoni", description: "Kelola testimoni" },
      security_audit: { label: "Security Audit", description: "Akses audit keamanan" },
      '2fa': { label: "2FA Settings", description: "Pengaturan Two-Factor Auth" },
    }
  },
};

const ROLE_LABELS: Record<AppRole, { label: string; color: string }> = {
  super_admin: { label: "Super Admin", color: "bg-red-500" },
  owner: { label: "Owner", color: "bg-purple-500" },
  branch_manager: { label: "Branch Manager", color: "bg-blue-500" },
  finance: { label: "Finance", color: "bg-green-500" },
  operational: { label: "Operational", color: "bg-orange-500" },
  sales: { label: "Sales", color: "bg-cyan-500" },
  marketing: { label: "Marketing", color: "bg-pink-500" },
  equipment: { label: "Equipment", color: "bg-yellow-500" },
  agent: { label: "Agent", color: "bg-indigo-500" },
  customer: { label: "Customer", color: "bg-gray-500" },
};

const CONFIGURABLE_ROLES: AppRole[] = [
  "branch_manager",
  "finance", 
  "operational",
  "sales",
  "marketing",
  "equipment",
];

export default function AdminRolePermissions() {
  const queryClient = useQueryClient();
  const [pendingChanges, setPendingChanges] = useState<Record<string, boolean>>({});

  const { data: permissions, isLoading } = useQuery({
    queryKey: ["role-permissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("role_permissions")
        .select("*")
        .order("role")
        .order("permission_key");
      
      if (error) throw error;
      return data as Permission[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (changes: Record<string, boolean>) => {
      const updates = Object.entries(changes).map(([id, is_enabled]) => ({
        id,
        is_enabled,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from("role_permissions")
          .update({ is_enabled: update.is_enabled })
          .eq("id", update.id);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Hak akses berhasil disimpan");
      setPendingChanges({});
      queryClient.invalidateQueries({ queryKey: ["role-permissions"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal menyimpan perubahan");
    },
  });

  const handleToggle = (permissionId: string, currentValue: boolean) => {
    setPendingChanges((prev) => ({
      ...prev,
      [permissionId]: !currentValue,
    }));
  };

  const handleSave = () => {
    if (Object.keys(pendingChanges).length === 0) {
      toast.info("Tidak ada perubahan");
      return;
    }
    saveMutation.mutate(pendingChanges);
  };

  const permissionsByRole = permissions?.reduce((acc, perm) => {
    if (!acc[perm.role]) acc[perm.role] = [];
    acc[perm.role].push(perm);
    return acc;
  }, {} as Record<AppRole, Permission[]>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const groupEntries = Object.entries(PERMISSION_GROUPS);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Pengaturan Hak Akses
          </h1>
          <p className="text-muted-foreground">
            Konfigurasi menu dan fitur yang dapat diakses setiap role. Super Admin & Owner selalu full access.
          </p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={Object.keys(pendingChanges).length === 0 || saveMutation.isPending}
        >
          {saveMutation.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Simpan
          {Object.keys(pendingChanges).length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {Object.keys(pendingChanges).length}
            </Badge>
          )}
        </Button>
      </div>

      <Tabs defaultValue={groupEntries[0]?.[0]} className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1">
          {groupEntries.map(([key, group]) => (
            <TabsTrigger key={key} value={key} className="text-xs">
              {group.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {groupEntries.map(([groupKey, group]) => (
          <TabsContent key={groupKey} value={groupKey}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {group.label}
                </CardTitle>
                <CardDescription>
                  Centang untuk mengaktifkan akses menu pada kategori ini.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 font-medium sticky left-0 bg-background z-10">
                          Menu / Fitur
                        </th>
                        {CONFIGURABLE_ROLES.map((role) => (
                          <th key={role} className="text-center py-3 px-2 min-w-[100px]">
                            <Badge 
                              variant="outline" 
                              className={`${ROLE_LABELS[role].color} text-white border-0`}
                            >
                              {ROLE_LABELS[role].label}
                            </Badge>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(group.keys).map(([key, meta]) => (
                        <tr key={key} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-2 sticky left-0 bg-background">
                            <div>
                              <p className="font-medium">{meta.label}</p>
                              <p className="text-xs text-muted-foreground">{meta.description}</p>
                            </div>
                          </td>
                          {CONFIGURABLE_ROLES.map((role) => {
                            const perm = permissionsByRole?.[role]?.find(
                              (p) => p.permission_key === key
                            );
                            if (!perm) return <td key={role} className="text-center py-3 px-2 text-muted-foreground">-</td>;

                            const isChecked = perm.id in pendingChanges 
                              ? pendingChanges[perm.id] 
                              : perm.is_enabled;
                            const hasChange = perm.id in pendingChanges;

                            return (
                              <td key={role} className="text-center py-3 px-2">
                                <div className="flex justify-center">
                                  <Checkbox
                                    checked={isChecked}
                                    onCheckedChange={() => handleToggle(perm.id, isChecked)}
                                    className={hasChange ? "ring-2 ring-primary ring-offset-2" : ""}
                                  />
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Keterangan Role</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(ROLE_LABELS).map(([role, { label, color }]) => (
              <div key={role} className="flex items-center gap-2 text-sm">
                <div className={`w-3 h-3 rounded-full ${color}`} />
                <span className="font-medium">{label}</span>
                {(role === "super_admin" || role === "owner") && (
                  <Badge variant="outline" className="text-xs">Full Access</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
