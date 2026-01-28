import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { WebsiteSettings, useUpdateWebsiteSettings } from "@/hooks/useWebsiteSettings";
import { LayoutGrid, Save, Plus, Trash2, GripVertical } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CustomSectionEditorProps {
  settings: WebsiteSettings;
}

interface StatItem {
  value: string;
  label: string;
}

const DEFAULT_STATS: StatItem[] = [
  { value: '15+', label: 'Tahun Pengalaman' },
  { value: '50K+', label: 'Jamaah Terlayani' },
  { value: '100+', label: 'Keberangkatan/Tahun' },
  { value: '4.9', label: 'Rating Kepuasan' },
];

export function CustomSectionEditor({ settings }: CustomSectionEditorProps) {
  const updateSettings = useUpdateWebsiteSettings();
  
  const [stats, setStats] = useState<StatItem[]>(DEFAULT_STATS);
  const [showBismillah, setShowBismillah] = useState(true);
  const [showSearchWidget, setShowSearchWidget] = useState(true);
  const [showStats, setShowStats] = useState(true);

  const handleSave = () => {
    // In future, these can be stored in website_settings JSON field
    console.log('Custom sections saved:', { stats, showBismillah, showSearchWidget, showStats });
  };

  const updateStat = (index: number, field: keyof StatItem, value: string) => {
    const newStats = [...stats];
    newStats[index] = { ...newStats[index], [field]: value };
    setStats(newStats);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-5 w-5" />
              <div>
                <CardTitle>Pengaturan Section Custom</CardTitle>
                <CardDescription>
                  Kustomisasi konten dan elemen di berbagai section
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
        {/* Hero Section Options */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">🖼️ Opsi Hero Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Tampilkan Bismillah</Label>
                <p className="text-xs text-muted-foreground">
                  Tulisan Arab di atas judul hero
                </p>
              </div>
              <Switch checked={showBismillah} onCheckedChange={setShowBismillah} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Tampilkan Search Widget</Label>
                <p className="text-xs text-muted-foreground">
                  Form pencarian paket di hero
                </p>
              </div>
              <Switch checked={showSearchWidget} onCheckedChange={setShowSearchWidget} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Tampilkan Statistik</Label>
                <p className="text-xs text-muted-foreground">
                  Angka statistik di bawah hero
                </p>
              </div>
              <Switch checked={showStats} onCheckedChange={setShowStats} />
            </div>
          </CardContent>
        </Card>

        {/* Statistics Editor */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">📊 Edit Statistik</CardTitle>
            <CardDescription>
              Ubah angka dan label statistik yang ditampilkan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.map((stat, index) => (
              <div key={index} className="flex items-center gap-3">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <Input
                  value={stat.value}
                  onChange={(e) => updateStat(index, 'value', e.target.value)}
                  className="w-20"
                  placeholder="15+"
                />
                <Input
                  value={stat.label}
                  onChange={(e) => updateStat(index, 'label', e.target.value)}
                  className="flex-1"
                  placeholder="Tahun Pengalaman"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Why Choose Us Editor */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">⭐ Mengapa Memilih Kami</CardTitle>
            <CardDescription>
              Edit fitur-fitur unggulan yang ditampilkan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {['Pengalaman 15+ Tahun', 'Bimbingan Ustadz', 'Hotel Bintang 5', 'Harga Terjangkau'].map((feature, i) => (
                <Card key={i} className="p-4">
                  <div className="space-y-2">
                    <Select defaultValue="star">
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="star">⭐ Star</SelectItem>
                        <SelectItem value="check">✓ Check</SelectItem>
                        <SelectItem value="heart">❤️ Heart</SelectItem>
                        <SelectItem value="shield">🛡️ Shield</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input defaultValue={feature} className="h-8 text-sm" />
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
