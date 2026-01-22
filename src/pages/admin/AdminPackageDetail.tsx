import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatCurrency, formatPackageType, formatDate } from "@/lib/format";
import { ArrowLeft, Link2, Edit, Trash2, Calendar, Users, Plane } from "lucide-react";
import { useState } from "react";
import { LinkDepartureForm } from "@/components/admin/forms/LinkDepartureForm";
import { PackageForm } from "@/components/admin/forms/PackageForm";
import { toast } from "sonner";

export default function AdminPackageDetail() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  
  const [isPackageFormOpen, setIsPackageFormOpen] = useState(false);
  const [isLinkDepartureOpen, setIsLinkDepartureOpen] = useState(false);
  const [unlinkDeparture, setUnlinkDeparture] = useState<any>(null);

  const { data: packageData, isLoading } = useQuery({
    queryKey: ['admin-package', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('packages')
        .select(`
          *,
          airline:airlines(id, name, code),
          hotel_makkah:hotels!packages_hotel_makkah_id_fkey(id, name, star_rating),
          hotel_madinah:hotels!packages_hotel_madinah_id_fkey(id, name, star_rating),
          muthawif:muthawifs(id, name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: departures, isLoading: departuresLoading } = useQuery({
    queryKey: ['admin-departures', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departures')
        .select(`
          *,
          departure_airport:airports!departures_departure_airport_id_fkey(code, city),
          arrival_airport:airports!departures_arrival_airport_id_fkey(code, city)
        `)
        .eq('package_id', id)
        .order('departure_date', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const unlinkDepartureMutation = useMutation({
    mutationFn: async (departureId: string) => {
      const { error } = await supabase
        .from('departures')
        .update({ package_id: null })
        .eq('id', departureId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Keberangkatan berhasil dilepas dari paket");
      queryClient.invalidateQueries({ queryKey: ['admin-departures', id] });
      setUnlinkDeparture(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal melepas keberangkatan");
    },
  });

  const linkedDepartureIds = departures?.map(d => d.id) || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-green-500">Open</Badge>;
      case 'closed':
        return <Badge variant="secondary">Closed</Badge>;
      case 'full':
        return <Badge className="bg-orange-500">Full</Badge>;
      case 'departed':
        return <Badge variant="outline">Departed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Paket tidak ditemukan</p>
        <Button asChild className="mt-4">
          <Link to="/admin/packages">Kembali</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin/packages">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{packageData.name}</h1>
              {!packageData.is_active && <Badge variant="destructive">Nonaktif</Badge>}
              {packageData.is_featured && <Badge variant="secondary">Featured</Badge>}
            </div>
            <p className="text-muted-foreground">{packageData.code} • {formatPackageType(packageData.package_type)}</p>
          </div>
        </div>
        <Button onClick={() => setIsPackageFormOpen(true)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Paket
        </Button>
      </div>

      {/* Package Info */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informasi Paket</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {packageData.featured_image && (
              <img 
                src={packageData.featured_image} 
                alt={packageData.name}
                className="w-full h-48 object-cover rounded-lg"
              />
            )}
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Durasi</p>
                <p className="font-medium">{packageData.duration_days} Hari</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Maskapai</p>
                <p className="font-medium">{packageData.airline?.name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hotel Makkah</p>
                <p className="font-medium">
                  {packageData.hotel_makkah?.name || '-'}
                  {packageData.hotel_makkah?.star_rating && ` (${packageData.hotel_makkah.star_rating}⭐)`}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hotel Madinah</p>
                <p className="font-medium">
                  {packageData.hotel_madinah?.name || '-'}
                  {packageData.hotel_madinah?.star_rating && ` (${packageData.hotel_madinah.star_rating}⭐)`}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Muthawif</p>
                <p className="font-medium">{packageData.muthawif?.name || '-'}</p>
              </div>
            </div>

            {packageData.description && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Deskripsi</p>
                <p className="text-sm">{packageData.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Harga</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Quad (4 orang)</span>
              <span className="font-medium">{formatCurrency(packageData.price_quad)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Triple (3 orang)</span>
              <span className="font-medium">{formatCurrency(packageData.price_triple)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Double (2 orang)</span>
              <span className="font-medium">{formatCurrency(packageData.price_double)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Single (1 orang)</span>
              <span className="font-medium">{formatCurrency(packageData.price_single)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Includes / Excludes */}
      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Termasuk</CardTitle>
          </CardHeader>
          <CardContent>
            {packageData.includes && packageData.includes.length > 0 ? (
              <ul className="list-disc list-inside space-y-1 text-sm">
                {packageData.includes.map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">Belum ada data</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Tidak Termasuk</CardTitle>
          </CardHeader>
          <CardContent>
            {packageData.excludes && packageData.excludes.length > 0 ? (
              <ul className="list-disc list-inside space-y-1 text-sm">
                {packageData.excludes.map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">Belum ada data</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Departures */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Jadwal Keberangkatan
          </CardTitle>
          <Button onClick={() => setIsLinkDepartureOpen(true)}>
            <Link2 className="h-4 w-4 mr-2" />
            Hubungkan Keberangkatan
          </Button>
        </CardHeader>
        <CardContent>
          {departuresLoading ? (
            <Skeleton className="h-32" />
          ) : !departures || departures.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Belum ada jadwal keberangkatan terhubung</p>
              <p className="text-sm mt-1">
                Buat jadwal di menu <strong>Keberangkatan</strong>, lalu hubungkan ke paket ini
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Rute</TableHead>
                    <TableHead>Penerbangan</TableHead>
                    <TableHead className="text-center">Kuota</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departures.map((departure) => (
                    <TableRow key={departure.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{formatDate(departure.departure_date)}</p>
                          <p className="text-xs text-muted-foreground">
                            s/d {formatDate(departure.return_date)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{departure.departure_airport?.code || '-'}</span>
                          <Plane className="h-3 w-3" />
                          <span>{departure.arrival_airport?.code || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{departure.flight_number || '-'}</p>
                          {departure.departure_time && (
                            <p className="text-xs text-muted-foreground">{departure.departure_time}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{departure.booked_count || 0}/{departure.quota}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(departure.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setUnlinkDeparture(departure)}
                          title="Lepas dari paket"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Package Form Dialog */}
      <Dialog open={isPackageFormOpen} onOpenChange={setIsPackageFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Paket</DialogTitle>
          </DialogHeader>
          <PackageForm
            packageData={packageData}
            onSuccess={() => {
              setIsPackageFormOpen(false);
              queryClient.invalidateQueries({ queryKey: ['admin-package', id] });
            }}
            onCancel={() => setIsPackageFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Link Departure Dialog */}
      <Dialog open={isLinkDepartureOpen} onOpenChange={setIsLinkDepartureOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Hubungkan Keberangkatan</DialogTitle>
          </DialogHeader>
          <LinkDepartureForm
            packageId={id!}
            linkedDepartureIds={linkedDepartureIds}
            onSuccess={() => setIsLinkDepartureOpen(false)}
            onCancel={() => setIsLinkDepartureOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Unlink Departure Confirmation */}
      <AlertDialog open={!!unlinkDeparture} onOpenChange={() => setUnlinkDeparture(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Lepas Keberangkatan?</AlertDialogTitle>
            <AlertDialogDescription>
              Anda yakin ingin melepas jadwal keberangkatan tanggal {unlinkDeparture && formatDate(unlinkDeparture.departure_date)} dari paket ini? 
              Jadwal tidak akan dihapus, hanya dilepas dari paket.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => unlinkDeparture && unlinkDepartureMutation.mutate(unlinkDeparture.id)}
            >
              Lepas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
