import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DepartureForm } from "@/components/admin/forms/DepartureForm";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { 
  Calendar, Plus, Search, Plane, Users, Edit, Trash2, 
  Eye, Filter, CalendarDays 
} from "lucide-react";

export default function AdminDepartures() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDeparture, setEditingDeparture] = useState<any>(null);
  const [deleteDeparture, setDeleteDeparture] = useState<any>(null);

  const { data: departures, isLoading } = useQuery({
    queryKey: ['admin-all-departures'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departures')
        .select(`
          *,
          package:packages(id, name, code, package_type),
          departure_airport:airports!departures_departure_airport_id_fkey(code, name),
          arrival_airport:airports!departures_arrival_airport_id_fkey(code, name),
          muthawif:muthawifs(name),
          team_leader:customers!departures_team_leader_id_fkey(full_name)
        `)
        .order('departure_date', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('departures').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Jadwal berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ['admin-all-departures'] });
      setDeleteDeparture(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal menghapus jadwal");
    },
  });

  // Get unique months for filter
  const months = departures 
    ? [...new Set(departures.map(d => d.departure_date.substring(0, 7)))]
        .sort()
        .map(m => ({ value: m, label: new Date(m + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) }))
    : [];

  const filteredDepartures = departures?.filter(dep => {
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchesSearch = 
        dep.package?.name?.toLowerCase().includes(search) ||
        dep.package?.code?.toLowerCase().includes(search) ||
        dep.flight_number?.toLowerCase().includes(search);
      if (!matchesSearch) return false;
    }
    
    // Status filter
    if (statusFilter !== "all" && dep.status !== statusFilter) return false;
    
    // Month filter
    if (monthFilter !== "all" && !dep.departure_date.startsWith(monthFilter)) return false;
    
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-green-500">Buka</Badge>;
      case 'closed':
        return <Badge variant="secondary">Tutup</Badge>;
      case 'full':
        return <Badge variant="destructive">Penuh</Badge>;
      case 'departed':
        return <Badge variant="outline">Sudah Berangkat</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleEdit = (departure: any) => {
    setEditingDeparture(departure);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingDeparture(null);
  };

  // Stats
  const stats = {
    total: departures?.length || 0,
    open: departures?.filter(d => d.status === 'open').length || 0,
    full: departures?.filter(d => d.status === 'full').length || 0,
    totalQuota: departures?.reduce((sum, d) => sum + (d.quota || 0), 0) || 0,
    totalBooked: departures?.reduce((sum, d) => sum + (d.booked_count || 0), 0) || 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Jadwal Keberangkatan</h1>
          <p className="text-muted-foreground">Kelola semua jadwal keberangkatan</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Jadwal
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Jadwal</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.open}</p>
                <p className="text-sm text-muted-foreground">Masih Buka</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalBooked}</p>
                <p className="text-sm text-muted-foreground">Total Jamaah</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Plane className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalQuota}</p>
                <p className="text-sm text-muted-foreground">Total Kuota</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari paket atau no. penerbangan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="open">Buka</SelectItem>
                <SelectItem value="closed">Tutup</SelectItem>
                <SelectItem value="full">Penuh</SelectItem>
                <SelectItem value="departed">Sudah Berangkat</SelectItem>
              </SelectContent>
            </Select>
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Bulan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Bulan</SelectItem>
                {months.map((m) => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16" />)}
            </div>
          ) : !filteredDepartures || filteredDepartures.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' || monthFilter !== 'all' 
                  ? 'Tidak ada jadwal yang cocok dengan filter.' 
                  : 'Belum ada jadwal keberangkatan.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paket</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Rute</TableHead>
                    <TableHead>Penerbangan</TableHead>
                    <TableHead className="text-center">Kuota</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Muthawif</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDepartures.map((dep) => (
                    <TableRow key={dep.id}>
                      <TableCell>
                        <div>
                          <Link 
                            to={`/admin/packages/${dep.package?.id}`}
                            className="font-medium hover:text-primary hover:underline"
                          >
                            {dep.package?.name}
                          </Link>
                          <p className="text-xs text-muted-foreground">{dep.package?.code}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{formatDate(dep.departure_date)}</p>
                          <p className="text-xs text-muted-foreground">
                            s/d {formatDate(dep.return_date)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{dep.departure_airport?.code || '-'}</span>
                          <Plane className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium">{dep.arrival_airport?.code || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{dep.flight_number || '-'}</p>
                          {dep.departure_time && (
                            <p className="text-xs text-muted-foreground">{dep.departure_time}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className={dep.booked_count >= dep.quota ? 'text-destructive font-bold' : ''}>
                            {dep.booked_count || 0}/{dep.quota}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(dep.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{dep.muthawif?.name || '-'}</p>
                          {dep.team_leader && (
                            <p className="text-xs text-muted-foreground">
                              TL: {dep.team_leader.full_name}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(dep)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteDeparture(dep)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={handleFormClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingDeparture ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}
            </DialogTitle>
          </DialogHeader>
          <DepartureForm
            departureData={editingDeparture}
            onSuccess={handleFormClose}
            onCancel={handleFormClose}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteDeparture} onOpenChange={() => setDeleteDeparture(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Jadwal?</AlertDialogTitle>
            <AlertDialogDescription>
              Anda yakin ingin menghapus jadwal keberangkatan tanggal {deleteDeparture && formatDate(deleteDeparture.departure_date)}? 
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteDeparture && deleteMutation.mutate(deleteDeparture.id)}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}