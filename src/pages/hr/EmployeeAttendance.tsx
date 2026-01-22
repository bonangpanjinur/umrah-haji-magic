import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { MapPin, Clock, Camera, CheckCircle, LogIn, LogOut, Loader2, WifiOff, Wifi } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface LocationData {
  lat: number;
  lng: number;
  accuracy: number;
  address?: string;
}

export default function EmployeeAttendance() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Fetch employee data
  const { data: employee } = useQuery({
    queryKey: ["employee-self", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("employees" as any)
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
    enabled: !!user?.id,
  });

  // Fetch today's attendance
  const { data: todayAttendance } = useQuery({
    queryKey: ["today-attendance", employee?.id],
    queryFn: async () => {
      if (!employee?.id) return null;
      const today = format(new Date(), "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("attendance_records" as any)
        .select("*")
        .eq("employee_id", employee.id)
        .eq("attendance_date", today)
        .is("departure_id", null)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
    enabled: !!employee?.id,
  });

  // Get current location
  const getLocation = () => {
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError("Geolocation tidak didukung browser ini");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const loc: LocationData = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };

        // Try to get address using reverse geocoding
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${loc.lat}&lon=${loc.lng}`
          );
          const data = await response.json();
          loc.address = data.display_name?.split(",").slice(0, 3).join(", ");
        } catch {
          // Ignore geocoding errors
        }

        setLocation(loc);
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Akses lokasi ditolak. Mohon izinkan akses lokasi.");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Informasi lokasi tidak tersedia.");
            break;
          case error.TIMEOUT:
            setLocationError("Request lokasi timeout.");
            break;
          default:
            setLocationError("Gagal mendapatkan lokasi.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Start camera
  const startCamera = async () => {
    setIsCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      toast.error("Gagal mengakses kamera");
      setIsCapturing(false);
    }
  };

  // Capture photo
  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const photo = canvas.toDataURL("image/jpeg", 0.8);
      setCapturedPhoto(photo);

      // Stop camera
      const stream = videoRef.current.srcObject as MediaStream;
      stream?.getTracks().forEach((track) => track.stop());
      setIsCapturing(false);
    }
  };

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: async () => {
      if (!employee?.id || !location) throw new Error("Data tidak lengkap");

      const today = format(new Date(), "yyyy-MM-dd");
      const now = new Date().toISOString();
      const isLate = new Date().getHours() >= 9; // After 9 AM is late

      const { error } = await supabase.from("attendance_records" as any).insert({
        employee_id: employee.id,
        attendance_date: today,
        check_in_time: now,
        check_in_location: location,
        check_in_photo_url: capturedPhoto,
        check_in_face_verified: !!capturedPhoto,
        status: isLate ? "late" : "present",
      } as any);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["today-attendance"] });
      toast.success("Check-in berhasil!");
      setCapturedPhoto(null);
    },
    onError: (error: Error) => toast.error("Gagal check-in: " + error.message),
  });

  // Check-out mutation
  const checkOutMutation = useMutation({
    mutationFn: async () => {
      if (!todayAttendance?.id || !location) throw new Error("Data tidak lengkap");

      const { error } = await supabase
        .from("attendance_records" as any)
        .update({
          check_out_time: new Date().toISOString(),
          check_out_location: location,
          check_out_photo_url: capturedPhoto,
          check_out_face_verified: !!capturedPhoto,
        })
        .eq("id", todayAttendance.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["today-attendance"] });
      toast.success("Check-out berhasil!");
      setCapturedPhoto(null);
    },
    onError: (error: Error) => toast.error("Gagal check-out: " + error.message),
  });

  // Auto-get location on mount
  useEffect(() => {
    getLocation();
  }, []);

  const hasCheckedIn = !!todayAttendance?.check_in_time;
  const hasCheckedOut = !!todayAttendance?.check_out_time;

  if (!employee) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <Card className="max-w-md w-full p-8 text-center">
          <p className="text-muted-foreground">Anda belum terdaftar sebagai karyawan</p>
          <p className="text-sm text-muted-foreground mt-2">Hubungi admin untuk mendaftarkan data karyawan</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-primary-foreground/20">
              <AvatarImage src={(employee as any)?.photo_url || ""} />
              <AvatarFallback className="bg-primary-foreground/10">
                {(employee as any)?.full_name?.[0] || "E"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{(employee as any)?.full_name}</p>
              <p className="text-xs opacity-80">{(employee as any)?.employee_code}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm">
            {isOnline ? (
              <>
                <Wifi className="h-4 w-4" />
                <span>Online</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4" />
                <span>Offline</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Date & Time */}
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">{format(new Date(), "HH:mm")}</p>
            <p className="text-muted-foreground">
              {format(new Date(), "EEEE, dd MMMM yyyy", { locale: id })}
            </p>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Status Hari Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1 text-center p-3 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">Check In</p>
                {hasCheckedIn ? (
                  <p className="font-bold text-green-600">
                    {format(new Date(todayAttendance.check_in_time), "HH:mm")}
                  </p>
                ) : (
                  <p className="text-muted-foreground">-</p>
                )}
              </div>
              <div className="flex-1 text-center p-3 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">Check Out</p>
                {hasCheckedOut ? (
                  <p className="font-bold text-blue-600">
                    {format(new Date(todayAttendance.check_out_time), "HH:mm")}
                  </p>
                ) : (
                  <p className="text-muted-foreground">-</p>
                )}
              </div>
              <div className="flex-1 text-center p-3 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">Status</p>
                {hasCheckedIn ? (
                  <Badge variant={todayAttendance.status === "late" ? "secondary" : "default"}>
                    {todayAttendance.status === "late" ? "Terlambat" : "Hadir"}
                  </Badge>
                ) : (
                  <Badge variant="destructive">Belum</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Lokasi
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={getLocation}>
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {locationError ? (
              <p className="text-sm text-destructive">{locationError}</p>
            ) : location ? (
              <div className="text-sm">
                <p className="font-medium">{location.address || "Lokasi terdeteksi"}</p>
                <p className="text-muted-foreground text-xs">
                  {location.lat.toFixed(6)}, {location.lng.toFixed(6)} (±{location.accuracy.toFixed(0)}m)
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Mendapatkan lokasi...</p>
            )}
          </CardContent>
        </Card>

        {/* Camera */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Foto Selfie (Opsional)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isCapturing ? (
              <div className="space-y-2">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full rounded-lg"
                />
                <Button onClick={capturePhoto} className="w-full">
                  <Camera className="h-4 w-4 mr-2" />
                  Ambil Foto
                </Button>
              </div>
            ) : capturedPhoto ? (
              <div className="space-y-2">
                <img src={capturedPhoto} alt="Captured" className="w-full rounded-lg" />
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setCapturedPhoto(null)} className="flex-1">
                    Ulangi
                  </Button>
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Foto OK
                  </Badge>
                </div>
              </div>
            ) : (
              <Button variant="outline" onClick={startCamera} className="w-full">
                <Camera className="h-4 w-4 mr-2" />
                Buka Kamera
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-2">
          {!hasCheckedIn ? (
            <Button
              onClick={() => checkInMutation.mutate()}
              disabled={!location || checkInMutation.isPending}
              className="w-full h-14 text-lg"
            >
              {checkInMutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <LogIn className="h-5 w-5 mr-2" />
              )}
              CHECK IN
            </Button>
          ) : !hasCheckedOut ? (
            <Button
              onClick={() => checkOutMutation.mutate()}
              disabled={!location || checkOutMutation.isPending}
              variant="secondary"
              className="w-full h-14 text-lg"
            >
              {checkOutMutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <LogOut className="h-5 w-5 mr-2" />
              )}
              CHECK OUT
            </Button>
          ) : (
            <Card className="p-4 text-center bg-green-50 border-green-200">
              <CheckCircle className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <p className="font-medium text-green-700">Absensi hari ini selesai</p>
              <p className="text-sm text-green-600">
                {format(new Date(todayAttendance.check_in_time), "HH:mm")} - {format(new Date(todayAttendance.check_out_time), "HH:mm")}
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
