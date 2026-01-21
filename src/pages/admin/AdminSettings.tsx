import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, CreditCard, Bell } from "lucide-react";
import ChangePassword from "@/components/settings/ChangePassword";
import ProfileForm from "@/components/settings/ProfileForm";

export default function AdminSettings() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Pengaturan</h1>
        <p className="text-muted-foreground">Kelola pengaturan sistem dan akun</p>
      </div>

      {/* User Profile */}
      <ProfileForm />

      {/* Change Password */}
      <ChangePassword />

      {/* Company Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Informasi Perusahaan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="company">Nama Perusahaan</Label>
            <Input id="company" defaultValue="PT Umroh Haji Berkah" />
          </div>
          <div>
            <Label htmlFor="phone">No. Telepon</Label>
            <Input id="phone" defaultValue="0800-123-4567" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue="info@umrohtravel.com" />
          </div>
          <div>
            <Label htmlFor="address">Alamat</Label>
            <Input id="address" defaultValue="Jl. Masjid Raya No. 123, Jakarta" />
          </div>
          <Button>Simpan Perubahan</Button>
        </CardContent>
      </Card>

      {/* Bank Accounts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Rekening Bank
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg">
            <p className="font-medium">Bank BCA</p>
            <p className="text-lg font-mono">123-456-7890</p>
            <p className="text-sm text-muted-foreground">a.n. PT Umroh Haji Berkah</p>
          </div>
          <Button variant="outline">Tambah Rekening</Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifikasi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Pengaturan notifikasi email dan WhatsApp akan tersedia segera.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
