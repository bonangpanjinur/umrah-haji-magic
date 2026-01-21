import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function BookingPage() {
  const { packageId } = useParams();

  const { data: pkg, isLoading } = useQuery({
    queryKey: ['package-booking', packageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('packages')
        .select('id, name, package_type, duration_days, featured_image')
        .eq('id', packageId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!packageId,
  });

  return (
    <PublicLayout>
      <div className="container py-8 max-w-4xl">
        {/* Back Button */}
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link to={`/packages/${packageId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Detail Paket
          </Link>
        </Button>

        {/* Header */}
        {isLoading ? (
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-5 w-48" />
          </div>
        ) : pkg && (
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Booking: {pkg.name}</h1>
            <p className="text-muted-foreground">
              {pkg.duration_days} Hari • {pkg.package_type.replace('_', ' ').toUpperCase()}
            </p>
          </div>
        )}

        {/* Wizard */}
        <BookingWizard />
      </div>
    </PublicLayout>
  );
}
