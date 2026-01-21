import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Calendar, Users, BedDouble, Minus, Plus, Loader2 } from "lucide-react";
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

const ROOM_OPTIONS: { type: RoomType; label: string; occupancy: string }[] = [
  { type: 'quad', label: 'Quad', occupancy: '4 orang/kamar' },
  { type: 'triple', label: 'Triple', occupancy: '3 orang/kamar' },
  { type: 'double', label: 'Double', occupancy: '2 orang/kamar' },
  { type: 'single', label: 'Single', occupancy: '1 orang/kamar' },
];

export function PackageBookingForm({ packageId, prices }: PackageBookingFormProps) {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  
  const [selectedDeparture, setSelectedDeparture] = useState<string>("");
  const [selectedRoom, setSelectedRoom] = useState<RoomType>("quad");
  const [passengerCount, setPassengerCount] = useState(1);

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
    : 0;

  const pricePerPerson = prices[selectedRoom];
  const totalPrice = pricePerPerson * passengerCount;

  const handleProceed = () => {
    if (!user) {
      navigate(`/auth/login?redirect=/packages/${packageId}`);
      return;
    }

    // Navigate to booking with pre-selected options
    const params = new URLSearchParams({
      departure: selectedDeparture,
      room: selectedRoom,
      pax: passengerCount.toString(),
    });
    navigate(`/booking/${packageId}?${params.toString()}`);
  };

  const canProceed = selectedDeparture && selectedRoom && passengerCount > 0;

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

        {/* 2. Pilih Tipe Kamar */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <BedDouble className="h-4 w-4 text-primary" />
            Tipe Kamar
          </Label>
          <RadioGroup 
            value={selectedRoom} 
            onValueChange={(val) => setSelectedRoom(val as RoomType)}
            className="grid grid-cols-2 gap-2"
          >
            {ROOM_OPTIONS.map((room) => {
              const isSelected = selectedRoom === room.type;
              const price = prices[room.type];
              return (
                <div key={room.type}>
                  <RadioGroupItem
                    value={room.type}
                    id={`room-${room.type}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`room-${room.type}`}
                    className={cn(
                      "flex flex-col p-3 rounded-lg border cursor-pointer transition-all text-center",
                      isSelected 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <span className="font-semibold text-sm">{room.label}</span>
                    <span className="text-xs text-muted-foreground">{room.occupancy}</span>
                    <span className="text-xs font-medium text-primary mt-1">
                      {formatCurrency(price)}
                    </span>
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </div>

        {/* 3. Jumlah Jamaah */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Users className="h-4 w-4 text-primary" />
            Jumlah Jamaah
          </Label>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <span className="text-sm">{passengerCount} Orang</span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPassengerCount(Math.max(1, passengerCount - 1))}
                disabled={passengerCount <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-medium">{passengerCount}</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPassengerCount(Math.min(availableSeats || 10, passengerCount + 1))}
                disabled={selectedDeparture ? passengerCount >= availableSeats : passengerCount >= 10}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Price Summary */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Harga per orang</span>
            <span>{formatCurrency(pricePerPerson)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Jumlah jamaah</span>
            <span>× {passengerCount}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg pt-2 border-t">
            <span>Total</span>
            <span className="text-primary">{formatCurrency(totalPrice)}</span>
          </div>
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
      </CardContent>
    </Card>
  );
}
