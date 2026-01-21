import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import PackageList from "./pages/packages/PackageList";
import PackageDetail from "./pages/packages/PackageDetail";
import BookingPage from "./pages/booking/BookingPage";
import BookingSuccess from "./pages/booking/BookingSuccess";
import MyBookings from "./pages/customer/MyBookings";
import BookingDetail from "./pages/customer/BookingDetail";
import PaymentUpload from "./pages/customer/PaymentUpload";
import { AdminLayout } from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPackages from "./pages/admin/AdminPackages";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/packages" element={<PackageList />} />
            <Route path="/packages/:id" element={<PackageDetail />} />
            <Route path="/booking/:packageId" element={<BookingPage />} />
            <Route path="/booking/success/:bookingId" element={<BookingSuccess />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/my-bookings/:bookingId" element={<BookingDetail />} />
            <Route path="/my-bookings/:bookingId/payment" element={<PaymentUpload />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="packages" element={<AdminPackages />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
