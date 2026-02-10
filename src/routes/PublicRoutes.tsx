import { Route, Navigate } from "react-router-dom";
import Index from "@/pages/Index";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import PackageList from "@/pages/packages/PackageList";
import PackageDetail from "@/pages/packages/PackageDetail";
import AboutPage from "@/pages/public/AboutPage";
import ContactPage from "@/pages/public/ContactPage";
import SavingsPackages from "@/pages/savings/SavingsPackages";
import SavingsRegister from "@/pages/savings/SavingsRegister";

export default function PublicRoutes() {
  return (
    <>
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
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/savings" element={<SavingsPackages />} />
      <Route path="/savings/register/:packageId" element={<SavingsRegister />} />
    </>
  );
}
