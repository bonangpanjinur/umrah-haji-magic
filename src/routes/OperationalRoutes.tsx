import { Route } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import OperationalLayout from "@/pages/operational/OperationalLayout";
import OperationalDashboard from "@/pages/operational/OperationalDashboard";
import ManifestPage from "@/pages/operational/ManifestPage";
import CheckinPage from "@/pages/operational/CheckinPage";
import LuggagePage from "@/pages/operational/LuggagePage";
import RoomingListPage from "@/pages/operational/RoomingListPage";
import QRCodePage from "@/pages/operational/QRCodePage";
import EquipmentPage from "@/pages/operational/EquipmentPage";
import BusManagementPage from "@/pages/operational/BusManagementPage";
import EmployeeAttendance from "@/pages/hr/EmployeeAttendance";

const OPERATIONAL_ROLES = ['super_admin', 'owner', 'branch_manager', 'operational', 'equipment'] as const;

export default function OperationalRoutes() {
  return (
    <>
      <Route
        path="/operational"
        element={
          <ProtectedRoute allowedRoles={[...OPERATIONAL_ROLES]}>
            <OperationalLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<OperationalDashboard />} />
        <Route path="manifest" element={<ManifestPage />} />
        <Route path="checkin" element={<CheckinPage />} />
        <Route path="luggage" element={<LuggagePage />} />
        <Route path="rooming" element={<RoomingListPage />} />
        <Route path="qrcode" element={<QRCodePage />} />
        <Route path="equipment" element={<EquipmentPage />} />
        <Route path="bus" element={<BusManagementPage />} />
      </Route>

      <Route
        path="/hr"
        element={
          <ProtectedRoute allowedRoles={['super_admin', 'owner', 'branch_manager', 'operational']}>
            <EmployeeAttendance />
          </ProtectedRoute>
        }
      />
    </>
  );
}
