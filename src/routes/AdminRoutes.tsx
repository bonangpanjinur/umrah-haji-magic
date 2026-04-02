import { Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminLayout from "@/components/admin/AdminLayout";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { LoadingState } from "@/components/shared/LoadingState";

const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminAnalytics = lazy(() => import("@/pages/admin/AdminAnalytics"));
const AdminPackages = lazy(() => import("@/pages/admin/AdminPackages"));
const AdminPackageDetail = lazy(() => import("@/pages/admin/AdminPackageDetail"));
const AdminBookings = lazy(() => import("@/pages/admin/AdminBookings"));
const AdminBookingDetail = lazy(() => import("@/pages/admin/AdminBookingDetail"));
const AdminPayments = lazy(() => import("@/pages/admin/AdminPayments"));
const AdminCustomers = lazy(() => import("@/pages/admin/AdminCustomers"));
const AdminCustomerDetail = lazy(() => import("@/pages/admin/AdminCustomerDetail"));
const AdminUsers = lazy(() => import("@/pages/admin/AdminUsers"));
const AdminAgents = lazy(() => import("@/pages/admin/AdminAgents"));
const AdminReports = lazy(() => import("@/pages/admin/AdminReports"));
const AdminSettings = lazy(() => import("@/pages/admin/AdminSettings"));
const AdminMasterData = lazy(() => import("@/pages/admin/AdminMasterData"));
const AdminLeads = lazy(() => import("@/pages/admin/AdminLeads"));
const AdminLeadDetail = lazy(() => import("@/pages/admin/AdminLeadDetail"));
const AdminLeadAnalytics = lazy(() => import("@/pages/admin/AdminLeadAnalytics"));
const AdminRolePermissions = lazy(() => import("@/pages/admin/AdminRolePermissions"));
const AdminRoomAssignments = lazy(() => import("@/pages/admin/AdminRoomAssignments"));
const AdminDepartures = lazy(() => import("@/pages/admin/AdminDepartures"));
const AdminSavingsPlans = lazy(() => import("@/pages/admin/AdminSavingsPlans"));
const AdminDocumentVerification = lazy(() => import("@/pages/admin/AdminDocumentVerification"));
const AdminAppearance = lazy(() => import("@/pages/admin/AdminAppearance"));
const AdminBranches = lazy(() => import("@/pages/admin/AdminBranches"));
const AdminFinancePL = lazy(() => import("@/pages/admin/AdminFinancePL"));
const AdminFinanceCash = lazy(() => import("@/pages/admin/AdminFinanceCash"));
const AdminVendors = lazy(() => import("@/pages/admin/AdminVendors"));
const AdminLoyalty = lazy(() => import("@/pages/admin/AdminLoyalty"));
const AdminReferrals = lazy(() => import("@/pages/admin/AdminReferrals"));
const AdminSupportTickets = lazy(() => import("@/pages/admin/AdminSupportTickets"));
const AdminSecurityAudit = lazy(() => import("@/pages/admin/AdminSecurityAudit"));
const Admin2FASettings = lazy(() => import("@/pages/admin/Admin2FASettings"));
const AdminWhatsApp = lazy(() => import("@/pages/admin/AdminWhatsApp"));
const AdminAdvancedReports = lazy(() => import("@/pages/admin/AdminAdvancedReports"));
const AdminHR = lazy(() => import("@/pages/admin/AdminHR"));
const AdminHajiManagement = lazy(() => import("@/pages/admin/AdminHajiManagement"));
const AdminItineraryTemplates = lazy(() => import("@/pages/admin/AdminItineraryTemplates"));
const AdminOfflineContent = lazy(() => import("@/pages/admin/AdminOfflineContent"));
const AdminDocumentGenerator = lazy(() => import("@/pages/admin/AdminDocumentGenerator"));
const AdminScheduledReports = lazy(() => import("@/pages/admin/AdminScheduledReports"));
const AdminCoupons = lazy(() => import("@/pages/admin/AdminCoupons"));
const AdminStaticPages = lazy(() => import("@/pages/admin/AdminStaticPages"));
const AdminTestimonials = lazy(() => import("@/pages/admin/AdminTestimonials"));
const AdminBookingCreate = lazy(() => import("@/pages/admin/AdminBookingCreate"));
const EquipmentPage = lazy(() => import("@/pages/operational/EquipmentPage"));
const AdminMarketingMaterials = lazy(() => import("@/pages/admin/AdminMarketingMaterials"));
const AdminFinanceAR = lazy(() => import("@/pages/admin/AdminFinanceAR"));
const AdminFinanceAP = lazy(() => import("@/pages/admin/AdminFinanceAP"));
const AdminPayroll = lazy(() => import("@/pages/admin/AdminPayroll"));
const AdminManasik = lazy(() => import("@/pages/admin/AdminManasik"));
const AdminVisaManagement = lazy(() => import("@/pages/admin/AdminVisaManagement"));

const ADMIN_ROLES = ['super_admin', 'owner', 'branch_manager', 'finance', 'sales', 'marketing', 'operational', 'equipment'] as const;

function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingState />}>{children}</Suspense>;
}

