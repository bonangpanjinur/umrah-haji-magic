import { useState } from 'react';
import { useHeroStats, HeroStat } from '@/hooks/useHeroStats';
import { useWebsiteSettings, useUpdateWebsiteSettings } from '@/hooks/useWebsiteSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface EditableStat extends HeroStat {
  id: string;
  display_order: number;
}

export function HeroStatsEditor() {
  const { data: stats, isLoading } = useHeroStats();
  const { data: settings } = useWebsiteSettings();
  const updateSettings = useUpdateWebsiteSettings();
  const [editingStats, setEditingStats] = useState<EditableStat[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => {
    if (stats) {
      setEditingStats(stats.map((s, i) => ({
        ...s,
        id: `stat-${i}`,
        display_order: i + 1,
      })));
      setIsEditing(true);
    }
  };

  const updateStat = (index: number, field: keyof EditableStat, value: any) => {
    const updated = [...editingStats];
    updated[index] = { ...updated[index], [field]: value };
    setEditingStats(updated);
  };

  const addStat = () => {
    setEditingStats([...editingStats, {
      id: `temp-${Date.now()}`,
      stat_value: '',
      stat_label: '',
      display_order: editingStats.length + 1,
    }]);
  };

  const removeStat = (index: number) => setEditingStats(editingStats.filter((_, i) => i !== index));

  const saveAll = async () => {
    try {
      const currentCustomSections = (settings?.custom_sections as any) || {};
      const statsData = editingStats
        .sort((a, b) => a.display_order - b.display_order)
        .map(s => ({
          stat_value: s.stat_value,
          stat_label: s.stat_label,
        }));

      await updateSettings.mutateAsync({
        custom_sections: {
          ...currentCustomSections,
          stats: statsData,
        } as any,
      });

      toast.success('Statistik berhasil disimpan');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(`Gagal menyimpan: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle>📊 Edit Statistik Hero</CardTitle><CardDescription>Ubah angka dan label statistik yang ditampilkan di hero section</CardDescription></CardHeader>
        <CardContent className="space-y-4"><Skeleton className="h-10" /><Skeleton className="h-10" /><Skeleton className="h-10" /></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>📊 Edit Statistik Hero</CardTitle>
        <CardDescription>Ubah angka dan label statistik yang ditampilkan di hero section</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isEditing ? (
          <div className="text-center py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {stats?.map((stat, i) => (
                <div key={i} className="border rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-primary">{stat.stat_value}</div>
                  <div className="text-xs text-muted-foreground">{stat.stat_label}</div>
                </div>
              ))}
            </div>
            <Button onClick={handleEdit} variant="outline" size="sm">Edit Statistik</Button>
          </div>
        ) : (
          <>
            {editingStats.map((stat, index) => (
              <div key={stat.id} className="flex items-end gap-3 p-4 border rounded-lg">
                <GripVertical className="h-4 w-4 text-muted-foreground mt-6" />
                <div className="flex-1 space-y-2"><Label className="text-xs">Nilai Statistik</Label><Input value={stat.stat_value} onChange={(e) => updateStat(index, 'stat_value', e.target.value)} placeholder="15+" /></div>
                <div className="flex-1 space-y-2"><Label className="text-xs">Label Statistik</Label><Input value={stat.stat_label} onChange={(e) => updateStat(index, 'stat_label', e.target.value)} placeholder="Tahun Pengalaman" /></div>
                <div className="space-y-2"><Label className="text-xs">Urutan</Label><Input type="number" value={stat.display_order} onChange={(e) => updateStat(index, 'display_order', parseInt(e.target.value))} className="w-16" /></div>
                <Button onClick={() => removeStat(index)} size="sm" variant="destructive"><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
            <Button onClick={addStat} variant="outline" className="w-full mt-4"><Plus className="h-4 w-4 mr-2" />Tambah Statistik</Button>
            <div className="flex gap-2 mt-4">
              <Button onClick={saveAll} disabled={updateSettings.isPending}>Simpan Semua</Button>
              <Button onClick={() => setIsEditing(false)} variant="ghost">Batal</Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
