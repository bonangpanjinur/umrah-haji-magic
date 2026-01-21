import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format";
import { 
  DollarSign, Users, Calendar, CreditCard, 
  TrendingUp, AlertCircle 
} from "lucide-react";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      // Get booking stats
      const { data: bookings } = await supabase
        .from('bookings')
        .select('total_price, paid_amount, booking_status, payment_status');

      // Get customer count
      const { count: customerCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });

      // Get pending payments
      const { data: pendingPayments } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'pending');

      // Calculate stats
      const totalRevenue = bookings?.reduce((sum, b) => sum + (b.paid_amount || 0), 0) || 0;
      const totalBookings = bookings?.length || 0;
      const pendingBookings = bookings?.filter(b => b.booking_status === 'pending').length || 0;
      const pendingPaymentAmount = pendingPayments?.reduce((sum, p) => sum + p.amount, 0) || 0;
      const pendingPaymentCount = pendingPayments?.length || 0;

      return {
        totalRevenue,
        totalBookings,
        pendingBookings,
        customerCount: customerCount || 0,
        pendingPaymentAmount,
        pendingPaymentCount,
      };
    },
  });

  const { data: recentBookings } = useQuery({
    queryKey: ['admin-recent-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_code,
          total_price,
          booking_status,
          payment_status,
          created_at,
          customer:customers(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Selamat datang di Admin Panel</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Pendapatan"
          value={formatCurrency(stats?.totalRevenue || 0)}
          icon={DollarSign}
          loading={isLoading}
        />
        <StatsCard
          title="Total Booking"
          value={stats?.totalBookings?.toString() || '0'}
          subtitle={`${stats?.pendingBookings || 0} pending`}
          icon={Calendar}
          loading={isLoading}
        />
        <StatsCard
          title="Total Jamaah"
          value={stats?.customerCount?.toString() || '0'}
          icon={Users}
          loading={isLoading}
        />
        <StatsCard
          title="Pending Verifikasi"
          value={stats?.pendingPaymentCount?.toString() || '0'}
          subtitle={formatCurrency(stats?.pendingPaymentAmount || 0)}
          icon={CreditCard}
          loading={isLoading}
          highlight
        />
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Booking Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentBookings?.map((booking) => (
              <div 
                key={booking.id} 
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div>
                  <p className="font-mono text-sm font-semibold">{booking.booking_code}</p>
                  <p className="text-sm text-muted-foreground">
                    {(booking.customer as any)?.full_name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(booking.total_price)}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {booking.payment_status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  loading?: boolean;
  highlight?: boolean;
}

function StatsCard({ title, value, subtitle, icon: Icon, loading, highlight }: StatsCardProps) {
  return (
    <Card className={highlight ? 'border-amber-300 bg-amber-50' : ''}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-24 mt-1" />
            ) : (
              <>
                <p className="text-2xl font-bold">{value}</p>
                {subtitle && (
                  <p className="text-xs text-muted-foreground">{subtitle}</p>
                )}
              </>
            )}
          </div>
          <div className={`p-3 rounded-full ${highlight ? 'bg-amber-100' : 'bg-primary/10'}`}>
            <Icon className={`h-6 w-6 ${highlight ? 'text-amber-600' : 'text-primary'}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
