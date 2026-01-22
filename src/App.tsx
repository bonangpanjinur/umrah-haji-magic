import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import PackageList from "./pages/packages/PackageList";
import PackageDetail from "./pages/packages/PackageDetail";
import BookingPage from "./pages/booking/BookingPage";
import BookingSuccess from "./pages/booking/BookingSuccess";
import MyBookings from "./pages/customer/MyBookings";
import BookingDetail from "./pages/customer/BookingDetail";
import PaymentUpload from "./pages/customer/PaymentUpload";
import { AdminLayout } from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminPackages from "./pages/admin/AdminPackages";
import AdminPackageDetail from "./pages/admin/AdminPackageDetail";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminBookingDetail from "./pages/admin/AdminBookingDetail";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminCustomerDetail from "./pages/admin/AdminCustomerDetail";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAgents from "./pages/admin/AdminAgents";
import AdminReports from "./pages/admin/AdminReports";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminMasterData from "./pages/admin/AdminMasterData";
import AdminLeads from "./pages/admin/AdminLeads";
import AdminLeadDetail from "./pages/admin/AdminLeadDetail";
import AdminLeadAnalytics from "./pages/admin/AdminLeadAnalytics";
import AdminRolePermissions from "./pages/admin/AdminRolePermissions";
import AdminRoomAssignments from "./pages/admin/AdminRoomAssignments";
import AdminDepartures from "./pages/admin/AdminDepartures";
import AdminSavingsPlans from "./pages/admin/AdminSavingsPlans";
import AdminDocumentVerification from "./pages/admin/AdminDocumentVerification";
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
import AgentJamaah from "./pages/agent/AgentJamaah";
import AgentCommissions from "./pages/agent/AgentCommissions";
import AgentPackages from "./pages/agent/AgentPackages";
// Savings (Customer)
import SavingsPackages from "./pages/savings/SavingsPackages";
import SavingsRegister from "./pages/savings/SavingsRegister";
import SavingsSuccess from "./pages/savings/SavingsSuccess";
import MySavings from "./pages/customer/MySavings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Navigate to="/auth/login" replace />} />
            <Route path="/register" element={<Navigate to="/auth/register" replace />} />
            <Route path="/dashboard" element={<Navigate to="/admin" replace />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/packages" element={<PackageList />} />
            <Route path="/packages/:id" element={<PackageDetail />} />
            
            {/* Savings Public Routes */}
            <Route path="/savings" element={<SavingsPackages />} />
            <Route path="/savings/register/:packageId" element={<SavingsRegister />} />
            <Route path="/savings/success/:planId" element={
              <ProtectedRoute>
                <SavingsSuccess />
              </ProtectedRoute>
            } />
            <Route path="/customer/my-savings" element={
              <ProtectedRoute>
                <MySavings />
              </ProtectedRoute>
            } />
            
            {/* Customer Protected Routes */}
            <Route path="/booking/:packageId" element={
              <ProtectedRoute>
                <BookingPage />
              </ProtectedRoute>
            } />
            <Route path="/booking/success/:bookingId" element={
              <ProtectedRoute>
                <BookingSuccess />
              </ProtectedRoute>
            } />
            <Route path="/my-bookings" element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            } />
            <Route path="/my-bookings/:bookingId" element={
              <ProtectedRoute>
                <BookingDetail />
              </ProtectedRoute>
            } />
            <Route path="/my-bookings/:bookingId/payment" element={
              <ProtectedRoute>
                <PaymentUpload />
              </ProtectedRoute>
            } />
            
            {/* Admin Routes - Protected with admin roles */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['super_admin', 'owner', 'branch_manager', 'finance', 'sales', 'marketing']}>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="packages" element={<AdminPackages />} />
              <Route path="packages/:id" element={<AdminPackageDetail />} />
              <Route path="departures" element={<AdminDepartures />} />
              <Route path="savings" element={<AdminSavingsPlans />} />
              <Route path="master-data" element={<AdminMasterData />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="bookings/:id" element={<AdminBookingDetail />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="customers/:id" element={<AdminCustomerDetail />} />
              <Route path="documents" element={<AdminDocumentVerification />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="permissions" element={<AdminRolePermissions />} />
              <Route path="agents" element={<AdminAgents />} />
              <Route path="leads" element={<AdminLeads />} />
              <Route path="leads/analytics" element={<AdminLeadAnalytics />} />
              <Route path="leads/:id" element={<AdminLeadDetail />} />
              <Route path="room-assignments" element={<AdminRoomAssignments />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            
            {/* Operational Routes - Protected with operational roles */}
            <Route path="/operational" element={
              <ProtectedRoute allowedRoles={['super_admin', 'owner', 'branch_manager', 'operational', 'equipment']}>
                <OperationalLayout />
              </ProtectedRoute>
            }>
              <Route index element={<OperationalDashboard />} />
              <Route path="manifest" element={<ManifestPage />} />
              <Route path="checkin" element={<CheckinPage />} />
              <Route path="luggage" element={<LuggagePage />} />
            </Route>
            
            {/* Agent Routes - Protected with agent role */}
            <Route path="/agent" element={
              <ProtectedRoute allowedRoles={['super_admin', 'owner', 'agent']}>
                <AgentLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AgentDashboard />} />
              <Route path="register" element={<AgentRegister />} />
              <Route path="jamaah" element={<AgentJamaah />} />
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
