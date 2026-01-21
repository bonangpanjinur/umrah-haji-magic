import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CouponForm } from "@/components/admin/forms/CouponForm";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Edit, Trash2, Ticket } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/format";
import { format } from "date-fns";

export default function AdminCoupons() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: coupons, isLoading } = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: async () => {
      const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("coupons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Kupon berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
    },
  });

  const filtered = coupons?.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDiscount = (coupon: any) => {
    if (coupon.discount_type === "percentage") {
      return `${coupon.discount_value}%`;
    }
    return formatCurrency(coupon.discount_value);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari kupon..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Button onClick={() => { setEditingCoupon(null); setIsFormOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />Tambah Kupon
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kode</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Diskon</TableHead>
              <TableHead>Penggunaan</TableHead>
              <TableHead>Berlaku</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered?.map(coupon => (
              <TableRow key={coupon.id}>
                <TableCell>
                  <code className="px-2 py-1 bg-muted rounded text-sm font-bold">{coupon.code}</code>
                </TableCell>
                <TableCell>{coupon.name}</TableCell>
                <TableCell className="font-semibold text-primary">{formatDiscount(coupon)}</TableCell>
                <TableCell>
                  {coupon.used_count || 0}
                  {coupon.usage_limit ? ` / ${coupon.usage_limit}` : ""}
                </TableCell>
                <TableCell className="text-sm">
                  {coupon.valid_from && coupon.valid_until ? (
                    <span>
                      {format(new Date(coupon.valid_from), "dd/MM/yy")} - {format(new Date(coupon.valid_until), "dd/MM/yy")}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Tidak terbatas</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={coupon.is_active ? "default" : "secondary"}>
                    {coupon.is_active ? "Aktif" : "Nonaktif"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => { setEditingCoupon(coupon); setIsFormOpen(true); }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(coupon.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!filtered?.length && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? "Tidak ada hasil" : "Belum ada kupon"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCoupon ? "Edit" : "Tambah"} Kupon</DialogTitle>
          </DialogHeader>
          <CouponForm couponData={editingCoupon} onSuccess={() => setIsFormOpen(false)} onCancel={() => setIsFormOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
