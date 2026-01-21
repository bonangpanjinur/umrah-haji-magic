import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AddCustomerDialogProps {
  trigger?: React.ReactNode;
}

interface CustomerFormData {
  // Data Pribadi
  full_name: string;
  nik: string;
  gender: "male" | "female" | "";
  birth_place: string;
  birth_date: string;
  blood_type: string;
  marital_status: string;
  
  // Kontak
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  
  // Keluarga
  father_name: string;
  mother_name: string;
  mahram_name: string;
  mahram_relation: string;
  
  // Darurat
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relation: string;
  
  // Dokumen
  passport_number: string;
  passport_expiry: string;
  
  // Cabang
  branch_id: string;
}

const initialFormData: CustomerFormData = {
  full_name: "",
  nik: "",
  gender: "",
  birth_place: "",
  birth_date: "",
  blood_type: "",
  marital_status: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  province: "",
  postal_code: "",
  father_name: "",
  mother_name: "",
  mahram_name: "",
  mahram_relation: "",
  emergency_contact_name: "",
  emergency_contact_phone: "",
  emergency_contact_relation: "",
  passport_number: "",
  passport_expiry: "",
  branch_id: "",
};

export function AddCustomerDialog({ trigger }: AddCustomerDialogProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<CustomerFormData>(initialFormData);
  const [activeTab, setActiveTab] = useState("personal");

  const { data: branches } = useQuery({
    queryKey: ["branches-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("branches")
        .select("id, name, code")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .insert({
          full_name: formData.full_name,
          nik: formData.nik || null,
          gender: formData.gender || null,
          birth_place: formData.birth_place || null,
          birth_date: formData.birth_date || null,
          blood_type: formData.blood_type || null,
          marital_status: formData.marital_status || null,
          email: formData.email || null,
          phone: formData.phone || null,
          address: formData.address || null,
          city: formData.city || null,
          province: formData.province || null,
          postal_code: formData.postal_code || null,
          father_name: formData.father_name || null,
          mother_name: formData.mother_name || null,
          mahram_name: formData.mahram_name || null,
          mahram_relation: formData.mahram_relation || null,
          emergency_contact_name: formData.emergency_contact_name || null,
          emergency_contact_phone: formData.emergency_contact_phone || null,
          emergency_contact_relation: formData.emergency_contact_relation || null,
          passport_number: formData.passport_number || null,
          passport_expiry: formData.passport_expiry || null,
          branch_id: formData.branch_id || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Jamaah berhasil ditambahkan!");
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
      setFormData(initialFormData);
      setActiveTab("personal");
      setOpen(false);
    },
    onError: (error: Error) => {
      toast.error("Gagal menambahkan jamaah: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name.trim()) {
      toast.error("Nama lengkap wajib diisi");
      setActiveTab("personal");
      return;
    }
    createMutation.mutate();
  };

  const handleChange = (field: keyof CustomerFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setFormData(initialFormData);
      setActiveTab("personal");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Jamaah
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Jamaah Baru</DialogTitle>
          <DialogDescription>
            Lengkapi data jamaah secara manual. Field dengan tanda (*) wajib diisi.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="personal">Pribadi</TabsTrigger>
              <TabsTrigger value="contact">Kontak</TabsTrigger>
              <TabsTrigger value="family">Keluarga</TabsTrigger>
              <TabsTrigger value="emergency">Darurat</TabsTrigger>
              <TabsTrigger value="document">Dokumen</TabsTrigger>
            </TabsList>

            {/* Tab: Data Pribadi */}
            <TabsContent value="personal" className="space-y-4 mt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="full_name">Nama Lengkap (sesuai KTP/Paspor) *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={e => handleChange("full_name", e.target.value)}
                    placeholder="Masukkan nama lengkap"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="nik">NIK (16 digit)</Label>
                  <Input
                    id="nik"
                    value={formData.nik}
                    onChange={e => handleChange("nik", e.target.value)}
                    placeholder="3201XXXXXXXXXXXX"
                    maxLength={16}
                  />
                </div>

                <div>
                  <Label htmlFor="gender">Jenis Kelamin</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={v => handleChange("gender", v)}
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

                <div>
                  <Label htmlFor="birth_place">Tempat Lahir</Label>
                  <Input
                    id="birth_place"
                    value={formData.birth_place}
                    onChange={e => handleChange("birth_place", e.target.value)}
                    placeholder="Kota tempat lahir"
                  />
                </div>

                <div>
                  <Label htmlFor="birth_date">Tanggal Lahir</Label>
                  <Input
                    id="birth_date"
                    type="date"
                    value={formData.birth_date}
                    onChange={e => handleChange("birth_date", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="blood_type">Golongan Darah</Label>
                  <Select
                    value={formData.blood_type}
                    onValueChange={v => handleChange("blood_type", v)}
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

                <div>
                  <Label htmlFor="marital_status">Status Pernikahan</Label>
                  <Select
                    value={formData.marital_status}
                    onValueChange={v => handleChange("marital_status", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Belum Menikah</SelectItem>
                      <SelectItem value="married">Menikah</SelectItem>
                      <SelectItem value="divorced">Cerai Hidup</SelectItem>
                      <SelectItem value="widowed">Cerai Mati</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="branch_id">Cabang</Label>
                  <Select
                    value={formData.branch_id}
                    onValueChange={v => handleChange("branch_id", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih cabang" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches?.map(branch => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name} ({branch.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Tab: Kontak */}
            <TabsContent value="contact" className="space-y-4 mt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={e => handleChange("email", e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">No. Telepon / WhatsApp</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={e => handleChange("phone", e.target.value)}
                    placeholder="08XXXXXXXXXX"
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="address">Alamat Lengkap</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={e => handleChange("address", e.target.value)}
                    placeholder="Jalan, RT/RW, Kelurahan, Kecamatan"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="city">Kota/Kabupaten</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={e => handleChange("city", e.target.value)}
                    placeholder="Nama kota/kabupaten"
                  />
                </div>

                <div>
                  <Label htmlFor="province">Provinsi</Label>
                  <Input
                    id="province"
                    value={formData.province}
                    onChange={e => handleChange("province", e.target.value)}
                    placeholder="Nama provinsi"
                  />
                </div>

                <div>
                  <Label htmlFor="postal_code">Kode Pos</Label>
                  <Input
                    id="postal_code"
                    value={formData.postal_code}
                    onChange={e => handleChange("postal_code", e.target.value)}
                    placeholder="12345"
                    maxLength={5}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Tab: Keluarga */}
            <TabsContent value="family" className="space-y-4 mt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="father_name">Nama Ayah</Label>
                  <Input
                    id="father_name"
                    value={formData.father_name}
                    onChange={e => handleChange("father_name", e.target.value)}
                    placeholder="Nama lengkap ayah"
                  />
                </div>
                
                <div>
                  <Label htmlFor="mother_name">Nama Ibu</Label>
                  <Input
                    id="mother_name"
                    value={formData.mother_name}
                    onChange={e => handleChange("mother_name", e.target.value)}
                    placeholder="Nama lengkap ibu kandung"
                  />
                </div>

                <div className="sm:col-span-2 pt-4 border-t">
                  <p className="text-sm font-medium mb-3">Informasi Mahram (untuk jamaah wanita)</p>
                </div>

                <div>
                  <Label htmlFor="mahram_name">Nama Mahram</Label>
                  <Input
                    id="mahram_name"
                    value={formData.mahram_name}
                    onChange={e => handleChange("mahram_name", e.target.value)}
                    placeholder="Nama lengkap mahram"
                  />
                </div>

                <div>
                  <Label htmlFor="mahram_relation">Hubungan dengan Mahram</Label>
                  <Select
                    value={formData.mahram_relation}
                    onValueChange={v => handleChange("mahram_relation", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih hubungan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="husband">Suami</SelectItem>
                      <SelectItem value="father">Ayah</SelectItem>
                      <SelectItem value="son">Anak Laki-laki</SelectItem>
                      <SelectItem value="brother">Saudara Laki-laki</SelectItem>
                      <SelectItem value="uncle">Paman</SelectItem>
                      <SelectItem value="nephew">Keponakan Laki-laki</SelectItem>
                      <SelectItem value="grandfather">Kakek</SelectItem>
                      <SelectItem value="grandson">Cucu Laki-laki</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Tab: Kontak Darurat */}
            <TabsContent value="emergency" className="space-y-4 mt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="emergency_contact_name">Nama Kontak Darurat</Label>
                  <Input
                    id="emergency_contact_name"
                    value={formData.emergency_contact_name}
                    onChange={e => handleChange("emergency_contact_name", e.target.value)}
                    placeholder="Nama lengkap kontak darurat"
                  />
                </div>
                
                <div>
                  <Label htmlFor="emergency_contact_phone">No. Telepon Darurat</Label>
                  <Input
                    id="emergency_contact_phone"
                    value={formData.emergency_contact_phone}
                    onChange={e => handleChange("emergency_contact_phone", e.target.value)}
                    placeholder="08XXXXXXXXXX"
                  />
                </div>

                <div>
                  <Label htmlFor="emergency_contact_relation">Hubungan</Label>
                  <Select
                    value={formData.emergency_contact_relation}
                    onValueChange={v => handleChange("emergency_contact_relation", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih hubungan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spouse">Suami/Istri</SelectItem>
                      <SelectItem value="parent">Orang Tua</SelectItem>
                      <SelectItem value="child">Anak</SelectItem>
                      <SelectItem value="sibling">Saudara Kandung</SelectItem>
                      <SelectItem value="relative">Kerabat Lain</SelectItem>
                      <SelectItem value="friend">Teman</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Tab: Dokumen */}
            <TabsContent value="document" className="space-y-4 mt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="passport_number">Nomor Paspor</Label>
                  <Input
                    id="passport_number"
                    value={formData.passport_number}
                    onChange={e => handleChange("passport_number", e.target.value.toUpperCase())}
                    placeholder="A1234567"
                    className="font-mono uppercase"
                  />
                </div>
                
                <div>
                  <Label htmlFor="passport_expiry">Masa Berlaku Paspor</Label>
                  <Input
                    id="passport_expiry"
                    type="date"
                    value={formData.passport_expiry}
                    onChange={e => handleChange("passport_expiry", e.target.value)}
                  />
                </div>

                <div className="sm:col-span-2">
                  <p className="text-sm text-muted-foreground">
                    Dokumen pendukung lainnya (KTP, Kartu Keluarga, Buku Nikah, dll) dapat diunggah 
                    setelah data jamaah dibuat melalui halaman detail jamaah.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between items-center pt-6 mt-6 border-t">
            <div className="text-sm text-muted-foreground">
              * Field wajib diisi
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Simpan Jamaah
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
