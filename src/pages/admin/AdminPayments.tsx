import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/format";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "sonner";
import { 
  CheckCircle, XCircle, Eye, Clock, 
  CreditCard, User, Calendar, ExternalLink 
} from "lucide-react";

export default function AdminPayments() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const { data: payments, isLoading } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          booking:bookings(
            booking_code,
            total_price,
            remaining_amount,
            customer:customers(full_name, phone)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ paymentId, status, notes }: { paymentId: string; status: 'paid' | 'failed'; notes?: string }) => {
      // Update payment status
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .update({
          status,
          verified_at: new Date().toISOString(),
          verified_by: user?.id,
          notes: notes || null,
        })
        .eq('id', paymentId)
        .select('booking_id, amount')
        .single();

      if (paymentError) throw paymentError;

      // If approved, update booking paid_amount
      if (status === 'paid' && payment) {
        const { data: booking } = await supabase
          .from('bookings')
          .select('paid_amount, total_price')
          .eq('id', payment.booking_id)
          .single();

        if (booking) {
          const newPaidAmount = (booking.paid_amount || 0) + payment.amount;
          const newRemainingAmount = booking.total_price - newPaidAmount;
          const newPaymentStatus = newRemainingAmount <= 0 ? 'paid' : 'partial';

          await supabase
            .from('bookings')
            .update({
              paid_amount: newPaidAmount,
              remaining_amount: Math.max(0, newRemainingAmount),
              payment_status: newPaymentStatus,
              booking_status: newPaymentStatus === 'paid' ? 'confirmed' : 'pending',
            })
            .eq('id', payment.booking_id);
        }
      }

      return payment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
      toast.success('Pembayaran berhasil diverifikasi');
      setSelectedPayment(null);
      setShowRejectDialog(false);
      setRejectReason("");
    },
    onError: (error: any) => {
      toast.error(error.message || 'Gagal memverifikasi pembayaran');
    },
  });

  const handleApprove = (payment: any) => {
    verifyMutation.mutate({ paymentId: payment.id, status: 'paid' });
  };

  const handleReject = () => {
    if (!selectedPayment) return;
    verifyMutation.mutate({ 
      paymentId: selectedPayment.id, 
      status: 'failed',
      notes: rejectReason 
    });
  };

  const pendingPayments = payments?.filter(p => p.status === 'pending') || [];
  const verifiedPayments = payments?.filter(p => p.status !== 'pending') || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Verifikasi Pembayaran</h1>
        <p className="text-muted-foreground">Kelola dan verifikasi bukti pembayaran</p>
      </div>

      {/* Pending Payments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            Menunggu Verifikasi ({pendingPayments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
          ) : pendingPayments.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Tidak ada pembayaran yang menunggu verifikasi.
            </p>
          ) : (
            <div className="space-y-3">
              {pendingPayments.map((payment) => (
                <PaymentCard
                  key={payment.id}
                  payment={payment}
                  onApprove={() => handleApprove(payment)}
                  onReject={() => {
                    setSelectedPayment(payment);
                    setShowRejectDialog(true);
                  }}
                  isPending={verifyMutation.isPending}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verified Payments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Riwayat Verifikasi
          </CardTitle>
        </CardHeader>
        <CardContent>
          {verifiedPayments.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Belum ada riwayat verifikasi.
            </p>
          ) : (
            <div className="space-y-3">
              {verifiedPayments.slice(0, 10).map((payment) => (
                <div 
                  key={payment.id} 
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-mono text-sm">{payment.payment_code}</p>
                    <p className="text-sm text-muted-foreground">
                      {(payment.booking as any)?.booking_code} • {(payment.booking as any)?.customer?.full_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(payment.amount)}</p>
                    <Badge variant={payment.status === 'paid' ? 'default' : 'destructive'}>
                      {payment.status === 'paid' ? 'Disetujui' : 'Ditolak'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Pembayaran</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Masukkan alasan penolakan pembayaran {selectedPayment?.payment_code}:
            </p>
            <Textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Alasan penolakan..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Batal
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={verifyMutation.isPending}
            >
              Tolak Pembayaran
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface PaymentCardProps {
  payment: any;
  onApprove: () => void;
  onReject: () => void;
  isPending: boolean;
}

function PaymentCard({ payment, onApprove, onReject, isPending }: PaymentCardProps) {
  const booking = payment.booking;

  return (
    <div className="p-4 border-2 border-amber-200 bg-amber-50 rounded-lg">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono font-semibold">{payment.payment_code}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-3 w-3" />
            <span>{booking?.customer?.full_name}</span>
            <span>•</span>
            <span>{booking?.booking_code}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{format(new Date(payment.created_at), "d MMM yyyy, HH:mm", { locale: id })}</span>
          </div>
        </div>

        <div className="text-right">
          <p className="text-2xl font-bold text-primary">{formatCurrency(payment.amount)}</p>
          <p className="text-sm text-muted-foreground">
            via {payment.payment_method} • {payment.bank_name}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        {payment.proof_url && (
          <Button variant="outline" size="sm" asChild>
            <a href={payment.proof_url} target="_blank" rel="noopener noreferrer">
              <Eye className="h-4 w-4 mr-1" />
              Lihat Bukti
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </Button>
        )}
        <Button 
          size="sm" 
          onClick={onApprove}
          disabled={isPending}
        >
          <CheckCircle className="h-4 w-4 mr-1" />
          Setujui
        </Button>
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={onReject}
          disabled={isPending}
        >
          <XCircle className="h-4 w-4 mr-1" />
          Tolak
        </Button>
      </div>
    </div>
  );
}
