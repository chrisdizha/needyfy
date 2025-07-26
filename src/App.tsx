import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { EnhancedSecurityProvider } from "@/components/security/EnhancedSecurityProvider";
import { AuthSecurityConfig } from "@/components/security/AuthSecurityConfig";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Profile from "@/pages/Profile";
import Admin from "@/pages/Admin";
import Equipment from "@/pages/Equipment";
import NewEquipment from "@/pages/NewEquipment";
import EditEquipment from "@/pages/EditEquipment";
import EquipmentDetails from "@/pages/EquipmentDetails";
import NewReport from "@/pages/NewReport";
import ReportDetails from "@/pages/ReportDetails";
import EditReport from "@/pages/EditReport";
import NewDispute from "@/pages/NewDispute";
import DisputeDetails from "@/pages/DisputeDetails";
import EditDispute from "@/pages/EditDispute";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import Contact from "@/pages/Contact";
import About from "@/pages/About";
import NotFound from "@/pages/NotFound";
import { SecureRoute } from "@/components/auth/SecureRoute";
import { AdminRoute } from "@/components/auth/AdminRoute";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <EnhancedSecurityProvider>
          <AuthSecurityConfig />
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />
              <Route
                path="/profile"
                element={
                  <SecureRoute>
                    <Profile />
                  </SecureRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <Admin />
                  </AdminRoute>
                }
              />
              <Route path="/equipment" element={<Equipment />} />
              <Route
                path="/equipment/new"
                element={
                  <SecureRoute>
                    <NewEquipment />
                  </SecureRoute>
                }
              />
              <Route
                path="/equipment/:id/edit"
                element={
                  <SecureRoute>
                    <EditEquipment />
                  </SecureRoute>
                }
              />
              <Route path="/equipment/:id" element={<EquipmentDetails />} />
              <Route
                path="/reports/new"
                element={
                  <SecureRoute>
                    <NewReport />
                  </SecureRoute>
                }
              />
              <Route
                path="/reports/:id"
                element={
                  <SecureRoute>
                    <ReportDetails />
                  </SecureRoute>
                }
              />
              <Route
                path="/reports/:id/edit"
                element={
                  <SecureRoute>
                    <EditReport />
                  </SecureRoute>
                }
              />
              <Route
                path="/disputes/new"
                element={
                  <SecureRoute>
                    <NewDispute />
                  </SecureRoute>
                }
              />
              <Route
                path="/disputes/:id"
                element={
                  <SecureRoute>
                    <DisputeDetails />
                  </SecureRoute>
                }
              />
              <Route
                path="/disputes/:id/edit"
                element={
                  <SecureRoute>
                    <EditDispute />
                  </SecureRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          <Toaster />
        </EnhancedSecurityProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
