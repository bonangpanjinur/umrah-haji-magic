import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatPackageType } from "@/lib/format";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Edit, Eye, Package } from "lucide-react";

export default function AdminPackages() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: packages, isLoading } = useQuery({
    queryKey: ['admin-packages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('packages')
        .select(`
          *,
          airline:airlines(name),
          hotel_makkah:hotels!packages_hotel_makkah_id_fkey(name),
          hotel_madinah:hotels!packages_hotel_madinah_id_fkey(name),
          departures(id)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const filteredPackages = packages?.filter(pkg => {
    if (!searchTerm) return true;
    return pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           pkg.code.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Kelola Paket</h1>
          <p className="text-muted-foreground">Lihat dan kelola paket umroh & haji</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari paket..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Paket
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-64" />)}
        </div>
      ) : !filteredPackages || filteredPackages.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? 'Tidak ada paket yang cocok.' : 'Belum ada paket.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPackages.map((pkg) => (
            <Card key={pkg.id} className="overflow-hidden">
              <div className="aspect-video relative">
                <img
                  src={pkg.featured_image || '/placeholder.svg'}
                  alt={pkg.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 flex gap-1">
                  <Badge>{formatPackageType(pkg.package_type)}</Badge>
                  {pkg.is_featured && <Badge variant="secondary">Featured</Badge>}
                </div>
                {!pkg.is_active && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge variant="destructive">Nonaktif</Badge>
                  </div>
                )}
              </div>
              <CardContent className="p-4 space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">{pkg.code}</p>
                  <h3 className="font-semibold line-clamp-1">{pkg.name}</h3>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p>{pkg.duration_days} Hari</p>
                  <p>{(pkg.departures as any[])?.length || 0} jadwal keberangkatan</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Mulai dari</p>
                  <p className="font-bold text-primary">{formatCurrency(pkg.price_quad)}</p>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link to={`/packages/${pkg.id}`}>
                      <Eye className="h-4 w-4 mr-1" />
                      Lihat
                    </Link>
                  </Button>
                  <Button size="sm" className="flex-1">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
