import { Route } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AgentLayout from "@/pages/agent/AgentLayout";
import AgentDashboard from "@/pages/agent/AgentDashboard";
import AgentRegister from "@/pages/agent/AgentRegister";
import AgentJamaah from "@/pages/agent/AgentJamaah";
import AgentCommissions from "@/pages/agent/AgentCommissions";
import AgentPackages from "@/pages/agent/AgentPackages";
import AgentWallet from "@/pages/agent/AgentWallet";

export default function AgentRoutes() {
  return (
    <Route
      path="/agent"
      element={
        <ProtectedRoute allowedRoles={['super_admin', 'owner', 'agent']}>
          <AgentLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<AgentDashboard />} />
      <Route path="register" element={<AgentRegister />} />
      <Route path="jamaah" element={<AgentJamaah />} />
      <Route path="commissions" element={<AgentCommissions />} />
      <Route path="wallet" element={<AgentWallet />} />
      <Route path="packages" element={<AgentPackages />} />
    </Route>
  );
}
