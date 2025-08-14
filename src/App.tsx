import ClaimApprovals from "./pages/ClaimApprovals";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import PrivateAppLayout from "./layouts/PrivateAppLayout";
import Dashboard from "./pages/Dashboard";
import NewEmployeeDashboard from "./pages/NewEmployeeDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import SmartDashboardRouter from "./pages/SmartDashboardRouter";
import NotFound from "./pages/NotFound";
import TestPage from "./pages/TestPage";
import TestSystemPage from "./pages/TestSystemPage";
import Login from "./pages/Login";
import LoginSelector from "./pages/LoginSelector";
import LoginEmployee from "./pages/LoginEmployee";
import LoginManager from "./pages/LoginManager";
import DailySummary from "./pages/DailySummary";
import TripHistory from "./pages/TripHistory";
import Profile from "./pages/Profile";
import MapDemo from "./pages/MapDemo";
import AdminDashboard from "./pages/AdminDashboard";
import ComprehensiveAdminDashboard from "./pages/ComprehensiveAdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminGuard from "./components/AdminGuard";
import { AdminSetupPage } from "./pages/AdminSetup";
import { AuthProvider } from "./context/AuthContext";
import { TripProvider } from "./context/TripContext";
import { AdminProvider } from "./context/AdminContext";
import DebugErrorBoundary from "./components/DebugErrorBoundary";
import RoleDebugger from "./components/RoleDebugger";
import Trips from "./pages/Trips";
import Claims from "./pages/Claims";
import NewClaim from "./pages/NewClaim";

const queryClient = new QueryClient();

const App = () => (
  <DebugErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <AuthProvider>
          <AdminProvider>
            <TripProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter
                  future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true
                  }}
                >
                  <Routes>
                    <Route path="/" element={<LoginSelector />} />
                  <Route path="/login" element={<LoginSelector />} />
                  <Route path="/login-employee" element={<LoginEmployee />} />
                  <Route path="/login-manager" element={<LoginManager />} />
                  <Route path="/admin-setup" element={<AdminSetupPage />} />
                  <Route path="/admin-login" element={<AdminLogin />} />
                  <Route path="/admin" element={
                    <AdminGuard>
                      <AdminDashboard />
                    </AdminGuard>
                  } />
                  <Route path="/admin-legacy" element={
                    <AdminGuard>
                      <AdminDashboard />
                    </AdminGuard>
                  } />
                  <Route path="/" element={<PrivateAppLayout />}>
                    <Route index element={<SmartDashboardRouter />} />
                    <Route path="dashboard" element={<SmartDashboardRouter />} />
                    <Route path="employee-dashboard" element={<NewEmployeeDashboard />} />
                    <Route path="manager-dashboard" element={<ManagerDashboard />} />
                    <Route path="trips" element={<Trips />} />
                    <Route path="claims" element={<Claims />} />
                    <Route path="new-claim" element={<NewClaim />} />
                    <Route path="dashboard-legacy" element={<Dashboard />} />
                    <Route path="claim-approvals" element={<ClaimApprovals />} />
                    <Route path="summary" element={<DailySummary />} />
                    <Route path="history" element={<TripHistory />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="map-demo" element={<MapDemo />} />
                  </Route>
                  <Route path="test" element={<TestPage />} />
                  <Route path="test-system" element={<TestSystemPage />} />
                  <Route path="debug-role" element={<RoleDebugger />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </TripProvider>
        </AdminProvider>
      </AuthProvider>
    </HelmetProvider>
  </QueryClientProvider>
  </DebugErrorBoundary>
);

export default App;