export default function AdminRoutes() {
  return (
    <Route
      path="/admin"
      element={
        <ProtectedRoute allowedRoles={[...ADMIN_ROLES]}>
          <ThemeProvider>
            <AdminLayout />
          </ThemeProvider>
        </ProtectedRoute>
      }
    >
      <Route index element={<LazyPage><AdminDashboard /></LazyPage>} />
      <Route path="analytics" element={<ProtectedRoute permissionKey="analytics"><LazyPage><AdminAnalytics /></LazyPage></ProtectedRoute>} />
      <Route path="packages" element={<ProtectedRoute permissionKey="packages"><LazyPage><AdminPackages /></LazyPage></ProtectedRoute>} />
      <Route path="packages/:id" element={<ProtectedRoute permissionKey="packages"><LazyPage><AdminPackageDetail /></LazyPage></ProtectedRoute>} />
      <Route path="departures" element={<ProtectedRoute permissionKey="departures"><LazyPage><AdminDepartures /></LazyPage></ProtectedRoute>} />
      <Route path="equipment" element={<ProtectedRoute permissionKey="equipment"><LazyPage><EquipmentPage /></LazyPage></ProtectedRoute>} />
      <Route path="savings" element={<ProtectedRoute permissionKey="savings"><LazyPage><AdminSavingsPlans /></LazyPage></ProtectedRoute>} />
      <Route path="master-data" element={<ProtectedRoute permissionKey="master_data"><LazyPage><AdminMasterData /></LazyPage></ProtectedRoute>} />
      <Route path="branches" element={<ProtectedRoute permissionKey="branches"><LazyPage><AdminBranches /></LazyPage></ProtectedRoute>} />
      <Route path="bookings" element={<ProtectedRoute permissionKey="bookings"><LazyPage><AdminBookings /></LazyPage></ProtectedRoute>} />
      <Route path="bookings/create" element={<ProtectedRoute permissionKey="bookings"><LazyPage><AdminBookingCreate /></LazyPage></ProtectedRoute>} />
      <Route path="bookings/:id" element={<ProtectedRoute permissionKey="bookings"><LazyPage><AdminBookingDetail /></LazyPage></ProtectedRoute>} />
      <Route path="payments" element={<ProtectedRoute permissionKey="payments"><LazyPage><AdminPayments /></LazyPage></ProtectedRoute>} />
      <Route path="finance" element={<ProtectedRoute permissionKey="finance_pl"><LazyPage><AdminFinancePL /></LazyPage></ProtectedRoute>} />
      <Route path="finance-cash" element={<ProtectedRoute permissionKey="finance_cash"><LazyPage><AdminFinanceCash /></LazyPage></ProtectedRoute>} />
      <Route path="finance/ar" element={<ProtectedRoute permissionKey="finance_ar"><LazyPage><AdminFinanceAR /></LazyPage></ProtectedRoute>} />
      <Route path="finance/ap" element={<ProtectedRoute permissionKey="finance_ap"><LazyPage><AdminFinanceAP /></LazyPage></ProtectedRoute>} />
      <Route path="vendors" element={<ProtectedRoute permissionKey="finance_ap"><LazyPage><AdminVendors /></LazyPage></ProtectedRoute>} />
      <Route path="customers" element={<ProtectedRoute permissionKey="customers"><LazyPage><AdminCustomers /></LazyPage></ProtectedRoute>} />
      <Route path="customers/:id" element={<ProtectedRoute permissionKey="customers"><LazyPage><AdminCustomerDetail /></LazyPage></ProtectedRoute>} />
      <Route path="document-verification" element={<ProtectedRoute permissionKey="document_verification"><LazyPage><AdminDocumentVerification /></LazyPage></ProtectedRoute>} />
      <Route path="users" element={<ProtectedRoute permissionKey="users"><LazyPage><AdminUsers /></LazyPage></ProtectedRoute>} />
      <Route path="permissions" element={<ProtectedRoute permissionKey="users"><LazyPage><AdminRolePermissions /></LazyPage></ProtectedRoute>} />
      <Route path="agents" element={<ProtectedRoute permissionKey="agents"><LazyPage><AdminAgents /></LazyPage></ProtectedRoute>} />
      <Route path="coupons" element={<ProtectedRoute permissionKey="coupons"><LazyPage><AdminCoupons /></LazyPage></ProtectedRoute>} />
      <Route path="loyalty" element={<ProtectedRoute permissionKey="loyalty"><LazyPage><AdminLoyalty /></LazyPage></ProtectedRoute>} />
      <Route path="referrals" element={<ProtectedRoute permissionKey="referrals"><LazyPage><AdminReferrals /></LazyPage></ProtectedRoute>} />
      <Route path="support" element={<ProtectedRoute permissionKey="support_tickets"><LazyPage><AdminSupportTickets /></LazyPage></ProtectedRoute>} />
      <Route path="leads" element={<ProtectedRoute permissionKey="leads"><LazyPage><AdminLeads /></LazyPage></ProtectedRoute>} />
      <Route path="leads/analytics" element={<ProtectedRoute permissionKey="leads"><LazyPage><AdminLeadAnalytics /></LazyPage></ProtectedRoute>} />
      <Route path="leads/:id" element={<ProtectedRoute permissionKey="leads"><LazyPage><AdminLeadDetail /></LazyPage></ProtectedRoute>} />
      <Route path="room-assignments" element={<ProtectedRoute permissionKey="room_assignments"><LazyPage><AdminRoomAssignments /></LazyPage></ProtectedRoute>} />
      <Route path="reports" element={<ProtectedRoute permissionKey="reports"><LazyPage><AdminReports /></LazyPage></ProtectedRoute>} />
      <Route path="advanced-reports" element={<ProtectedRoute permissionKey="reports"><LazyPage><AdminAdvancedReports /></LazyPage></ProtectedRoute>} />
      <Route path="scheduled-reports" element={<ProtectedRoute permissionKey="reports"><LazyPage><AdminScheduledReports /></LazyPage></ProtectedRoute>} />
      <Route path="hr" element={<ProtectedRoute permissionKey="hr"><LazyPage><AdminHR /></LazyPage></ProtectedRoute>} />
      <Route path="hr/payroll" element={<ProtectedRoute permissionKey="payroll"><LazyPage><AdminPayroll /></LazyPage></ProtectedRoute>} />
      <Route path="haji" element={<ProtectedRoute permissionKey="haji"><LazyPage><AdminHajiManagement /></LazyPage></ProtectedRoute>} />
      <Route path="manasik" element={<ProtectedRoute permissionKey="manasik"><LazyPage><AdminManasik /></LazyPage></ProtectedRoute>} />
      <Route path="visa" element={<ProtectedRoute permissionKey="visa"><LazyPage><AdminVisaManagement /></LazyPage></ProtectedRoute>} />
      <Route path="itinerary-templates" element={<ProtectedRoute permissionKey="itinerary_templates"><LazyPage><AdminItineraryTemplates /></LazyPage></ProtectedRoute>} />
      <Route path="offline-content" element={<ProtectedRoute permissionKey="offline_content"><LazyPage><AdminOfflineContent /></LazyPage></ProtectedRoute>} />
      <Route path="documents-generator" element={<ProtectedRoute permissionKey="document_generator"><LazyPage><AdminDocumentGenerator /></LazyPage></ProtectedRoute>} />
      <Route path="security" element={<ProtectedRoute permissionKey="security_audit"><LazyPage><AdminSecurityAudit /></LazyPage></ProtectedRoute>} />
      <Route path="2fa" element={<ProtectedRoute permissionKey="2fa"><LazyPage><Admin2FASettings /></LazyPage></ProtectedRoute>} />
      <Route path="whatsapp" element={<ProtectedRoute permissionKey="whatsapp"><LazyPage><AdminWhatsApp /></LazyPage></ProtectedRoute>} />
      <Route path="marketing-materials" element={<ProtectedRoute permissionKey="marketing_materials"><LazyPage><AdminMarketingMaterials /></LazyPage></ProtectedRoute>} />
      <Route path="appearance" element={<ProtectedRoute permissionKey="appearance"><LazyPage><AdminAppearance /></LazyPage></ProtectedRoute>} />
      <Route path="static-pages" element={<ProtectedRoute permissionKey="static_pages"><LazyPage><AdminStaticPages /></LazyPage></ProtectedRoute>} />
      <Route path="testimonials" element={<ProtectedRoute permissionKey="testimonials"><LazyPage><AdminTestimonials /></LazyPage></ProtectedRoute>} />
      <Route path="settings" element={<ProtectedRoute permissionKey="settings"><LazyPage><AdminSettings /></LazyPage></ProtectedRoute>} />
    </Route>
  );
}
