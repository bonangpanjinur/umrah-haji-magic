import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { WebsiteSettings, useUpdateWebsiteSettings } from "@/hooks/useWebsiteSettings";
import { Image, Save, Upload, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BrandingSettingsProps {
  settings: WebsiteSettings;
}

export function BrandingSettings({ settings }: BrandingSettingsProps) {
  const updateSettings = useUpdateWebsiteSettings();
  const [uploading, setUploading] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    company_name: settings.company_name || "",
    tagline: settings.tagline || "",
    logo_url: settings.logo_url || "",
    favicon_url: settings.favicon_url || "",
    footer_address: settings.footer_address || "",
    footer_phone: settings.footer_phone || "",
    footer_email: settings.footer_email || "",
    footer_whatsapp: settings.footer_whatsapp || "",
    social_instagram: settings.social_instagram || "",
    social_facebook: settings.social_facebook || "",
    social_youtube: settings.social_youtube || "",
    social_tiktok: settings.social_tiktok || "",
    meta_title: settings.meta_title || "",
    meta_description: settings.meta_description || "",
  });

  useEffect(() => {
    setFormData({
      company_name: settings.company_name || "",
      tagline: settings.tagline || "",
      logo_url: settings.logo_url || "",
      favicon_url: settings.favicon_url || "",
      footer_address: settings.footer_address || "",
      footer_phone: settings.footer_phone || "",
      footer_email: settings.footer_email || "",
      footer_whatsapp: settings.footer_whatsapp || "",
      social_instagram: settings.social_instagram || "",
      social_facebook: settings.social_facebook || "",
      social_youtube: settings.social_youtube || "",
      social_tiktok: settings.social_tiktok || "",
      meta_title: settings.meta_title || "",
      meta_description: settings.meta_description || "",
    });
  }, [settings]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updateSettings.mutate(formData);
  };

  const handleImageUpload = async (field: "logo_url" | "favicon_url", file: File) => {
    setUploading(field);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `branding/${field}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars") // Using avatars bucket which is public
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      setFormData((prev) => ({ ...prev, [field]: publicUrl }));
      toast.success("Gambar berhasil diupload");
    } catch (error: any) {
      toast.error(`Gagal upload: ${error.message}`);
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              <div>
                <CardTitle>Branding & Identitas</CardTitle>
                <CardDescription>
                  Konfigurasi logo, nama perusahaan, dan informasi kontak
                </CardDescription>
              </div>
            </div>
            <Button size="sm" onClick={handleSave} disabled={updateSettings.isPending}>
              <Save className="h-4 w-4 mr-2" />
              Simpan
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Logo & Favicon */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Logo & Favicon</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Logo Utama</Label>
              <div className="flex items-center gap-4">
                {formData.logo_url ? (
                  <img
                    src={formData.logo_url}
                    alt="Logo"
                    className="h-16 w-auto object-contain bg-muted rounded"
                  />
                ) : (
                  <div className="h-16 w-32 bg-muted rounded flex items-center justify-center text-muted-foreground text-sm">
                    No Logo
                  </div>
                )}
                <label>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload("logo_url", file);
                    }}
                  />
                  <Button variant="outline" size="sm" asChild disabled={uploading === "logo_url"}>
                    <span className="cursor-pointer">
                      {uploading === "logo_url" ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      Upload Logo
                    </span>
                  </Button>
                </label>
              </div>
              <p className="text-xs text-muted-foreground">
                Rekomendasi: PNG transparan, minimal 200x60 pixel
              </p>
            </div>

            <div className="space-y-2">
              <Label>Favicon</Label>
              <div className="flex items-center gap-4">
                {formData.favicon_url ? (
                  <img
                    src={formData.favicon_url}
                    alt="Favicon"
                    className="h-8 w-8 object-contain bg-muted rounded"
                  />
                ) : (
                  <div className="h-8 w-8 bg-muted rounded flex items-center justify-center text-muted-foreground text-xs">
                    ?
                  </div>
                )}
                <label>
                  <input
                    type="file"
                    accept="image/*,.ico"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload("favicon_url", file);
                    }}
                  />
                  <Button variant="outline" size="sm" asChild disabled={uploading === "favicon_url"}>
                    <span className="cursor-pointer">
                      {uploading === "favicon_url" ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      Upload Favicon
                    </span>
                  </Button>
                </label>
              </div>
              <p className="text-xs text-muted-foreground">
                Icon yang muncul di tab browser. Rekomendasi: 32x32 atau 64x64 pixel
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Company Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informasi Perusahaan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Perusahaan</Label>
              <Input
                value={formData.company_name}
                onChange={(e) => handleChange("company_name", e.target.value)}
                placeholder="Extraordinary Umroh"
              />
            </div>
            <div className="space-y-2">
              <Label>Tagline</Label>
              <Input
                value={formData.tagline}
                onChange={(e) => handleChange("tagline", e.target.value)}
                placeholder="Perjalanan Spiritual Menuju Baitullah"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informasi Kontak</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Alamat</Label>
              <Textarea
                value={formData.footer_address}
                onChange={(e) => handleChange("footer_address", e.target.value)}
                placeholder="Jl. Contoh No. 123, Jakarta"
                rows={2}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Telepon</Label>
                <Input
                  value={formData.footer_phone}
                  onChange={(e) => handleChange("footer_phone", e.target.value)}
                  placeholder="+62 21 1234567"
                />
              </div>
              <div className="space-y-2">
                <Label>WhatsApp</Label>
                <Input
                  value={formData.footer_whatsapp}
                  onChange={(e) => handleChange("footer_whatsapp", e.target.value)}
                  placeholder="+62 812 3456 7890"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.footer_email}
                onChange={(e) => handleChange("footer_email", e.target.value)}
                placeholder="info@example.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Media Sosial</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Instagram</Label>
                <Input
                  value={formData.social_instagram}
                  onChange={(e) => handleChange("social_instagram", e.target.value)}
                  placeholder="https://instagram.com/username"
                />
              </div>
              <div className="space-y-2">
                <Label>Facebook</Label>
                <Input
                  value={formData.social_facebook}
                  onChange={(e) => handleChange("social_facebook", e.target.value)}
                  placeholder="https://facebook.com/page"
                />
              </div>
              <div className="space-y-2">
                <Label>YouTube</Label>
                <Input
                  value={formData.social_youtube}
                  onChange={(e) => handleChange("social_youtube", e.target.value)}
                  placeholder="https://youtube.com/channel"
                />
              </div>
              <div className="space-y-2">
                <Label>TikTok</Label>
                <Input
                  value={formData.social_tiktok}
                  onChange={(e) => handleChange("social_tiktok", e.target.value)}
                  placeholder="https://tiktok.com/@username"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SEO */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">SEO & Meta Tags</CardTitle>
            <CardDescription>
              Pengaturan untuk optimasi mesin pencari
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Meta Title</Label>
              <Input
                value={formData.meta_title}
                onChange={(e) => handleChange("meta_title", e.target.value)}
                placeholder="Extraordinary Umroh - Perjalanan Spiritual Menuju Baitullah"
              />
              <p className="text-xs text-muted-foreground">
                {formData.meta_title.length}/60 karakter (rekomendasi maks 60)
              </p>
            </div>
            <div className="space-y-2">
              <Label>Meta Description</Label>
              <Textarea
                value={formData.meta_description}
                onChange={(e) => handleChange("meta_description", e.target.value)}
                placeholder="Layanan perjalanan umroh dan haji terpercaya..."
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                {formData.meta_description.length}/160 karakter (rekomendasi maks 160)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
