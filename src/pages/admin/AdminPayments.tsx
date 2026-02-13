import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, formatDate } from "@/lib/format";
import { toast } from "sonner";
import { 
  CheckCircle, XCircle, Eye, Clock, 
  CreditCard, User, Calendar, ExternalLink,
  Search, Filter, Download, AlertCircle, X, ImageIcon,
  Bell, Send, Loader2
} from "lucide-react";

export default function AdminPayments() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [showProofDialog, setShowProofDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isSendingReminders, setIsSendingReminders] = useState(false);

  const { data: payments, isLoading } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          booking:bookings(
            id,
            booking_code,
            total_price,
            remaining_amount,
            paid_amount,
            customer:customers(id, full_name, phone, email)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ paymentId, status, notes }: { paymentId: string; status: 'paid' | 'failed'; notes?: string }) => {
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
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      toast.success('Pembayaran berhasil diverifikasi');
      setSelectedPayment(null);
      setShowRejectDialog(false);
      setShowProofDialog(false);
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

  const openProofDialog = (payment: any) => {
    setSelectedPayment(payment);
    setShowProofDialog(true);
  };

  const filteredPayments = payments?.filter(payment => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const booking = payment.booking as any;
      const match = 
        payment.payment_code.toLowerCase().includes(search) ||
        booking?.booking_code?.toLowerCase().includes(search) ||
        booking?.customer?.full_name?.toLowerCase().includes(search);
      if (!match) return false;
    }
    
    if (statusFilter !== "all" && payment.status !== statusFilter) {
      return false;
    }
    
    return true;
  });

  const pendingPayments = payments?.filter(p => p.status === 'pending' || p.status === 'verified') || [];
  const paidPayments = payments?.filter(p => p.status === 'paid') || [];
  const failedPayments = payments?.filter(p => p.status === 'failed') || [];

  const stats = {
    pending: pendingPayments.length,
    pendingAmount: pendingPayments.reduce((sum, p) => sum + p.amount, 0),
    paid: paidPayments.length,
    paidAmount: paidPayments.reduce((sum, p) => sum + p.amount, 0),
    failed: failedPayments.length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
      case 'verified':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Disetujui</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Menunggu</Badge>;
      case 'failed':
        return <Badge variant="destructive">Ditolak</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Verifikasi Pembayaran</h1>
          <p className="text-muted-foreground">Kelola dan verifikasi bukti pembayaran</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={async () => {
              setIsSendingReminders(true);
              try {
                const { data, error } = await supabase.functions.invoke('send-payment-reminder', {
                  body: { reminder_type: 'all' }
                });
                if (error) throw error;
                toast.success(`Reminder terkirim: ${data.summary?.sent || 0} berhasil, ${data.summary?.failed || 0} gagal`);
              } catch (err: any) {
                toast.error(err.message || 'Gagal mengirim reminder');
              } finally {
                setIsSendingReminders(false);
              }
            }}
            disabled={isSendingReminders}
          >
            {isSendingReminders ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Bell className="h-4 w-4 mr-2" />
            )}
            Kirim Reminder
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <p className="text-sm text-muted-foreground">Menunggu Verifikasi</p>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-xs text-muted-foreground">{formatCurrency(stats.pendingAmount)}</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="text-sm text-muted-foreground">Disetujui</p>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
            <p className="text-xs text-muted-foreground">{formatCurrency(stats.paidAmount)}</p>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <p className="text-sm text-muted-foreground">Ditolak</p>
            </div>
            <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <p className="text-sm text-muted-foreground">Total Transaksi</p>
            </div>
            <p className="text-2xl font-bold">{payments?.length || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            Menunggu ({stats.pending})
          </TabsTrigger>
          <TabsTrigger value="all">Semua Pembayaran</TabsTrigger>
        </TabsList>

        {/* Pending Tab */}
        <TabsContent value="pending" className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
            </div>
          ) : pendingPayments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <p className="text-muted-foreground">Tidak ada pembayaran yang menunggu verifikasi</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingPayments.map((payment) => (
                <PendingPaymentCard
                  key={payment.id}
                  payment={payment}
                  onViewProof={() => openProofDialog(payment)}
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
        </TabsContent>

        {/* All Payments Tab */}
        <TabsContent value="all" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari kode pembayaran, booking, atau nama..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="pending">Menunggu</SelectItem>
                <SelectItem value="paid">Disetujui</SelectItem>
                <SelectItem value="failed">Ditolak</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Table */}
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12" />)}
                </div>
              ) : !filteredPayments || filteredPayments.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  Tidak ada pembayaran yang ditemukan
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kode Pembayaran</TableHead>
                        <TableHead>Booking</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Metode</TableHead>
                        <TableHead className="text-right">Jumlah</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayments.map((payment) => {
                        const booking = payment.booking as any;
                        return (
                          <TableRow key={payment.id}>
                            <TableCell className="font-mono text-sm">
                              {payment.payment_code}
                            </TableCell>
                            <TableCell>
                              <span className="font-mono text-sm">{booking?.booking_code}</span>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{booking?.customer?.full_name}</p>
                                <p className="text-xs text-muted-foreground">{booking?.customer?.phone}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <p>{payment.payment_method || '-'}</p>
                                <p className="text-xs text-muted-foreground">{payment.bank_name}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatCurrency(payment.amount)}
                            </TableCell>
                            <TableCell>{getStatusBadge(payment.status || 'pending')}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(payment.created_at || '')}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                {payment.proof_url && (
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => openProofDialog(payment)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                )}
                                {payment.status === 'pending' && (
                                  <>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      className="text-green-600 hover:text-green-700"
                                      onClick={() => handleApprove(payment)}
                                      disabled={verifyMutation.isPending}
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      className="text-destructive hover:text-destructive"
                                      onClick={() => {
                                        setSelectedPayment(payment);
                                        setShowRejectDialog(true);
                                      }}
                                      disabled={verifyMutation.isPending}
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Proof Dialog */}
      <Dialog open={showProofDialog} onOpenChange={setShowProofDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bukti Pembayaran - {selectedPayment?.payment_code}</DialogTitle>
            <DialogDescription>
              {(selectedPayment?.booking as any)?.customer?.full_name} • {formatCurrency(selectedPayment?.amount || 0)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedPayment?.proof_url ? (
              <div className="relative">
                <img 
                  src={selectedPayment.proof_url} 
                  alt="Bukti Pembayaran"
                  className="w-full max-h-[60vh] object-contain rounded-lg border"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="absolute top-2 right-2"
                  asChild
                >
                  <a href={selectedPayment.proof_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Buka
                  </a>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <ImageIcon className="h-12 w-12 mb-4" />
                <p>Bukti pembayaran belum diupload</p>
              </div>
            )}
            
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Metode Pembayaran</span>
                <span>{selectedPayment?.payment_method || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bank</span>
                <span>{selectedPayment?.bank_name || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">No. Rekening</span>
                <span>{selectedPayment?.account_number || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Atas Nama</span>
                <span>{selectedPayment?.account_name || '-'}</span>
              </div>
            </div>
          </div>
          {(selectedPayment?.status === 'pending' || selectedPayment?.status === 'verified') && (
            <DialogFooter className="gap-2">
              <Button 
                variant="destructive" 
                onClick={() => {
                  setShowProofDialog(false);
                  setShowRejectDialog(true);
                }}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Tolak
              </Button>
              <Button 
                onClick={() => handleApprove(selectedPayment)}
                disabled={verifyMutation.isPending}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Setujui Pembayaran
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Tolak Pembayaran
            </DialogTitle>
            <DialogDescription>
              Pembayaran {selectedPayment?.payment_code} akan ditolak
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Alasan Penolakan</label>
              <Textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Masukkan alasan penolakan pembayaran..."
                rows={3}
                className="mt-1.5"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Batal
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={verifyMutation.isPending || !rejectReason.trim()}
            >
              Tolak Pembayaran
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface PendingPaymentCardProps {
  payment: any;
  onViewProof: () => void;
  onApprove: () => void;
  onReject: () => void;
  isPending: boolean;
}

function PendingPaymentCard({ payment, onViewProof, onApprove, onReject, isPending }: PendingPaymentCardProps) {
  const booking = payment.booking as any;

  return (
    <Card className="border-2 border-yellow-300 bg-yellow-50/50 dark:bg-yellow-950/20">
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono font-semibold">{payment.payment_code}</span>
              <Badge className="bg-yellow-100 text-yellow-800">Menunggu Verifikasi</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {booking?.customer?.full_name}
              </span>
              <span>Booking: {booking?.booking_code}</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(payment.created_at || '')}
              </span>
              <span>{payment.payment_method} • {payment.bank_name}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="text-left sm:text-right">
              <p className="text-2xl font-bold text-primary">{formatCurrency(payment.amount)}</p>
              <p className="text-xs text-muted-foreground">
                Sisa tagihan: {formatCurrency(booking?.remaining_amount || 0)}
              </p>
            </div>
            
            <div className="flex gap-2">
              {payment.proof_url && (
                <Button variant="outline" size="sm" onClick={onViewProof}>
                  <Eye className="h-4 w-4 mr-1" />
                  Bukti
                </Button>
              )}
              <Button 
                size="sm" 
                onClick={onApprove}
                disabled={isPending}
                className="bg-green-600 hover:bg-green-700"
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
        </div>
      </CardContent>
    </Card>
  );
}
