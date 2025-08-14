import SEO from "@/components/SEO";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { getEmployeeByIdOrEmail, getEmployeeGrade } from "@/lib/unifiedEmployeeService";
import { getEntitlementsForGrade } from "@/lib/entitlementRules";
import { useAdmin } from "@/context/AdminContext";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Shield, Settings } from "lucide-react";

const Profile = () => {
  const { user, logout } = useAuth();
  const [grade, setGrade] = useState(null);
  const [entitlements, setEntitlements] = useState(null);
  const [isManager, setIsManager] = useState(false);

  useEffect(() => {
    if (user?.email) {
      getEmployeeByIdOrEmail(user.email).then(emp => {
        if (emp?.grade) {
          getEmployeeGrade(emp.grade).then(gr => {
            setGrade(gr);
            if (gr) setEntitlements(getEntitlementsForGrade(gr));
          });
        }
        // Check if user is L1/L2/L3 manager
        if (emp && emp.approvalChain) {
          const manager = Object.values(emp.approvalChain).includes(emp.id);
          setIsManager(manager);
        }
      });
    }
  }, [user]);
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/login"); };

  const onMouseDownRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    e.currentTarget.style.setProperty("--ripple-x", `${x}%`);
    e.currentTarget.style.setProperty("--ripple-y", `${y}%`);
  };

  return (
    <>
      <SEO title="Profile" description="View your profile details and logout." canonical="/profile" />
      <header className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-semibold">Profile</h1>
      </header>

      <section className="space-y-3 animate-fade-in">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">User Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-sm text-muted-foreground">Name</div>
              <div className="font-medium">{user?.name}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Email</div>
              <div className="font-medium">{user?.email}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Position</div>
              <div className="font-medium">{user?.position}</div>
            </div>
            {entitlements && (
              <div>
                <div className="text-sm text-muted-foreground">Entitlements</div>
                <div className="font-medium">
                  Vehicle: {entitlements.vehicleType}<br />
                  Fuel Rule: {entitlements.fuelRule}<br />
                  {entitlements.specialEntitlement && <span>Special Entitlement</span>}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Admin Access Panel */}
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Shield className="h-5 w-5 text-orange-600" />
                <span>Administrator Access</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                You have administrator privileges. Access the admin dashboard to manage system settings, user accounts, and view analytics.
              </p>
              <Button 
                onClick={() => navigate("/admin")} 
                variant="outline" 
                className="w-full"
              >
                <Settings className="h-4 w-4 mr-2" />
                Open Admin Dashboard
              </Button>
            </CardContent>
          </Card>
        )}
        {/* Manager Access Panel */}
        {isManager && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <span>Manager Access</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                You have manager privileges. Access the claim approvals dashboard to review and approve claims.
              </p>
              <Button 
                onClick={() => navigate("/claim-approvals")}
                variant="outline" 
                className="w-full"
              >
                <Shield className="h-4 w-4 mr-2" />
                Open Claim Approvals
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      <section className="mt-6 animate-fade-in">
        <Button variant="outline" size="lg" className="w-full btn-ripple" onMouseDown={onMouseDownRipple} onClick={handleLogout}>
          Logout
        </Button>
      </section>
    </>
  );
};

export default Profile;
