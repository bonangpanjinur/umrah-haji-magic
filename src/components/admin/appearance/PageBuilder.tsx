import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { WebsiteSettings, HomepageSection, useUpdateWebsiteSettings } from "@/hooks/useWebsiteSettings";
import { Layout, Save, GripVertical, Eye, EyeOff, Upload, Loader2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PageBuilderProps {
  settings: WebsiteSettings;
}

export function PageBuilder({ settings }: PageBuilderProps) {
  const updateSettings = useUpdateWebsiteSettings();
  const [uploading, setUploading] = useState(false);
  
  const [sections, setSections] = useState<HomepageSection[]>(
    settings.homepage_sections || []
  );
  
  const [heroContent, setHeroContent] = useState({
    hero_title: settings.hero_title || "",
    hero_subtitle: settings.hero_subtitle || "",
    hero_image_url: settings.hero_image_url || "",
    hero_cta_text: settings.hero_cta_text || "",
    hero_cta_link: settings.hero_cta_link || "",
  });

  useEffect(() => {
    setSections(settings.homepage_sections || []);
    setHeroContent({
      hero_title: settings.hero_title || "",
      hero_subtitle: settings.hero_subtitle || "",
      hero_image_url: settings.hero_image_url || "",
      hero_cta_text: settings.hero_cta_text || "",
      hero_cta_link: settings.hero_cta_link || "",
    });
  }, [settings]);

  const handleSave = () => {
    updateSettings.mutate({
      homepage_sections: sections,
      ...heroContent,
    });
  };

  const toggleSection = (id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const moveSection = (id: string, direction: "up" | "down") => {
    const index = sections.findIndex((s) => s.id === id);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === sections.length - 1)
    ) {
      return;
    }

    const newSections = [...sections];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newSections[index], newSections[targetIndex]] = [
      newSections[targetIndex],
      newSections[index],
    ];

    // Update order values
    newSections.forEach((s, i) => {
      s.order = i + 1;
    });

    setSections(newSections);
  };

  const handleHeroImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `branding/hero-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      setHeroContent((prev) => ({ ...prev, hero_image_url: publicUrl }));
      toast.success("Gambar hero berhasil diupload");
    } catch (error: any) {
      toast.error(`Gagal upload: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const getSectionIcon = (id: string) => {
    switch (id) {
      case "hero":
        return "🖼️";
      case "featured_packages":
        return "📦";
      case "why_choose_us":
        return "⭐";
      case "testimonials":
        return "💬";
      case "cta":
        return "🎯";
      default:
        return "📄";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layout className="h-5 w-5" />
              <div>
                <CardTitle>Page Builder</CardTitle>
                <CardDescription>
                  Atur urutan dan visibilitas section di halaman beranda
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href="/" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Preview
                </a>
              </Button>
              <Button size="sm" onClick={handleSave} disabled={updateSettings.isPending}>
                <Save className="h-4 w-4 mr-2" />
                Simpan
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Section Order */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Urutan Section</CardTitle>
            <CardDescription>
              Drag untuk mengubah urutan, toggle untuk show/hide
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sections
                .sort((a, b) => a.order - b.order)
                .map((section, index) => (
                  <div
                    key={section.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                      section.enabled
                        ? "bg-background"
                        : "bg-muted/50 opacity-60"
                    )}
                  >
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        disabled={index === 0}
                        onClick={() => moveSection(section.id, "up")}
                      >
                        ▲
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        disabled={index === sections.length - 1}
                        onClick={() => moveSection(section.id, "down")}
                      >
                        ▼
                      </Button>
                    </div>
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xl">{getSectionIcon(section.id)}</span>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{section.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {section.enabled ? "Ditampilkan" : "Disembunyikan"}
                      </p>
                    </div>
                    <Switch
                      checked={section.enabled}
                      onCheckedChange={() => toggleSection(section.id)}
                    />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Hero Section Editor */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">🖼️ Hero Section</CardTitle>
            <CardDescription>
              Kustomisasi banner utama di halaman beranda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Judul Hero</Label>
              <Input
                value={heroContent.hero_title}
                onChange={(e) =>
                  setHeroContent((prev) => ({ ...prev, hero_title: e.target.value }))
                }
                placeholder="Wujudkan Perjalanan Spiritual Anda"
              />
            </div>

            <div className="space-y-2">
              <Label>Subtitle</Label>
              <Textarea
                value={heroContent.hero_subtitle}
                onChange={(e) =>
                  setHeroContent((prev) => ({ ...prev, hero_subtitle: e.target.value }))
                }
                placeholder="Pengalaman umroh dan haji terbaik..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Background Image</Label>
              <div className="flex items-start gap-4">
                {heroContent.hero_image_url ? (
                  <img
                    src={heroContent.hero_image_url}
                    alt="Hero"
                    className="h-20 w-32 object-cover rounded bg-muted"
                  />
                ) : (
                  <div className="h-20 w-32 bg-muted rounded flex items-center justify-center text-muted-foreground text-xs">
                    No Image
                  </div>
                )}
                <label>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleHeroImageUpload(file);
                    }}
                  />
                  <Button variant="outline" size="sm" asChild disabled={uploading}>
                    <span className="cursor-pointer">
                      {uploading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      Upload
                    </span>
                  </Button>
                </label>
              </div>
              <p className="text-xs text-muted-foreground">
                Rekomendasi: 1920x1080 pixel, format JPG/PNG
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Teks Tombol CTA</Label>
                <Input
                  value={heroContent.hero_cta_text}
                  onChange={(e) =>
                    setHeroContent((prev) => ({ ...prev, hero_cta_text: e.target.value }))
                  }
                  placeholder="Lihat Paket"
                />
              </div>
              <div className="space-y-2">
                <Label>Link CTA</Label>
                <Input
                  value={heroContent.hero_cta_link}
                  onChange={(e) =>
                    setHeroContent((prev) => ({ ...prev, hero_cta_link: e.target.value }))
                  }
                  placeholder="/packages"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Preview Urutan Halaman</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {sections
              .filter((s) => s.enabled)
              .sort((a, b) => a.order - b.order)
              .map((section, index) => (
                <div
                  key={section.id}
                  className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg"
                >
                  <span className="text-xs text-muted-foreground">{index + 1}.</span>
                  <span className="text-sm">{getSectionIcon(section.id)}</span>
                  <span className="text-sm font-medium">{section.title}</span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
