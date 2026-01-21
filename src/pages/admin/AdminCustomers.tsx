import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Eye, User, Phone, Mail, Users, FileCheck, Calendar, Star } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function AdminCustomers() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: customers, isLoading } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch booking counts per customer
  const { data: bookingCounts } = useQuery({
    queryKey: ['admin-customer-booking-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('customer_id');

      if (error) throw error;
      
      const counts: Record<string, number> = {};
      (data || []).forEach(b => {
        counts[b.customer_id] = (counts[b.customer_id] || 0) + 1;
      });
      return counts;
    },
  });

  // Fetch document counts per customer
  const { data: documentCounts } = useQuery({
    queryKey: ['admin-customer-document-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_documents')
        .select('customer_id, status');

      if (error) throw error;
      
      const counts: Record<string, { total: number; verified: number }> = {};
      (data || []).forEach(d => {
        if (!counts[d.customer_id]) {
          counts[d.customer_id] = { total: 0, verified: 0 };
        }
        counts[d.customer_id].total++;
        if (d.status === 'verified') {
          counts[d.customer_id].verified++;
        }
      });
      return counts;
    },
  });

  const filteredCustomers = customers?.filter(customer => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      customer.full_name?.toLowerCase().includes(search) ||
      customer.email?.toLowerCase().includes(search) ||
      customer.phone?.includes(search) ||
      customer.nik?.includes(search) ||
      customer.passport_number?.includes(search)
    );
  });

  const stats = {
    total: customers?.length || 0,
    withBookings: Object.keys(bookingCounts || {}).length,
    withDocuments: Object.keys(documentCounts || {}).length,
    tourLeaders: customers?.filter(c => c.is_tour_leader).length || 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Data Jamaah</h1>
          <p className="text-muted-foreground">Lihat dan kelola data jamaah</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama, email, NIK, paspor..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 w-full sm:w-72"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Jamaah</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pernah Booking</p>
                <p className="text-2xl font-bold">{stats.withBookings}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <FileCheck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dokumen Lengkap</p>
                <p className="text-2xl font-bold">{stats.withDocuments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <Star className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tour Leader</p>
                <p className="text-2xl font-bold">{stats.tourLeaders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : !filteredCustomers || filteredCustomers.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {searchTerm ? 'Tidak ada jamaah yang cocok.' : 'Belum ada data jamaah.'}
            </div>
          ) : (
            <div className="divide-y">
              {filteredCustomers.map((customer) => {
                const bookingCount = bookingCounts?.[customer.id] || 0;
                const docInfo = documentCounts?.[customer.id];
                
                return (
                  <div key={customer.id} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{customer.full_name}</p>
                            {customer.is_tour_leader && (
                              <Badge className="bg-amber-500 hover:bg-amber-600 text-white text-xs">
                                <Star className="h-3 w-3 mr-1" />
                                TL
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            {customer.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {customer.phone}
                              </span>
                            )}
                            {customer.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {customer.email}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {customer.gender && (
                              <Badge variant="outline" className="text-xs">
                                {customer.gender === 'male' ? 'L' : 'P'}
                              </Badge>
                            )}
                            {customer.passport_number && (
                              <Badge variant="outline" className="text-xs font-mono">
                                {customer.passport_number}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right text-sm hidden sm:block">
                          <p className="text-muted-foreground">NIK</p>
                          <p className="font-mono">{customer.nik || '-'}</p>
                        </div>
                        <div className="text-center hidden md:block">
                          <p className="text-2xl font-bold">{bookingCount}</p>
                          <p className="text-xs text-muted-foreground">Booking</p>
                        </div>
                        {docInfo && (
                          <div className="text-center hidden md:block">
                            <p className="text-lg font-semibold">{docInfo.verified}/{docInfo.total}</p>
                            <p className="text-xs text-muted-foreground">Dokumen</p>
                          </div>
                        )}
                        <div className="text-right text-sm hidden lg:block">
                          <p className="text-muted-foreground">Terdaftar</p>
                          <p>{format(new Date(customer.created_at), 'd MMM yyyy', { locale: id })}</p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/admin/customers/${customer.id}`}>
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
    </div>
  );
}