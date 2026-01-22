import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { formatDate } from "@/lib/format";
import { Users, UserPlus, BedDouble, Search, Check, X } from "lucide-react";

interface Passenger {
  id: string;
  room_preference: string | null;
  passenger_type: string | null;
  room_number: string | null;
  roommate_id: string | null;
  customer: {
    id: string;
    full_name: string;
    gender: string | null;
    phone: string | null;
  };
  booking: {
    id: string;
    booking_code: string;
  };
}

export default function AdminRoomAssignments() {
  const queryClient = useQueryClient();
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [selectedDeparture, setSelectedDeparture] = useState<string>("");
  const [pairingDialogOpen, setPairingDialogOpen] = useState(false);
  const [selectedPassenger, setSelectedPassenger] = useState<Passenger | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch packages that have departures
  const { data: packages, isLoading: loadingPackages } = useQuery({
    queryKey: ['packages-for-rooms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('packages')
        .select(`
          id,
          name,
          code
        `)
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Fetch departures for selected package
  const { data: departures, isLoading: loadingDepartures } = useQuery({
    queryKey: ['departures-for-rooms', selectedPackage],
    enabled: !!selectedPackage,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departures')
        .select(`
          id,
          departure_date,
          return_date,
          status
        `)
        .eq('package_id', selectedPackage)
        .gte('departure_date', new Date().toISOString().split('T')[0])
        .order('departure_date', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Reset departure when package changes
  const handlePackageChange = (packageId: string) => {
    setSelectedPackage(packageId);
    setSelectedDeparture("");
  };

  // Fetch passengers with double/sharing room preference
  const { data: passengers, isLoading: loadingPassengers } = useQuery({
    queryKey: ['room-passengers', selectedDeparture],
    enabled: !!selectedDeparture,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('booking_passengers')
        .select(`
          id,
          room_preference,
          passenger_type,
          room_number,
          roommate_id,
          customer:customers(id, full_name, gender, phone),
          booking:bookings!inner(id, booking_code, departure_id, booking_status)
        `)
        .eq('booking.departure_id', selectedDeparture)
        .in('booking.booking_status', ['confirmed', 'pending'])
        .eq('room_preference', 'double');

      if (error) throw error;
      return data as unknown as Passenger[];
    },
  });

  // Mutation to pair passengers
  const pairMutation = useMutation({
    mutationFn: async ({ passengerId, roommateId, roomNumber }: { 
      passengerId: string; 
      roommateId: string; 
      roomNumber?: string;
    }) => {
      // Update both passengers to be each other's roommates
      const updates = [
        supabase
          .from('booking_passengers')
          .update({ 
            roommate_id: roommateId,
            room_number: roomNumber || null
          })
          .eq('id', passengerId),
        supabase
          .from('booking_passengers')
          .update({ 
            roommate_id: passengerId,
            room_number: roomNumber || null
          })
          .eq('id', roommateId),
      ];

      const results = await Promise.all(updates);
      results.forEach(r => {
        if (r.error) throw r.error;
      });
    },
    onSuccess: () => {
      toast.success("Berhasil memasangkan jamaah!");
      queryClient.invalidateQueries({ queryKey: ['room-passengers'] });
      setPairingDialogOpen(false);
      setSelectedPassenger(null);
    },
    onError: (error) => {
      toast.error("Gagal memasangkan: " + error.message);
    },
  });

  // Mutation to unpair
  const unpairMutation = useMutation({
    mutationFn: async (passengerId: string) => {
      const passenger = passengers?.find(p => p.id === passengerId);
      if (!passenger?.roommate_id) return;

      // Remove roommate from both
      const updates = [
        supabase
          .from('booking_passengers')
          .update({ roommate_id: null, room_number: null })
          .eq('id', passengerId),
        supabase
          .from('booking_passengers')
          .update({ roommate_id: null, room_number: null })
          .eq('id', passenger.roommate_id),
      ];

      const results = await Promise.all(updates);
      results.forEach(r => {
        if (r.error) throw r.error;
      });
    },
    onSuccess: () => {
      toast.success("Berhasil membatalkan pasangan kamar!");
      queryClient.invalidateQueries({ queryKey: ['room-passengers'] });
    },
  });

  // Get unpaired passengers for selection
  const unpairedPassengers = passengers?.filter(p => 
    !p.roommate_id && 
    p.id !== selectedPassenger?.id &&
    p.customer?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Get paired passengers grouped
  const pairedGroups: Passenger[][] = [];
  const processedIds = new Set<string>();
  
  passengers?.forEach(p => {
    if (p.roommate_id && !processedIds.has(p.id)) {
      const roommate = passengers.find(r => r.id === p.roommate_id);
      if (roommate) {
        pairedGroups.push([p, roommate]);
        processedIds.add(p.id);
        processedIds.add(roommate.id);
      }
    }
  });

  const unpairedList = passengers?.filter(p => !p.roommate_id) || [];

  const handleOpenPairing = (passenger: Passenger) => {
    setSelectedPassenger(passenger);
    setSearchQuery("");
    setPairingDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pengaturan Kamar</h1>
          <p className="text-muted-foreground">
            Atur penempatan kamar untuk jamaah dengan tipe Double/Sharing
          </p>
        </div>
      </div>

      {/* Departure Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BedDouble className="h-5 w-5" />
            Pilih Keberangkatan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Package Selector */}
            <div className="flex-1">
              <Label className="text-sm text-muted-foreground mb-2 block">1. Pilih Paket</Label>
              <Select value={selectedPackage} onValueChange={handlePackageChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih paket..." />
                </SelectTrigger>
                <SelectContent>
                  {packages?.map((pkg) => (
                    <SelectItem key={pkg.id} value={pkg.id}>
                      {pkg.name} ({pkg.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Departure Selector */}
            <div className="flex-1">
              <Label className="text-sm text-muted-foreground mb-2 block">2. Pilih Keberangkatan</Label>
              <Select 
                value={selectedDeparture} 
                onValueChange={setSelectedDeparture}
                disabled={!selectedPackage}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedPackage ? "Pilih keberangkatan..." : "Pilih paket terlebih dahulu"} />
                </SelectTrigger>
                <SelectContent>
                  {departures?.length === 0 ? (
                    <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                      Tidak ada keberangkatan untuk paket ini
                    </div>
                  ) : (
                    departures?.map((dep) => (
                      <SelectItem key={dep.id} value={dep.id}>
                        {formatDate(dep.departure_date)} - {formatDate(dep.return_date)}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedDeparture && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-blue-500/10">
                    <Users className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{passengers?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Total Double/Sharing</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-green-500/10">
                    <Check className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{pairedGroups.length * 2}</p>
                    <p className="text-sm text-muted-foreground">Sudah Dipasangkan</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-orange-500/10">
                    <X className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{unpairedList.length}</p>
                    <p className="text-sm text-muted-foreground">Belum Dipasangkan</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Unpaired Passengers */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-orange-600">
                Jamaah Belum Dipasangkan ({unpairedList.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingPassengers ? (
                <p className="text-muted-foreground">Memuat data...</p>
              ) : unpairedList.length === 0 ? (
                <p className="text-muted-foreground">Semua jamaah sudah dipasangkan!</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>No. HP</TableHead>
                      <TableHead>Kode Booking</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unpairedList.map((passenger) => (
                      <TableRow key={passenger.id}>
                        <TableCell className="font-medium">
                          {passenger.customer?.full_name}
                        </TableCell>
                        <TableCell>
                          <Badge variant={passenger.customer?.gender === 'male' ? 'default' : 'secondary'}>
                            {passenger.customer?.gender === 'male' ? 'Laki-laki' : 'Perempuan'}
                          </Badge>
                        </TableCell>
                        <TableCell>{passenger.customer?.phone || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{passenger.booking?.booking_code}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            size="sm" 
                            onClick={() => handleOpenPairing(passenger)}
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            Pasangkan
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Paired Passengers */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-green-600">
                Jamaah Sudah Dipasangkan ({pairedGroups.length} kamar)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pairedGroups.length === 0 ? (
                <p className="text-muted-foreground">Belum ada jamaah yang dipasangkan.</p>
              ) : (
                <div className="space-y-4">
                  {pairedGroups.map((group, idx) => (
                    <div 
                      key={idx}
                      className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <BedDouble className="h-5 w-5 text-green-600" />
                          <span className="font-medium">
                            Kamar {group[0].room_number || `#${idx + 1}`}
                          </span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => unpairMutation.mutate(group[0].id)}
                          disabled={unpairMutation.isPending}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Batalkan
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {group.map((p) => (
                          <div key={p.id} className="flex items-center gap-3 p-3 bg-background rounded-lg">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="font-semibold text-primary">
                                {p.customer?.full_name?.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{p.customer?.full_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {p.customer?.gender === 'male' ? 'Laki-laki' : 'Perempuan'} • {p.booking?.booking_code}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Pairing Dialog */}
      <PairingDialog
        open={pairingDialogOpen}
        onOpenChange={setPairingDialogOpen}
        selectedPassenger={selectedPassenger}
        unpairedPassengers={unpairedPassengers}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onPair={(roommateId, roomNumber) => {
          if (selectedPassenger) {
            pairMutation.mutate({
              passengerId: selectedPassenger.id,
              roommateId,
              roomNumber,
            });
          }
        }}
        isPairing={pairMutation.isPending}
      />
    </div>
  );
}

interface PairingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPassenger: Passenger | null;
  unpairedPassengers: Passenger[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onPair: (roommateId: string, roomNumber?: string) => void;
  isPairing: boolean;
}

function PairingDialog({
  open,
  onOpenChange,
  selectedPassenger,
  unpairedPassengers,
  searchQuery,
  onSearchChange,
  onPair,
  isPairing,
}: PairingDialogProps) {
  const [selectedRoommate, setSelectedRoommate] = useState<string>("");
  const [roomNumber, setRoomNumber] = useState("");

  const handlePair = () => {
    if (selectedRoommate) {
      onPair(selectedRoommate, roomNumber);
    }
  };

  // Filter by same gender
  const sameGenderPassengers = unpairedPassengers.filter(
    p => p.customer?.gender === selectedPassenger?.customer?.gender
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Pasangkan Jamaah</DialogTitle>
        </DialogHeader>

        {selectedPassenger && (
          <div className="space-y-4">
            {/* Selected Passenger Info */}
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Jamaah yang dipilih:</p>
              <p className="font-medium">{selectedPassenger.customer?.full_name}</p>
              <p className="text-sm">
                {selectedPassenger.customer?.gender === 'male' ? 'Laki-laki' : 'Perempuan'}
              </p>
            </div>

            {/* Room Number Input */}
            <div>
              <Label>Nomor Kamar (opsional)</Label>
              <Input 
                placeholder="Contoh: 301"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
              />
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari jamaah..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>

            {/* Roommate Selection */}
            <div className="max-h-[300px] overflow-y-auto space-y-2">
              {sameGenderPassengers.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Tidak ada jamaah dengan gender yang sama.
                </p>
              ) : (
                sameGenderPassengers.map((p) => (
                  <div
                    key={p.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedRoommate === p.id 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => setSelectedRoommate(p.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox checked={selectedRoommate === p.id} />
                        <div>
                          <p className="font-medium">{p.customer?.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {p.booking?.booking_code} • {p.customer?.phone || 'Tanpa HP'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button 
            onClick={handlePair} 
            disabled={!selectedRoommate || isPairing}
          >
            Pasangkan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}