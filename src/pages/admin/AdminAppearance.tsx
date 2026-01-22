import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Type, Layout, Image, Settings2 } from "lucide-react";
import { ThemeSelector } from "@/components/admin/appearance/ThemeSelector";
import { ColorSettings } from "@/components/admin/appearance/ColorSettings";
import { TypographySettings } from "@/components/admin/appearance/TypographySettings";
import { BrandingSettings } from "@/components/admin/appearance/BrandingSettings";
import { PageBuilder } from "@/components/admin/appearance/PageBuilder";
import { useWebsiteSettings, useThemePresets } from "@/hooks/useWebsiteSettings";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminAppearance() {
  const { data: settings, isLoading: loadingSettings } = useWebsiteSettings();
  const { data: presets, isLoading: loadingPresets } = useThemePresets();
  const [activeTab, setActiveTab] = useState("themes");

  if (loadingSettings || loadingPresets) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pengaturan Tampilan</h1>
        <p className="text-muted-foreground">
          Kustomisasi tema, warna, font, dan layout website publik
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="themes" className="gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Tema</span>
          </TabsTrigger>
          <TabsTrigger value="colors" className="gap-2">
            <Settings2 className="h-4 w-4" />
            <span className="hidden sm:inline">Warna</span>
          </TabsTrigger>
          <TabsTrigger value="typography" className="gap-2">
            <Type className="h-4 w-4" />
            <span className="hidden sm:inline">Font</span>
          </TabsTrigger>
          <TabsTrigger value="branding" className="gap-2">
            <Image className="h-4 w-4" />
            <span className="hidden sm:inline">Branding</span>
          </TabsTrigger>
          <TabsTrigger value="layout" className="gap-2">
            <Layout className="h-4 w-4" />
            <span className="hidden sm:inline">Layout</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="themes">
          {settings && presets && (
            <ThemeSelector settings={settings} presets={presets} />
          )}
        </TabsContent>

        <TabsContent value="colors">
          {settings && <ColorSettings settings={settings} />}
        </TabsContent>

        <TabsContent value="typography">
          {settings && <TypographySettings settings={settings} />}
        </TabsContent>

        <TabsContent value="branding">
          {settings && <BrandingSettings settings={settings} />}
        </TabsContent>

        <TabsContent value="layout">
          {settings && <PageBuilder settings={settings} />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
