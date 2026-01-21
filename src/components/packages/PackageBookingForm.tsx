import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Calendar, Users, BedDouble, Minus, Plus, Loader2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { RoomType } from "@/types/database";

interface PackageBookingFormProps {
  packageId: string;
  prices: {
    quad: number;
    triple: number;
    double: number;
    single: number;
  };
}

interface RoomAllocation {
  quad: number;
  triple: number;
  double: number;
  single: number;
}

const ROOM_INFO: Record<RoomType, { label: string; occupancy: number; desc: string }> = {
  quad: { label: 'Quad', occupancy: 4, desc: '4 orang/kamar' },
  triple: { label: 'Triple', occupancy: 3, desc: '3 orang/kamar' },
  double: { label: 'Double', occupancy: 2, desc: '2 orang/kamar' },
  single: { label: 'Single', occupancy: 1, desc: '1 orang/kamar' },
};

export function PackageBookingForm({ packageId, prices }: PackageBookingFormProps) {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  
  const [selectedDeparture, setSelectedDeparture] = useState<string>("");
  const [roomAllocation, setRoomAllocation] = useState<RoomAllocation>({
    quad: 0,
    triple: 0,
    double: 0,
    single: 0,
  });

  // Fetch departures
  const { data: departures, isLoading: departuresLoading } = useQuery({
    queryKey: ['package-departures', packageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departures')
        .select('*')
        .eq('package_id', packageId)
        .eq('status', 'open')
        .gte('departure_date', new Date().toISOString().split('T')[0])
        .order('departure_date', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const selectedDepartureData = departures?.find(d => d.id === selectedDeparture);
  const availableSeats = selectedDepartureData 
    ? selectedDepartureData.quota - (selectedDepartureData.booked_count || 0)
    : 99;

  // Calculate totals
  const { totalPassengers, totalPrice, roomSummary } = useMemo(() => {
    const passengers = roomAllocation.quad + roomAllocation.triple + roomAllocation.double + roomAllocation.single;
    
    const price = 
      (roomAllocation.quad * prices.quad) +
      (roomAllocation.triple * prices.triple) +
      (roomAllocation.double * prices.double) +
      (roomAllocation.single * prices.single);

    // Calculate rooms needed
    const summary: string[] = [];
    if (roomAllocation.quad > 0) {
      const rooms = Math.ceil(roomAllocation.quad / 4);
      summary.push(`${rooms} Quad`);
    }
    if (roomAllocation.triple > 0) {
      const rooms = Math.ceil(roomAllocation.triple / 3);
      summary.push(`${rooms} Triple`);
    }
    if (roomAllocation.double > 0) {
      const rooms = Math.ceil(roomAllocation.double / 2);
      const leftover = roomAllocation.double % 2;
      if (leftover > 0) {
        summary.push(`${rooms} Double (${leftover} akan dipasangkan staff)`);
      } else {
        summary.push(`${rooms} Double`);
      }
    }
    if (roomAllocation.single > 0) {
      summary.push(`${roomAllocation.single} Single`);
    }

    return { totalPassengers: passengers, totalPrice: price, roomSummary: summary };
  }, [roomAllocation, prices]);

  const updateRoomCount = (type: RoomType, delta: number) => {
    setRoomAllocation(prev => {
      const newCount = Math.max(0, prev[type] + delta);
      const newTotal = (type === 'quad' ? newCount : prev.quad) +
                       (type === 'triple' ? newCount : prev.triple) +
                       (type === 'double' ? newCount : prev.double) +
                       (type === 'single' ? newCount : prev.single);
      
      // Don't exceed available seats
      if (newTotal > availableSeats) return prev;
      
      return { ...prev, [type]: newCount };
    });
  };

  const handleProceed = () => {
    if (!user) {
      navigate(`/auth/login?redirect=/packages/${packageId}`);
      return;
    }

    // Encode room allocation as URL params
    const params = new URLSearchParams({
      departure: selectedDeparture,
      quad: roomAllocation.quad.toString(),
      triple: roomAllocation.triple.toString(),
      double: roomAllocation.double.toString(),
      single: roomAllocation.single.toString(),
    });
    navigate(`/booking/${packageId}?${params.toString()}`);
  };

  const canProceed = selectedDeparture && totalPassengers > 0;

  if (departuresLoading) {
    return (
      <Card className="sticky top-24">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="sticky top-24">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Pesan Sekarang</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* 1. Pilih Tanggal Keberangkatan */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Calendar className="h-4 w-4 text-primary" />
            Tanggal Keberangkatan
          </Label>
          <Select value={selectedDeparture} onValueChange={setSelectedDeparture}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih tanggal" />
            </SelectTrigger>
            <SelectContent>
              {departures && departures.length > 0 ? (
                departures.map((dep) => {
                  const seats = dep.quota - (dep.booked_count || 0);
                  return (
                    <SelectItem 
                      key={dep.id} 
                      value={dep.id}
                      disabled={seats <= 0}
                    >
                      <div className="flex items-center justify-between w-full gap-4">
                        <span>
                          {format(new Date(dep.departure_date), "d MMM yyyy", { locale: idLocale })}
                        </span>
                        <span className={cn(
                          "text-xs",
                          seats < 10 ? "text-destructive" : "text-muted-foreground"
                        )}>
                          ({seats} kursi)
                        </span>
                      </div>
                    </SelectItem>
                  );
                })
              ) : (
                <SelectItem value="none" disabled>
                  Tidak ada jadwal tersedia
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          {selectedDepartureData && (
            <p className="text-xs text-muted-foreground">
              Pulang: {format(new Date(selectedDepartureData.return_date), "d MMM yyyy", { locale: idLocale })}
            </p>
          )}
        </div>

        {/* 2. Pilih Jumlah Jamaah per Tipe Kamar */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <BedDouble className="h-4 w-4 text-primary" />
            Pilih Kamar & Jumlah Jamaah
          </Label>
          
          <div className="space-y-2">
            {(Object.keys(ROOM_INFO) as RoomType[]).map((type) => {
              const info = ROOM_INFO[type];
              const count = roomAllocation[type];
              const price = prices[type];
              
              return (
                <div 
                  key={type}
                  className={cn(
                    "flex items-center justify-between p-3 border rounded-lg transition-colors",
                    count > 0 ? "border-primary bg-primary/5" : "border-border"
                  )}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{info.label}</span>
                      <span className="text-xs text-muted-foreground">({info.desc})</span>
                    </div>
                    <span className="text-xs text-primary font-medium">
                      {formatCurrency(price)}/org
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateRoomCount(type, -1)}
                      disabled={count <= 0}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 text-center text-sm font-medium">{count}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateRoomCount(type, 1)}
                      disabled={totalPassengers >= availableSeats}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Room Summary */}
          {roomSummary.length > 0 && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">Ringkasan Kamar:</p>
                  {roomSummary.map((s, i) => (
                    <p key={i}>• {s}</p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Total Summary */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Users className="h-4 w-4" />
              Total Jamaah
            </span>
            <span className="font-medium">{totalPassengers} orang</span>
          </div>
          
          {totalPassengers > 0 && (
            <>
              <div className="text-xs text-muted-foreground space-y-1">
                {roomAllocation.quad > 0 && (
                  <div className="flex justify-between">
                    <span>{roomAllocation.quad}x Quad @ {formatCurrency(prices.quad)}</span>
                    <span>{formatCurrency(roomAllocation.quad * prices.quad)}</span>
                  </div>
                )}
                {roomAllocation.triple > 0 && (
                  <div className="flex justify-between">
                    <span>{roomAllocation.triple}x Triple @ {formatCurrency(prices.triple)}</span>
                    <span>{formatCurrency(roomAllocation.triple * prices.triple)}</span>
                  </div>
                )}
                {roomAllocation.double > 0 && (
                  <div className="flex justify-between">
                    <span>{roomAllocation.double}x Double @ {formatCurrency(prices.double)}</span>
                    <span>{formatCurrency(roomAllocation.double * prices.double)}</span>
                  </div>
                )}
                {roomAllocation.single > 0 && (
                  <div className="flex justify-between">
                    <span>{roomAllocation.single}x Single @ {formatCurrency(prices.single)}</span>
                    <span>{formatCurrency(roomAllocation.single * prices.single)}</span>
                  </div>
                )}
              </div>
              <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(totalPrice)}</span>
              </div>
            </>
          )}
        </div>

        {/* CTA Button */}
        <Button 
          className="w-full" 
          size="lg"
          onClick={handleProceed}
          disabled={!canProceed || authLoading}
        >
          {authLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          {!user ? 'Login untuk Pesan' : 'Lanjut ke Data Jamaah'}
        </Button>

        {!selectedDeparture && departures && departures.length > 0 && (
          <p className="text-xs text-center text-muted-foreground">
            Pilih tanggal keberangkatan untuk melanjutkan
          </p>
        )}
        {selectedDeparture && totalPassengers === 0 && (
          <p className="text-xs text-center text-muted-foreground">
            Pilih jumlah jamaah per tipe kamar
          </p>
        )}
      </CardContent>
    </Card>
  );
}
