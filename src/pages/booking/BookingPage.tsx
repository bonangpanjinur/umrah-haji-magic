import { DynamicPublicLayout } from "@/components/layout/DynamicPublicLayout";
import { BookingWizard } from "@/components/booking/BookingWizard";

export default function BookingPage() {
  return (
    <DynamicPublicLayout>
      <div className="container py-8 max-w-4xl">
        <BookingWizard />
      </div>
    </DynamicPublicLayout>
  );
}
