import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import PrivateAppLayout from "./layouts/PrivateAppLayout";
import Dashboard from "./pages/Dashboard";
import NewEmployeeDashboard from "./pages/NewEmployeeDashboard";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
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

const queryClient = new QueryClient();

const App = () => (
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
                  <Route path="/login" element={<Login />} />
                  <Route path="/admin-setup" element={<AdminSetupPage />} />
                  <Route path="/admin-login" element={<AdminLogin />} />
                  <Route path="/admin" element={
                    <AdminGuard>
                      <ComprehensiveAdminDashboard />
                    </AdminGuard>
                  } />
                  <Route path="/admin-legacy" element={
                    <AdminGuard>
                      <AdminDashboard />
                    </AdminGuard>
                  } />
                  <Route path="/" element={<PrivateAppLayout />}>
                    <Route index element={<NewEmployeeDashboard />} />
                    <Route path="dashboard-legacy" element={<Dashboard />} />
                    <Route path="summary" element={<DailySummary />} />
                    <Route path="history" element={<TripHistory />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="map-demo" element={<MapDemo />} />
                  </Route>
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
);

export default App;
