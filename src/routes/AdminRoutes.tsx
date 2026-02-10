import { Route } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { AdminLayout } from "@/components/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";
import AdminPackages from "@/pages/admin/AdminPackages";
import AdminPackageDetail from "@/pages/admin/AdminPackageDetail";
import AdminBookings from "@/pages/admin/AdminBookings";
import AdminBookingDetail from "@/pages/admin/AdminBookingDetail";
import AdminPayments from "@/pages/admin/AdminPayments";
import AdminCustomers from "@/pages/admin/AdminCustomers";
import AdminCustomerDetail from "@/pages/admin/AdminCustomerDetail";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminAgents from "@/pages/admin/AdminAgents";
import AdminReports from "@/pages/admin/AdminReports";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminMasterData from "@/pages/admin/AdminMasterData";
import AdminLeads from "@/pages/admin/AdminLeads";
import AdminLeadDetail from "@/pages/admin/AdminLeadDetail";
import AdminLeadAnalytics from "@/pages/admin/AdminLeadAnalytics";
import AdminRolePermissions from "@/pages/admin/AdminRolePermissions";
import AdminRoomAssignments from "@/pages/admin/AdminRoomAssignments";
import AdminDepartures from "@/pages/admin/AdminDepartures";
import AdminSavingsPlans from "@/pages/admin/AdminSavingsPlans";
import AdminDocumentVerification from "@/pages/admin/AdminDocumentVerification";
import AdminAppearance from "@/pages/admin/AdminAppearance";
import AdminBranches from "@/pages/admin/AdminBranches";
import AdminFinancePL from "@/pages/admin/AdminFinancePL";
import AdminVendors from "@/pages/admin/AdminVendors";
import AdminLoyalty from "@/pages/admin/AdminLoyalty";
import AdminReferrals from "@/pages/admin/AdminReferrals";
import AdminSupportTickets from "@/pages/admin/AdminSupportTickets";
import AdminSecurityAudit from "@/pages/admin/AdminSecurityAudit";
import Admin2FASettings from "@/pages/admin/Admin2FASettings";
import AdminWhatsApp from "@/pages/admin/AdminWhatsApp";
import AdminAdvancedReports from "@/pages/admin/AdminAdvancedReports";
import AdminHR from "@/pages/admin/AdminHR";
import AdminHajiManagement from "@/pages/admin/AdminHajiManagement";
import AdminItineraryTemplates from "@/pages/admin/AdminItineraryTemplates";
import AdminOfflineContent from "@/pages/admin/AdminOfflineContent";
import AdminDocumentGenerator from "@/pages/admin/AdminDocumentGenerator";
import AdminScheduledReports from "@/pages/admin/AdminScheduledReports";
import AdminCoupons from "@/pages/admin/AdminCoupons";

const ADMIN_ROLES = ['super_admin', 'owner', 'branch_manager', 'finance', 'sales', 'marketing'] as const;

export default function AdminRoutes() {
  return (
    <Route
      path="/admin"
      element={
        <ProtectedRoute allowedRoles={[...ADMIN_ROLES]}>
          <AdminLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<AdminDashboard />} />
      <Route path="analytics" element={<AdminAnalytics />} />
      <Route path="packages" element={<AdminPackages />} />
      <Route path="packages/:id" element={<AdminPackageDetail />} />
      <Route path="departures" element={<AdminDepartures />} />
      <Route path="savings" element={<AdminSavingsPlans />} />
      <Route path="master-data" element={<AdminMasterData />} />
      <Route path="branches" element={<AdminBranches />} />
      <Route path="bookings" element={<AdminBookings />} />
      <Route path="bookings/:id" element={<AdminBookingDetail />} />
      <Route path="payments" element={<AdminPayments />} />
      <Route path="finance" element={<AdminFinancePL />} />
      <Route path="vendors" element={<AdminVendors />} />
      <Route path="customers" element={<AdminCustomers />} />
      <Route path="customers/:id" element={<AdminCustomerDetail />} />
      <Route path="documents" element={<AdminDocumentVerification />} />
      <Route path="users" element={<AdminUsers />} />
      <Route path="permissions" element={<AdminRolePermissions />} />
      <Route path="agents" element={<AdminAgents />} />
      <Route path="coupons" element={<AdminCoupons />} />
      <Route path="loyalty" element={<AdminLoyalty />} />
      <Route path="referrals" element={<AdminReferrals />} />
      <Route path="support" element={<AdminSupportTickets />} />
      <Route path="leads" element={<AdminLeads />} />
      <Route path="leads/analytics" element={<AdminLeadAnalytics />} />
      <Route path="leads/:id" element={<AdminLeadDetail />} />
      <Route path="room-assignments" element={<AdminRoomAssignments />} />
      <Route path="reports" element={<AdminReports />} />
      <Route path="advanced-reports" element={<AdminAdvancedReports />} />
      <Route path="scheduled-reports" element={<AdminScheduledReports />} />
      <Route path="hr" element={<AdminHR />} />
      <Route path="haji" element={<AdminHajiManagement />} />
      <Route path="itinerary-templates" element={<AdminItineraryTemplates />} />
      <Route path="offline-content" element={<AdminOfflineContent />} />
      <Route path="documents-generator" element={<AdminDocumentGenerator />} />
      <Route path="security" element={<AdminSecurityAudit />} />
      <Route path="2fa" element={<Admin2FASettings />} />
      <Route path="whatsapp" element={<AdminWhatsApp />} />
      <Route path="appearance" element={<AdminAppearance />} />
      <Route path="settings" element={<AdminSettings />} />
    </Route>
  );
}
