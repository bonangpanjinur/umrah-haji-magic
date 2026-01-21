import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Luggage, Plus, Search, QrCode, Tag } from "lucide-react";
import { toast } from "sonner";

const LUGGAGE_STATUS = [
  { value: 'registered', label: 'Terdaftar', color: 'bg-blue-100 text-blue-800' },
  { value: 'checked_in', label: 'Check-in', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'loaded', label: 'Dimuat', color: 'bg-purple-100 text-purple-800' },
  { value: 'delivered', label: 'Diterima', color: 'bg-green-100 text-green-800' },
];

export default function LuggagePage() {
  const [selectedDeparture, setSelectedDeparture] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [weightKg, setWeightKg] = useState("");
  const queryClient = useQueryClient();

  const { data: departures } = useQuery({
    queryKey: ['luggage-departures'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departures')
        .select(`
          id,
          departure_date,
          package:packages(name)
        `)
        .gte('departure_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('departure_date', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const { data: luggageList, isLoading } = useQuery({
    queryKey: ['luggage-list', selectedDeparture],
    enabled: !!selectedDeparture,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('luggage')
        .select(`
          id,
          tag_code,
          weight_kg,
          status,
          created_at,
          customer:customers(id, full_name, phone)
        `)
        .eq('departure_id', selectedDeparture)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: passengers } = useQuery({
    queryKey: ['luggage-passengers', selectedDeparture],
    enabled: !!selectedDeparture && addDialogOpen,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('booking_passengers')
        .select(`
          customer:customers(id, full_name),
          booking:bookings!inner(departure_id, booking_status)
        `)
        .eq('booking.departure_id', selectedDeparture)
        .eq('booking.booking_status', 'confirmed');

      if (error) throw error;
      return data;
    },
  });

  const addLuggage = useMutation({
    mutationFn: async () => {
      // Generate unique tag code
      const tagCode = `LUG-${Date.now().toString(36).toUpperCase()}`;
      
      const { error } = await supabase
        .from('luggage')
        .insert({
          customer_id: selectedCustomer,
          departure_id: selectedDeparture,
          tag_code: tagCode,
          weight_kg: weightKg ? parseFloat(weightKg) : null,
          status: 'registered',
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Luggage berhasil ditambahkan");
      setAddDialogOpen(false);
      setSelectedCustomer("");
      setWeightKg("");
      queryClient.invalidateQueries({ queryKey: ['luggage-list'] });
    },
    onError: () => {
      toast.error("Gagal menambahkan luggage");
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('luggage')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Status berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: ['luggage-list'] });
    },
    onError: () => {
      toast.error("Gagal memperbarui status");
    },
  });

  const filteredLuggage = luggageList?.filter(l => 
    (l.customer as any)?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.tag_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const s = LUGGAGE_STATUS.find(st => st.value === status);
    return s ? <Badge className={s.color}>{s.label}</Badge> : <Badge>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Luggage Tracking</h1>
          <p className="text-muted-foreground">Kelola dan lacak koper jamaah</p>
        </div>
        {selectedDeparture && (
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Luggage
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-2 block">Keberangkatan</label>
              <Select value={selectedDeparture} onValueChange={setSelectedDeparture}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih keberangkatan" />
                </SelectTrigger>
                <SelectContent>
                  {departures?.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {(d.package as any)?.name} - {format(new Date(d.departure_date), "dd MMM yyyy")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Cari</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nama jamaah atau kode tag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Luggage List */}
      {selectedDeparture && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Luggage className="h-5 w-5" />
              Daftar Luggage ({filteredLuggage?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : filteredLuggage?.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Belum ada luggage terdaftar
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tag Code</TableHead>
                    <TableHead>Jamaah</TableHead>
                    <TableHead>Berat (kg)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLuggage?.map((luggage) => (
                    <TableRow key={luggage.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono font-semibold">{luggage.tag_code}</span>
                        </div>
                      </TableCell>
                      <TableCell>{(luggage.customer as any)?.full_name}</TableCell>
                      <TableCell>{luggage.weight_kg || '-'}</TableCell>
                      <TableCell>{getStatusBadge(luggage.status)}</TableCell>
                      <TableCell className="text-right">
                        <Select
                          value={luggage.status}
                          onValueChange={(value) => updateStatus.mutate({ id: luggage.id, status: value })}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {LUGGAGE_STATUS.map((s) => (
                              <SelectItem key={s.value} value={s.value}>
                                {s.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add Luggage Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Luggage</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Jamaah</Label>
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jamaah" />
                </SelectTrigger>
                <SelectContent>
                  {passengers?.map((p) => (
                    <SelectItem key={(p.customer as any)?.id} value={(p.customer as any)?.id}>
                      {(p.customer as any)?.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Berat (kg)</Label>
              <Input
                type="number"
                step="0.1"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="Opsional"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Batal
            </Button>
            <Button 
              onClick={() => addLuggage.mutate()}
              disabled={!selectedCustomer || addLuggage.isPending}
            >
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
