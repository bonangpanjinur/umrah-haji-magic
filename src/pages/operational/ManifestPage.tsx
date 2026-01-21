import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { FileDown, RefreshCw, Eye, Plane } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ManifestPage() {
  const [selectedDeparture, setSelectedDeparture] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: departures, isLoading } = useQuery({
    queryKey: ['manifest-departures'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departures')
        .select(`
          id,
          departure_date,
          return_date,
          quota,
          booked_count,
          status,
          flight_number,
          package:packages(name, code)
        `)
        .order('departure_date', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
  });

  const { data: passengers, isLoading: loadingPassengers } = useQuery({
    queryKey: ['manifest-passengers', selectedDeparture],
    enabled: !!selectedDeparture,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('booking_passengers')
        .select(`
          id,
          is_main_passenger,
          room_preference,
          passenger_type,
          customer:customers(
            id, full_name, gender, birth_date, 
            passport_number, passport_expiry, phone
          ),
          booking:bookings!inner(
            id, booking_code, room_type, booking_status,
            departure_id
          )
        `)
        .eq('booking.departure_id', selectedDeparture)
        .eq('booking.booking_status', 'confirmed');

      if (error) throw error;
      return data;
    },
  });

  const generateManifest = useMutation({
    mutationFn: async (departureId: string) => {
      // In a real app, this would generate a PDF
      // For now, we just create a manifest record
      const { data, error } = await supabase
        .from('manifests')
        .insert({
          departure_id: departureId,
          version: 1,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Manifest berhasil dibuat");
      queryClient.invalidateQueries({ queryKey: ['manifest-departures'] });
    },
    onError: () => {
      toast.error("Gagal membuat manifest");
    },
  });

  const selectedDepartureData = departures?.find(d => d.id === selectedDeparture);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manifest Jamaah</h1>
        <p className="text-muted-foreground">Kelola manifest dan rooming list</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Daftar Keberangkatan
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paket</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Flight</TableHead>
                  <TableHead>Jamaah</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departures?.map((departure) => (
                  <TableRow key={departure.id}>
                    <TableCell className="font-medium">
                      {(departure.package as any)?.name}
                    </TableCell>
                    <TableCell>
                      {format(new Date(departure.departure_date), "dd MMM yyyy", { locale: id })}
                    </TableCell>
                    <TableCell>{departure.flight_number || '-'}</TableCell>
                    <TableCell>
                      {departure.booked_count}/{departure.quota}
                    </TableCell>
                    <TableCell>
                      <Badge variant={departure.status === 'open' ? 'default' : 'secondary'}>
                        {departure.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedDeparture(departure.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Lihat
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => generateManifest.mutate(departure.id)}
                        disabled={generateManifest.isPending}
                      >
                        <FileDown className="h-4 w-4 mr-1" />
                        Generate
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Passenger List Dialog */}
      <Dialog open={!!selectedDeparture} onOpenChange={() => setSelectedDeparture(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Manifest - {selectedDepartureData && (selectedDepartureData.package as any)?.name}
            </DialogTitle>
          </DialogHeader>

          {loadingPassengers ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : passengers?.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Belum ada jamaah terdaftar untuk keberangkatan ini
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>L/P</TableHead>
                  <TableHead>No. Passport</TableHead>
                  <TableHead>Tipe Kamar</TableHead>
                  <TableHead>Phone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {passengers?.map((p, idx) => (
                  <TableRow key={p.id}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell className="font-medium">
                      {(p.customer as any)?.full_name}
                      {p.is_main_passenger && (
                        <Badge variant="outline" className="ml-2 text-xs">Main</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {(p.customer as any)?.gender === 'male' ? 'L' : 'P'}
                    </TableCell>
                    <TableCell>{(p.customer as any)?.passport_number || '-'}</TableCell>
                    <TableCell className="capitalize">
                      {(p.booking as any)?.room_type}
                    </TableCell>
                    <TableCell>{(p.customer as any)?.phone || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
