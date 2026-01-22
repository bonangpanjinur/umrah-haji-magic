import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Pencil } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Customer = Database["public"]["Tables"]["customers"]["Row"];
type GenderType = Database["public"]["Enums"]["gender_type"];

interface EditCustomerDialogProps {
  customer: Customer;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function EditCustomerDialog({ customer, trigger, onSuccess }: EditCustomerDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    // Data Diri
    full_name: "",
    nik: "",
    gender: "" as GenderType | "",
    birth_place: "",
    birth_date: "",
    blood_type: "",
    marital_status: "",
    // Kontak
    phone: "",
    email: "",
    // Alamat
    address: "",
    city: "",
    province: "",
    postal_code: "",
    // Paspor
    passport_number: "",
    passport_expiry: "",
    // Keluarga
    father_name: "",
    mother_name: "",
    mahram_name: "",
    mahram_relation: "",
    // Kontak Darurat
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relation: "",
  });

  // Populate form when customer changes
  useEffect(() => {
    if (customer && open) {
      setFormData({
        full_name: customer.full_name || "",
        nik: customer.nik || "",
        gender: (customer.gender as GenderType) || "",
        birth_place: customer.birth_place || "",
        birth_date: customer.birth_date || "",
        blood_type: customer.blood_type || "",
        marital_status: customer.marital_status || "",
        phone: customer.phone || "",
        email: customer.email || "",
        address: customer.address || "",
        city: customer.city || "",
        province: customer.province || "",
        postal_code: customer.postal_code || "",
        passport_number: customer.passport_number || "",
        passport_expiry: customer.passport_expiry || "",
        father_name: customer.father_name || "",
        mother_name: customer.mother_name || "",
        mahram_name: customer.mahram_name || "",
        mahram_relation: customer.mahram_relation || "",
        emergency_contact_name: customer.emergency_contact_name || "",
        emergency_contact_phone: customer.emergency_contact_phone || "",
        emergency_contact_relation: customer.emergency_contact_relation || "",
      });
    }
  }, [customer, open]);

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const updatePayload: any = { ...data };
      
      // Clean up empty strings for optional fields
      Object.keys(updatePayload).forEach(key => {
        if (updatePayload[key] === "") {
          updatePayload[key] = null;
        }
      });

      // Ensure full_name is not null
      if (!updatePayload.full_name) {
        throw new Error("Nama lengkap wajib diisi");
      }

      const { error } = await supabase
        .from("customers")
        .update(updatePayload)
        .eq("id", customer.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Data jamaah berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: ["admin-customer"] });
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
      queryClient.invalidateQueries({ queryKey: ["booking-passengers"] });
      queryClient.invalidateQueries({ queryKey: ["agent-jamaah"] });
      setOpen(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal memperbarui data jamaah");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Data Jamaah</DialogTitle>
          <DialogDescription>
            Perbarui informasi jamaah. Pastikan data yang diisi sudah benar.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">Data Diri</TabsTrigger>
              <TabsTrigger value="contact">Kontak</TabsTrigger>
              <TabsTrigger value="passport">Paspor</TabsTrigger>
              <TabsTrigger value="emergency">Darurat</TabsTrigger>
            </TabsList>

            {/* Data Diri Tab */}
            <TabsContent value="personal" className="space-y-4 mt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nama Lengkap *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => handleChange("full_name", e.target.value)}
                    placeholder="Sesuai paspor/KTP"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nik">NIK (KTP)</Label>
                  <Input
                    id="nik"
                    value={formData.nik}
                    onChange={(e) => handleChange("nik", e.target.value)}
                    placeholder="16 digit"
                    maxLength={16}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Jenis Kelamin</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(val) => handleChange("gender", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis kelamin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Laki-laki</SelectItem>
                      <SelectItem value="female">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birth_place">Tempat Lahir</Label>
                  <Input
                    id="birth_place"
                    value={formData.birth_place}
                    onChange={(e) => handleChange("birth_place", e.target.value)}
                    placeholder="Kota kelahiran"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birth_date">Tanggal Lahir</Label>
                  <Input
                    id="birth_date"
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => handleChange("birth_date", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="blood_type">Golongan Darah</Label>
                  <Select
                    value={formData.blood_type}
                    onValueChange={(val) => handleChange("blood_type", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih golongan darah" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="AB">AB</SelectItem>
                      <SelectItem value="O">O</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="marital_status">Status Pernikahan</Label>
                  <Select
                    value={formData.marital_status}
                    onValueChange={(val) => handleChange("marital_status", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Belum Menikah</SelectItem>
                      <SelectItem value="married">Menikah</SelectItem>
                      <SelectItem value="divorced">Cerai</SelectItem>
                      <SelectItem value="widowed">Duda/Janda</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Kontak Tab */}
            <TabsContent value="contact" className="space-y-4 mt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">No. Telepon</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Alamat Lengkap</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="Jalan, RT/RW, Kelurahan, Kecamatan"
                  rows={3}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="city">Kota/Kabupaten</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    placeholder="Kota"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="province">Provinsi</Label>
                  <Input
                    id="province"
                    value={formData.province}
                    onChange={(e) => handleChange("province", e.target.value)}
                    placeholder="Provinsi"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postal_code">Kode Pos</Label>
                  <Input
                    id="postal_code"
                    value={formData.postal_code}
                    onChange={(e) => handleChange("postal_code", e.target.value)}
                    placeholder="12345"
                    maxLength={5}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Paspor Tab */}
            <TabsContent value="passport" className="space-y-4 mt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="passport_number">Nomor Paspor</Label>
                  <Input
                    id="passport_number"
                    value={formData.passport_number}
                    onChange={(e) => handleChange("passport_number", e.target.value)}
                    placeholder="A1234567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passport_expiry">Masa Berlaku</Label>
                  <Input
                    id="passport_expiry"
                    type="date"
                    value={formData.passport_expiry}
                    onChange={(e) => handleChange("passport_expiry", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="father_name">Nama Ayah</Label>
                  <Input
                    id="father_name"
                    value={formData.father_name}
                    onChange={(e) => handleChange("father_name", e.target.value)}
                    placeholder="Nama ayah kandung"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mother_name">Nama Ibu</Label>
                  <Input
                    id="mother_name"
                    value={formData.mother_name}
                    onChange={(e) => handleChange("mother_name", e.target.value)}
                    placeholder="Nama ibu kandung"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="mahram_name">Nama Mahram</Label>
                  <Input
                    id="mahram_name"
                    value={formData.mahram_name}
                    onChange={(e) => handleChange("mahram_name", e.target.value)}
                    placeholder="Untuk jamaah wanita"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mahram_relation">Hubungan Mahram</Label>
                  <Select
                    value={formData.mahram_relation}
                    onValueChange={(val) => handleChange("mahram_relation", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih hubungan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="suami">Suami</SelectItem>
                      <SelectItem value="ayah">Ayah</SelectItem>
                      <SelectItem value="anak">Anak Laki-laki</SelectItem>
                      <SelectItem value="saudara">Saudara Kandung</SelectItem>
                      <SelectItem value="paman">Paman</SelectItem>
                      <SelectItem value="kakek">Kakek</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Kontak Darurat Tab */}
            <TabsContent value="emergency" className="space-y-4 mt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_name">Nama Kontak Darurat</Label>
                  <Input
                    id="emergency_contact_name"
                    value={formData.emergency_contact_name}
                    onChange={(e) => handleChange("emergency_contact_name", e.target.value)}
                    placeholder="Nama lengkap"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_phone">No. Telepon Darurat</Label>
                  <Input
                    id="emergency_contact_phone"
                    value={formData.emergency_contact_phone}
                    onChange={(e) => handleChange("emergency_contact_phone", e.target.value)}
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_relation">Hubungan</Label>
                  <Select
                    value={formData.emergency_contact_relation}
                    onValueChange={(val) => handleChange("emergency_contact_relation", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih hubungan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="orang_tua">Orang Tua</SelectItem>
                      <SelectItem value="suami_istri">Suami/Istri</SelectItem>
                      <SelectItem value="anak">Anak</SelectItem>
                      <SelectItem value="saudara">Saudara</SelectItem>
                      <SelectItem value="kerabat">Kerabat</SelectItem>
                      <SelectItem value="teman">Teman</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={updateMutation.isPending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
