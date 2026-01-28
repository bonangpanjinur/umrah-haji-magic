import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DynamicPublicLayout } from '@/components/layout/DynamicPublicLayout';
import { PackageSearch } from '@/components/packages/PackageSearch';
import { PackageCard } from '@/components/packages/PackageCard';
import { usePackages } from '@/hooks/usePackages';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Grid3X3, List, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export default function PackageList() {
  const [searchParams] = useSearchParams();
  const { data: packages = [], isLoading } = usePackages();
  const [sortBy, setSortBy] = useState('price_asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter from URL params
  const typeFilter = searchParams.get('type');

  // Apply filters
  let filteredPackages = [...packages];
  
  if (typeFilter && typeFilter !== 'all') {
    filteredPackages = filteredPackages.filter(p => p.package_type === typeFilter);
  }

  // Sort packages
  filteredPackages.sort((a, b) => {
    switch (sortBy) {
      case 'price_asc':
        return a.price_quad - b.price_quad;
      case 'price_desc':
        return b.price_quad - a.price_quad;
      case 'duration_asc':
        return a.duration_days - b.duration_days;
      case 'duration_desc':
        return b.duration_days - a.duration_days;
      case 'name_asc':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  return (
    <DynamicPublicLayout>
      {/* Header */}
      <section className="bg-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Katalog Paket Umroh & Haji
          </h1>
          <p className="text-white/90 max-w-2xl mx-auto">
            Temukan paket perjalanan ibadah yang sesuai dengan kebutuhan dan budget Anda
          </p>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="border-b bg-background sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {/* Mobile Filter */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="md:hidden gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filter
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Filter Paket</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <PackageSearch />
                  </div>
                </SheetContent>
              </Sheet>

              <p className="text-sm text-muted-foreground hidden sm:block">
                Menampilkan <span className="font-medium text-foreground">{filteredPackages.length}</span> paket
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Urutkan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price_asc">Harga: Terendah</SelectItem>
                  <SelectItem value="price_desc">Harga: Tertinggi</SelectItem>
                  <SelectItem value="duration_asc">Durasi: Terpendek</SelectItem>
                  <SelectItem value="duration_desc">Durasi: Terlama</SelectItem>
                  <SelectItem value="name_asc">Nama: A-Z</SelectItem>
                </SelectContent>
              </Select>

              {/* View Toggle */}
              <div className="hidden md:flex items-center border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="rounded-r-none"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="rounded-l-none"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex gap-8">
            {/* Sidebar - Desktop */}
            <aside className="hidden md:block w-64 flex-shrink-0">
              <div className="sticky top-32">
                <PackageSearch />
              </div>
            </aside>

            {/* Package Grid */}
            <div className="flex-1">
              {isLoading ? (
                <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="rounded-xl overflow-hidden border bg-card">
                      <Skeleton className="h-48 w-full" />
                      <div className="p-6 space-y-4">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <div className="flex justify-between pt-4">
                          <Skeleton className="h-8 w-24" />
                          <Skeleton className="h-10 w-28" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredPackages.length > 0 ? (
                <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                  {filteredPackages.map((pkg) => (
                    <PackageCard key={pkg.id} pkg={pkg} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">📦</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Tidak Ada Paket Ditemukan
                  </h3>
                  <p className="text-muted-foreground">
                    Coba ubah filter pencarian Anda atau hubungi kami untuk paket custom.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </DynamicPublicLayout>
  );
}
