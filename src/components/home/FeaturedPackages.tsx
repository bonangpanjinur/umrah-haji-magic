import { usePackages } from '@/hooks/usePackages';
import { PackageCard } from '@/components/packages/PackageCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function FeaturedPackages() {
  const { data: packages = [], isLoading } = usePackages();
  
  // Get featured packages or first 3
  const featuredPackages = packages
    .filter(p => p.is_featured)
    .slice(0, 3);
  
  const displayPackages = featuredPackages.length > 0 
    ? featuredPackages 
    : packages.slice(0, 3);

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Paket Unggulan
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            Pilihan Paket Terbaik Untuk Anda
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Temukan berbagai pilihan paket Umroh dan Haji dengan fasilitas terbaik, 
            harga kompetitif, dan pelayanan profesional.
          </p>
        </div>

        {/* Package Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
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
        ) : displayPackages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayPackages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Belum ada paket tersedia saat ini.</p>
          </div>
        )}

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link to="/packages">
              Lihat Semua Paket
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
