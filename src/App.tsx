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
import AdminPackageDetail from "./pages/admin/AdminPackageDetail";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminBookingDetail from "./pages/admin/AdminBookingDetail";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminCustomerDetail from "./pages/admin/AdminCustomerDetail";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAgents from "./pages/admin/AdminAgents";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminMasterData from "./pages/admin/AdminMasterData";
// Operational
import OperationalLayout from "./pages/operational/OperationalLayout";
import OperationalDashboard from "./pages/operational/OperationalDashboard";
import ManifestPage from "./pages/operational/ManifestPage";
import CheckinPage from "./pages/operational/CheckinPage";
import LuggagePage from "./pages/operational/LuggagePage";
// Agent
import AgentLayout from "./pages/agent/AgentLayout";
import AgentDashboard from "./pages/agent/AgentDashboard";
import AgentRegister from "./pages/agent/AgentRegister";
import AgentCommissions from "./pages/agent/AgentCommissions";
import AgentPackages from "./pages/agent/AgentPackages";

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
              <Route path="packages/:id" element={<AdminPackageDetail />} />
              <Route path="master-data" element={<AdminMasterData />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="bookings/:id" element={<AdminBookingDetail />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="customers/:id" element={<AdminCustomerDetail />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="agents" element={<AdminAgents />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            
            {/* Operational Routes */}
            <Route path="/operational" element={<OperationalLayout />}>
              <Route index element={<OperationalDashboard />} />
              <Route path="manifest" element={<ManifestPage />} />
              <Route path="checkin" element={<CheckinPage />} />
              <Route path="luggage" element={<LuggagePage />} />
            </Route>
            
            {/* Agent Routes */}
            <Route path="/agent" element={<AgentLayout />}>
              <Route index element={<AgentDashboard />} />
              <Route path="register" element={<AgentRegister />} />
              <Route path="commissions" element={<AgentCommissions />} />
              <Route path="packages" element={<AgentPackages />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
