import { useState } from 'react';
import { useCompanyFeatures, CompanyFeature } from '@/hooks/useCompanyFeatures';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const AVAILABLE_ICONS = ['Shield', 'Award', 'Clock', 'HeartHandshake', 'Building2', 'Headphones', 'Zap', 'Users', 'CheckCircle', 'Star'];

export function CompanyFeaturesEditor() {
  const { data: features, isLoading } = useCompanyFeatures();
  const queryClient = useQueryClient();
  const [editingFeatures, setEditingFeatures] = useState<CompanyFeature[] | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = () => {
    if (features) {
      setEditingFeatures([...features]);
    }
  };

  const currentFeatures = editingFeatures ?? features ?? [];

  const updateFeature = (index: number, field: keyof CompanyFeature, value: any) => {
    const updated = [...(editingFeatures || features || [])];
    updated[index] = { ...updated[index], [field]: value };
    setEditingFeatures(updated);
  };

  const addFeature = () => {
    const base = editingFeatures || features || [];
    const newFeature: CompanyFeature = {
      id: `feat-${Date.now()}`, icon_name: 'Star',
      title: '', description: '', display_order: base.length + 1, is_active: true,
    };
    setEditingFeatures([...base, newFeature]);
  };

  const removeFeature = (index: number) => {
    const base = editingFeatures || features || [];
    setEditingFeatures(base.filter((_, i) => i !== index));
  };

  const saveAll = async () => {
    if (!editingFeatures) return;
    setIsSaving(true);
    try {
      // Read current settings
      const { data: current, error: readErr } = await supabase
        .from('website_settings')
        .select('id, custom_sections')
        .limit(1)
        .single();

      if (readErr || !current) throw new Error(readErr?.message || 'Settings not found');

      const customSections = (current.custom_sections as Record<string, any>) || {};
      customSections.features = editingFeatures;

      const { error } = await supabase
        .from('website_settings')
        .update({ custom_sections: customSections as any })
        .eq('id', current.id);

      if (error) throw error;

      toast.success('Semua fitur berhasil disimpan');
      queryClient.invalidateQueries({ queryKey: ['company-features'] });
      queryClient.invalidateQueries({ queryKey: ['website-settings'] });
      setEditingFeatures(null);
    } catch (error: any) {
      toast.error(`Gagal menyimpan: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle>🌟 Edit Fitur Perusahaan</CardTitle><CardDescription>Kelola fitur yang ditampilkan di section "Mengapa Memilih Kami"</CardDescription></CardHeader>
        <CardContent className="space-y-4"><Skeleton className="h-32" /><Skeleton className="h-32" /></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div><CardTitle>🌟 Edit Fitur Perusahaan</CardTitle><CardDescription>Kelola fitur yang ditampilkan di section "Mengapa Memilih Kami"</CardDescription></div>
          {editingFeatures && (
            <Button onClick={saveAll} disabled={isSaving}>{isSaving ? 'Menyimpan...' : 'Simpan Semua'}</Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentFeatures.length === 0 && !editingFeatures ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">Belum ada fitur</p>
            <Button onClick={() => { handleEdit(); addFeature(); }} variant="outline" size="sm"><Plus className="h-4 w-4 mr-2" />Tambah Fitur</Button>
          </div>
        ) : (
          <>
            {!editingFeatures && (
              <Button onClick={handleEdit} variant="outline" size="sm" className="mb-2">Edit Fitur</Button>
            )}
            {currentFeatures.map((feature, index) => (
              <div key={feature.id} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <GripVertical className="h-4 w-4 text-muted-foreground mt-2" />
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div><Label className="text-xs">Icon</Label><Select value={feature.icon_name} onValueChange={(v) => updateFeature(index, 'icon_name', v)} disabled={!editingFeatures}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{AVAILABLE_ICONS.map((icon) => (<SelectItem key={icon} value={icon}>{icon}</SelectItem>))}</SelectContent></Select></div>
                        <div><Label className="text-xs">Urutan</Label><Input type="number" value={feature.display_order} onChange={(e) => updateFeature(index, 'display_order', parseInt(e.target.value))} disabled={!editingFeatures} /></div>
                      </div>
                      <div><Label className="text-xs">Judul Fitur</Label><Input value={feature.title} onChange={(e) => updateFeature(index, 'title', e.target.value)} placeholder="Izin Resmi Kemenag" disabled={!editingFeatures} /></div>
                      <div><Label className="text-xs">Deskripsi</Label><Textarea value={feature.description} onChange={(e) => updateFeature(index, 'description', e.target.value)} placeholder="Terdaftar dan berizin resmi..." rows={2} disabled={!editingFeatures} /></div>
                      <div className="flex items-center gap-2"><Switch checked={feature.is_active} onCheckedChange={(v) => updateFeature(index, 'is_active', v)} disabled={!editingFeatures} /><Label className="text-xs cursor-pointer">Aktif</Label></div>
                    </div>
                  </div>
                  {editingFeatures && (
                    <Button onClick={() => removeFeature(index)} size="sm" variant="destructive" className="ml-4"><Trash2 className="h-4 w-4" /></Button>
                  )}
                </div>
              </div>
            ))}
            {editingFeatures && (
              <Button onClick={addFeature} variant="outline" className="w-full mt-4"><Plus className="h-4 w-4 mr-2" />Tambah Fitur</Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
