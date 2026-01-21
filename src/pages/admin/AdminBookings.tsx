import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/format";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useState } from "react";
import { 
  Search, Eye, Calendar, Users, CreditCard,
  Clock, CheckCircle, XCircle
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Konfirmasi', color: 'bg-blue-100 text-blue-800' },
  processing: { label: 'Proses', color: 'bg-purple-100 text-purple-800' },
  completed: { label: 'Selesai', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Batal', color: 'bg-red-100 text-red-800' },
};

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Belum Bayar', color: 'bg-red-100 text-red-800' },
  partial: { label: 'Sebagian', color: 'bg-yellow-100 text-yellow-800' },
  paid: { label: 'Lunas', color: 'bg-green-100 text-green-800' },
};

export default function AdminBookings() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          customer:customers(full_name, phone),
          departure:departures(
            departure_date,
            package:packages(name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const filteredBookings = bookings?.filter(booking => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      booking.booking_code.toLowerCase().includes(search) ||
      (booking.customer as any)?.full_name?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Kelola Booking</h1>
          <p className="text-muted-foreground">Lihat dan kelola semua booking</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari kode booking..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 w-full sm:w-64"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : !filteredBookings || filteredBookings.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {searchTerm ? 'Tidak ada booking yang cocok.' : 'Belum ada booking.'}
            </div>
          ) : (
            <div className="divide-y">
              {filteredBookings.map((booking) => {
                const customer = booking.customer as any;
                const departure = booking.departure as any;
                const statusConfig = STATUS_CONFIG[booking.booking_status] || STATUS_CONFIG.pending;
                const paymentConfig = PAYMENT_STATUS_CONFIG[booking.payment_status] || PAYMENT_STATUS_CONFIG.pending;

                return (
                  <div key={booking.id} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold">{booking.booking_code}</span>
                          <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                          <Badge className={paymentConfig.color}>{paymentConfig.label}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {customer?.full_name} • {departure?.package?.name}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {departure?.departure_date && 
                              format(new Date(departure.departure_date), "d MMM yyyy", { locale: id })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {booking.total_pax} pax
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(booking.total_price)}</p>
                          {booking.remaining_amount > 0 && (
                            <p className="text-xs text-destructive">
                              Sisa: {formatCurrency(booking.remaining_amount)}
                            </p>
                          )}
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/admin/bookings/${booking.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
