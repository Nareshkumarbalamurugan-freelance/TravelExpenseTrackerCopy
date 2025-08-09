import { Outlet, Navigate, useLocation } from "react-router-dom";
import BottomTabBar from "@/components/BottomTabBar";
import { useAuth } from "@/context/AuthContext";

const PrivateAppLayout = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
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
