import { Route } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import BookingPage from "@/pages/booking/BookingPage";
import BookingSuccess from "@/pages/booking/BookingSuccess";
import MyBookings from "@/pages/customer/MyBookings";
import BookingDetail from "@/pages/customer/BookingDetail";
import PaymentUpload from "@/pages/customer/PaymentUpload";
import MySavings from "@/pages/customer/MySavings";
import MyLoyalty from "@/pages/customer/MyLoyalty";
import SavingsSuccess from "@/pages/savings/SavingsSuccess";
import JamaahPortal from "@/pages/jamaah/JamaahPortal";
import JamaahDigitalID from "@/pages/jamaah/JamaahDigitalID";
import JamaahDoaPanduan from "@/pages/jamaah/JamaahDoaPanduan";
import JamaahItinerary from "@/pages/jamaah/JamaahItinerary";

export default function CustomerRoutes() {
  return (
    <>
      {/* Savings Protected */}
      <Route path="/savings/success/:planId" element={<ProtectedRoute><SavingsSuccess /></ProtectedRoute>} />
      <Route path="/customer/my-savings" element={<ProtectedRoute><MySavings /></ProtectedRoute>} />
      <Route path="/customer/my-loyalty" element={<ProtectedRoute><MyLoyalty /></ProtectedRoute>} />

      {/* Jamaah Portal */}
      <Route path="/jamaah" element={<ProtectedRoute><JamaahPortal /></ProtectedRoute>} />
      <Route path="/jamaah/digital-id" element={<ProtectedRoute><JamaahDigitalID /></ProtectedRoute>} />
      <Route path="/jamaah/doa-panduan" element={<ProtectedRoute><JamaahDoaPanduan /></ProtectedRoute>} />
      <Route path="/jamaah/itinerary" element={<ProtectedRoute><JamaahItinerary /></ProtectedRoute>} />

      {/* Booking */}
      <Route path="/booking/:packageId" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
      <Route path="/booking/success/:bookingId" element={<ProtectedRoute><BookingSuccess /></ProtectedRoute>} />
      <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
      <Route path="/my-bookings/:bookingId" element={<ProtectedRoute><BookingDetail /></ProtectedRoute>} />
      <Route path="/my-bookings/:bookingId/payment" element={<ProtectedRoute><PaymentUpload /></ProtectedRoute>} />
    </>
  );
}
