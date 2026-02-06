import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Users, Clock, MapPin, Calendar, Plus, Search, UserCheck, UserX, Camera } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface Employee {
  id: string;
  employee_code: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  position: string | null;
  department: string | null;
  photo_url: string | null;
  is_active: boolean;
  hire_date: string | null;
  gender: string | null;
  salary: number | null;
}

interface AttendanceRecord {
  id: string;
  employee_id: string;
  attendance_date: string;
  check_in_time: string | null;
  check_in_location: { lat: number; lng: number; address?: string } | null;
  check_in_photo_url: string | null;
  check_out_time: string | null;
  check_out_location: { lat: number; lng: number; address?: string } | null;
  check_out_photo_url: string | null;
  status: string;
  verified_by: string | null;
  employee?: Employee;
}

const positionLabels: Record<string, string> = {
  staff: "Staff",
  muthawif: "Muthawif",
  tour_leader: "Tour Leader",
  driver: "Driver",
  admin: "Admin",
  manager: "Manager",
};

const departmentLabels: Record<string, string> = {
  operations: "Operasional",
  finance: "Keuangan",
  sales: "Penjualan",
  marketing: "Marketing",
  hr: "HRD",
};

export default function AdminHR() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("employees");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPosition, setFilterPosition] = useState("all");
  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [attendanceDate, setAttendanceDate] = useState(format(new Date(), "yyyy-MM-dd"));

  // Fetch employees
  const { data: employees = [], isLoading: loadingEmployees } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .order("full_name");
      if (error) throw error;
      return data as Employee[];
    },
  });

  // Fetch attendance records
  const { data: attendanceRecords = [], isLoading: loadingAttendance } = useQuery({
    queryKey: ["attendance-records", attendanceDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance_records")
        .select("*, employee:employees(*)")
        .eq("attendance_date", attendanceDate)
        .order("check_in_time", { ascending: false });
      if (error) throw error;
      return data as unknown as AttendanceRecord[];
    },
  });

  // Save employee mutation
  const saveEmployeeMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const genderValue = formData.get("gender") as string;
      const employeeData: {
        full_name: string;
        email: string | null;
        phone: string | null;
        position: string | null;
        department: string | null;
        gender: "male" | "female" | null;
        is_active: boolean;
      } = {
        full_name: formData.get("full_name") as string,
        email: formData.get("email") as string || null,
        phone: formData.get("phone") as string || null,
        position: formData.get("position") as string || null,
        department: formData.get("department") as string || null,
        gender: genderValue === "male" || genderValue === "female" ? genderValue : null,
        is_active: true,
      };

      if (editingEmployee?.id) {
        const { error } = await supabase
          .from("employees")
          .update(employeeData)
          .eq("id", editingEmployee.id);
        if (error) throw error;
      } else {
        // Use database function to generate employee code
        const { data: codeData } = await supabase.rpc("generate_employee_code");
        const code = codeData || `EMP${format(new Date(), "yyMM")}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        const { error } = await supabase
          .from("employees")
          .insert([{ ...employeeData, employee_code: code }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Karyawan berhasil disimpan");
      setIsEmployeeDialogOpen(false);
      setEditingEmployee(null);
    },
    onError: (error: Error) => toast.error("Gagal: " + error.message),
  });

  const filteredEmployees = employees.filter((emp) => {
    const matchSearch = emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employee_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchPosition = filterPosition === "all" || emp.position === filterPosition;
    return matchSearch && matchPosition;
  });

  // Stats
  const stats = {
    totalEmployees: employees.length,
    activeEmployees: employees.filter((e) => e.is_active).length,
    presentToday: attendanceRecords.filter((a) => a.status === "present").length,
    lateToday: attendanceRecords.filter((a) => a.status === "late").length,
  };

  const handleSubmitEmployee = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    saveEmployeeMutation.mutate(new FormData(e.currentTarget));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">HR & Absensi</h1>
          <p className="text-muted-foreground">Kelola karyawan, muthawif, dan kehadiran</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.totalEmployees}</p>
                <p className="text-sm text-muted-foreground">Total Karyawan</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <UserCheck className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.activeEmployees}</p>
                <p className="text-sm text-muted-foreground">Aktif</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.presentToday}</p>
                <p className="text-sm text-muted-foreground">Hadir Hari Ini</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <UserX className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{stats.lateToday}</p>
                <p className="text-sm text-muted-foreground">Terlambat</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="employees">Karyawan</TabsTrigger>
          <TabsTrigger value="attendance">Kehadiran</TabsTrigger>
          <TabsTrigger value="schedules">Jadwal Kerja</TabsTrigger>
        </TabsList>

        {/* Employees Tab */}
        <TabsContent value="employees" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-2 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari karyawan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterPosition} onValueChange={setFilterPosition}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Posisi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Posisi</SelectItem>
                  {Object.entries(positionLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setIsEmployeeDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Karyawan
            </Button>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Karyawan</TableHead>
                  <TableHead>Kode</TableHead>
                  <TableHead>Posisi</TableHead>
                  <TableHead>Departemen</TableHead>
                  <TableHead>Kontak</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={emp.photo_url || ""} />
                          <AvatarFallback>{emp.full_name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{emp.full_name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{emp.employee_code}</TableCell>
                    <TableCell>{positionLabels[emp.position] || emp.position}</TableCell>
                    <TableCell>{departmentLabels[emp.department || ""] || "-"}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {emp.phone && <p>{emp.phone}</p>}
                        {emp.email && <p className="text-muted-foreground">{emp.email}</p>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={emp.is_active ? "default" : "secondary"}>
                        {emp.is_active ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingEmployee(emp);
                          setIsEmployeeDialogOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredEmployees.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Tidak ada data karyawan
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label>Tanggal:</Label>
              <Input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="w-auto"
              />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Rekap Kehadiran - {format(new Date(attendanceDate), "dd MMMM yyyy", { locale: id })}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Karyawan</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Lokasi Masuk</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Face Verified</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{(record.employee as any)?.full_name?.[0] || "?"}</AvatarFallback>
                          </Avatar>
                          <span>{(record.employee as any)?.full_name || "Unknown"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {record.check_in_time
                          ? format(new Date(record.check_in_time), "HH:mm")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {record.check_in_location ? (
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3" />
                            {record.check_in_location.address || `${record.check_in_location.lat}, ${record.check_in_location.lng}`}
                          </div>
                        ) : "-"}
                      </TableCell>
                      <TableCell>
                        {record.check_out_time
                          ? format(new Date(record.check_out_time), "HH:mm")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            record.status === "present"
                              ? "default"
                              : record.status === "late"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {record.status === "present"
                            ? "Hadir"
                            : record.status === "late"
                            ? "Terlambat"
                            : record.status === "absent"
                            ? "Tidak Hadir"
                            : record.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {record.check_in_photo_url ? (
                          <Badge variant="outline" className="text-green-600">
                            <Camera className="h-3 w-3 mr-1" /> Foto
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {attendanceRecords.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        Belum ada data kehadiran untuk tanggal ini
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedules Tab */}
        <TabsContent value="schedules">
          <Card className="p-8 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Fitur jadwal kerja akan segera tersedia</p>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Employee Dialog */}
      <Dialog open={isEmployeeDialogOpen} onOpenChange={setIsEmployeeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEmployee ? "Edit Karyawan" : "Tambah Karyawan"}</DialogTitle>
            <DialogDescription>Isi data karyawan atau muthawif</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEmployee} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nama Lengkap *</Label>
              <Input
                id="full_name"
                name="full_name"
                defaultValue={editingEmployee?.full_name || ""}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">Posisi *</Label>
                <Select name="position" defaultValue={editingEmployee?.position || "staff"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(positionLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Departemen</Label>
                <Select name="department" defaultValue={editingEmployee?.department || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih departemen" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(departmentLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">No. Telepon</Label>
                <Input
                  id="phone"
                  name="phone"
                  defaultValue={editingEmployee?.phone || ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={editingEmployee?.email || ""}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEmployeeDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={saveEmployeeMutation.isPending}>
                {saveEmployeeMutation.isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
