import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/format";
import { useState } from "react";
import { 
  Search, Eye, Calendar, Users, Filter, X, Download
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: 'Pending', variant: 'secondary' },
  confirmed: { label: 'Konfirmasi', variant: 'default' },
  processing: { label: 'Proses', variant: 'outline' },
  completed: { label: 'Selesai', variant: 'default' },
  cancelled: { label: 'Batal', variant: 'destructive' },
  refunded: { label: 'Refund', variant: 'destructive' },
};

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending: { label: 'Belum Bayar', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  partial: { label: 'Sebagian', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  paid: { label: 'Lunas', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  refunded: { label: 'Refund', className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
};

export default function AdminBookings() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          customer:customers(id, full_name, phone, email),
          departure:departures(
            id,
            departure_date,
            return_date,
            package:packages(id, name, code)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const filteredBookings = bookings?.filter(booking => {
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const customer = booking.customer as any;
      const matchSearch = 
        booking.booking_code.toLowerCase().includes(search) ||
        customer?.full_name?.toLowerCase().includes(search) ||
        customer?.phone?.includes(search);
      if (!matchSearch) return false;
    }
    
    // Status filter
    if (statusFilter !== "all" && booking.booking_status !== statusFilter) {
      return false;
    }
    
    // Payment filter
    if (paymentFilter !== "all" && booking.payment_status !== paymentFilter) {
      return false;
    }
    
    return true;
  });

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPaymentFilter("all");
  };

  const hasActiveFilters = searchTerm || statusFilter !== "all" || paymentFilter !== "all";

  // Stats
  const stats = {
    total: bookings?.length || 0,
    pending: bookings?.filter(b => b.booking_status === 'pending').length || 0,
    confirmed: bookings?.filter(b => b.booking_status === 'confirmed').length || 0,
    unpaid: bookings?.filter(b => b.payment_status === 'pending').length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Kelola Booking</h1>
          <p className="text-muted-foreground">Lihat dan kelola semua booking</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Booking</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Menunggu Konfirmasi</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Terkonfirmasi</p>
            <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Belum Bayar</p>
            <p className="text-2xl font-bold text-red-600">{stats.unpaid}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari kode booking, nama, atau telepon..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? "bg-muted" : ""}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {[statusFilter !== "all", paymentFilter !== "all"].filter(Boolean).length}
              </Badge>
            )}
          </Button>
        </div>

        {showFilters && (
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-end gap-4">
                <div className="space-y-1.5 min-w-[180px]">
                  <label className="text-sm font-medium">Status Booking</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Konfirmasi</SelectItem>
                      <SelectItem value="processing">Proses</SelectItem>
                      <SelectItem value="completed">Selesai</SelectItem>
                      <SelectItem value="cancelled">Batal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 min-w-[180px]">
                  <label className="text-sm font-medium">Status Pembayaran</label>
                  <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Pembayaran</SelectItem>
                      <SelectItem value="pending">Belum Bayar</SelectItem>
                      <SelectItem value="partial">Sebagian</SelectItem>
                      <SelectItem value="paid">Lunas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Reset Filter
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bookings List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : !filteredBookings || filteredBookings.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {hasActiveFilters ? 'Tidak ada booking yang cocok dengan filter.' : 'Belum ada booking.'}
            </div>
          ) : (
            <div className="divide-y">
              {filteredBookings.map((booking) => {
                const customer = booking.customer as any;
                const departure = booking.departure as any;
                const statusConfig = STATUS_CONFIG[booking.booking_status || 'pending'];
                const paymentConfig = PAYMENT_STATUS_CONFIG[booking.payment_status || 'pending'];

                return (
                  <div key={booking.id} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-semibold">{booking.booking_code}</span>
                          <Badge variant={statusConfig?.variant || 'secondary'}>
                            {statusConfig?.label || booking.booking_status}
                          </Badge>
                          <Badge className={paymentConfig?.className}>
                            {paymentConfig?.label || booking.payment_status}
                          </Badge>
                        </div>
                        <p className="font-medium">{customer?.full_name || '-'}</p>
                        <p className="text-sm text-muted-foreground">
                          {departure?.package?.name || '-'}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {departure?.departure_date ? formatDate(departure.departure_date) : '-'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {booking.total_pax} pax
                          </span>
                          {customer?.phone && (
                            <span>{customer.phone}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(booking.total_price)}</p>
                          <p className="text-xs text-muted-foreground">
                            Dibayar: {formatCurrency(booking.paid_amount || 0)}
                          </p>
                          {(booking.remaining_amount || 0) > 0 && (
                            <p className="text-xs text-destructive font-medium">
                              Sisa: {formatCurrency(booking.remaining_amount || 0)}
                            </p>
                          )}
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/admin/bookings/${booking.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            Detail
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

      {/* Results count */}
      {filteredBookings && filteredBookings.length > 0 && (
        <p className="text-sm text-muted-foreground text-center">
          Menampilkan {filteredBookings.length} dari {bookings?.length} booking
        </p>
      )}
    </div>
  );
}
