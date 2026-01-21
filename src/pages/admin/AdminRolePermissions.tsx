import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

const PERMISSION_LABELS: Record<string, { label: string; description: string }> = {
  dashboard: { label: "Dashboard", description: "Akses halaman dashboard utama" },
  analytics: { label: "Analytics", description: "Lihat analitik dan statistik" },
  packages: { label: "Paket", description: "Kelola paket umroh/haji" },
  departures: { label: "Keberangkatan", description: "Kelola jadwal keberangkatan" },
  bookings: { label: "Booking", description: "Kelola booking jamaah" },
  payments: { label: "Pembayaran", description: "Kelola verifikasi pembayaran" },
  customers: { label: "Jamaah", description: "Lihat data jamaah" },
  leads: { label: "Leads", description: "Kelola calon jamaah" },
  master_data: { label: "Master Data", description: "Kelola hotel, maskapai, dll" },
  users: { label: "Users", description: "Kelola pengguna & role" },
  agents: { label: "Agen", description: "Kelola agen & komisi" },
  reports: { label: "Laporan", description: "Akses laporan & export" },
  settings: { label: "Pengaturan", description: "Pengaturan sistem" },
  operational: { label: "Operasional", description: "Akses modul operasional" },
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

  // Group permissions by role
  const permissionsByRole = permissions?.reduce((acc, perm) => {
    if (!acc[perm.role]) acc[perm.role] = [];
    acc[perm.role].push(perm);
    return acc;
  }, {} as Record<AppRole, Permission[]>);

  const permissionKeys = Object.keys(PERMISSION_LABELS);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Pengaturan Hak Akses
          </h1>
          <p className="text-muted-foreground">
            Konfigurasi menu dan fitur yang dapat diakses setiap role
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
          Simpan Perubahan
          {Object.keys(pendingChanges).length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {Object.keys(pendingChanges).length}
            </Badge>
          )}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Matrix Hak Akses
          </CardTitle>
          <CardDescription>
            Super Admin dan Owner memiliki akses penuh. Centang untuk mengaktifkan akses menu.
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
                {permissionKeys.map((key) => (
                  <tr key={key} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-2 sticky left-0 bg-background">
                      <div>
                        <p className="font-medium">{PERMISSION_LABELS[key].label}</p>
                        <p className="text-xs text-muted-foreground">
                          {PERMISSION_LABELS[key].description}
                        </p>
                      </div>
                    </td>
                    {CONFIGURABLE_ROLES.map((role) => {
                      const perm = permissionsByRole?.[role]?.find(
                        (p) => p.permission_key === key
                      );
                      if (!perm) return <td key={role} className="text-center py-3 px-2">-</td>;

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
