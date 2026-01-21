import { useState } from "react";
import { useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StepIndicator } from "./StepIndicator";
import { StepSelectDeparture } from "./steps/StepSelectDeparture";
import { StepPassengersSimple } from "./steps/StepPassengersSimple";
import { StepRoomSelection } from "./steps/StepRoomSelection";
import { StepReviewSimple } from "./steps/StepReviewSimple";
import { useBookingWizardSimple } from "@/hooks/useBookingWizardSimple";
import { Loader2, ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type BookingStep = 
  | 'departure'
  | 'passengers'
  | 'room'
  | 'review';

const STEPS: { id: BookingStep; label: string }[] = [
  { id: 'departure', label: 'Keberangkatan' },
  { id: 'passengers', label: 'Data Jamaah' },
  { id: 'room', label: 'Kamar' },
  { id: 'review', label: 'Review' },
];

export function BookingWizard() {
  const { packageId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  
  const initialDepartureId = searchParams.get('departure') || undefined;
  
  // Fetch package info
  const { data: packageInfo } = useQuery({
    queryKey: ['package-info', packageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('packages')
        .select('id, name, code, duration_days, package_type')
        .eq('id', packageId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!packageId,
  });

  const {
    currentStep,
    setCurrentStep,
    formData,
    updateFormData,
    isSubmitting,
    submitBooking,
  } = useBookingWizardSimple(packageId!, initialDepartureId);

  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex].id);
    }
  };

  const handlePrev = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex].id);
    }
  };

  const handleSubmit = async () => {
    const result = await submitBooking();
    if (result?.bookingId) {
      navigate(`/booking/success/${result.bookingId}`);
    }
  };

  // Redirect to login if not authenticated
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <Card className="max-w-lg mx-auto">
        <CardContent className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Login Diperlukan</h2>
          <p className="text-muted-foreground mb-6">
            Silakan login terlebih dahulu untuk melanjutkan pemesanan.
          </p>
          <Button onClick={() => navigate(`/auth/login?redirect=/booking/${packageId}`)}>
            Login Sekarang
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button & Title */}
      <div>
        <Button variant="outline" size="sm" asChild className="mb-4">
          <Link to={`/packages/${packageId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Detail Paket
          </Link>
        </Button>
        {packageInfo && (
          <div>
            <h1 className="text-2xl font-bold">Booking: {packageInfo.name}</h1>
            <p className="text-muted-foreground">
              {packageInfo.duration_days} Hari • {packageInfo.package_type?.toUpperCase()}
            </p>
          </div>
        )}
      </div>

      {/* Step Indicator */}
      <StepIndicator steps={STEPS} currentStep={currentStep} />

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {currentStep === 'departure' && (
            <StepSelectDeparture
              packageId={packageId!}
              selectedDepartureId={formData.departureId}
              onSelect={(id) => updateFormData({ departureId: id })}
            />
          )}
          
          {currentStep === 'passengers' && (
            <StepPassengersSimple
              passengers={formData.passengers}
              onUpdate={(passengers) => updateFormData({ passengers })}
            />
          )}
          
          {currentStep === 'room' && (
            <StepRoomSelection
              packageId={packageId!}
              roomType={formData.roomType}
              onSelect={(roomType) => updateFormData({ roomType })}
            />
          )}
          
          {currentStep === 'review' && (
            <StepReviewSimple
              formData={formData}
              packageId={packageId!}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentStepIndex === 0}
        >
          Sebelumnya
        </Button>

        {currentStep === 'review' ? (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              'Konfirmasi Booking'
            )}
          </Button>
        ) : (
          <Button onClick={handleNext} disabled={!canProceed(currentStep, formData)}>
            Selanjutnya
          </Button>
        )}
      </div>
    </div>
  );
}

function canProceed(step: BookingStep, formData: any): boolean {
  switch (step) {
    case 'departure':
      return !!formData.departureId;
    case 'passengers':
      // Only require name for each passenger
      return formData.passengers.length > 0 && 
        formData.passengers.every((p: any) => p.fullName?.trim());
    case 'room':
      return !!formData.roomType;
    case 'review':
      return true;
    default:
      return false;
  }
}
