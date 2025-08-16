import { Outlet, Navigate, useLocation } from "react-router-dom";
import BottomTabBar from "@/components/BottomTabBar";
import { useAuth } from "@/context/AuthContext";

const PrivateAppLayout = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/mobile-login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="container mx-auto max-w-md px-4 py-6">
        <Outlet />
      </main>
      <BottomTabBar />
    </div>
  );
};

export default PrivateAppLayout;
