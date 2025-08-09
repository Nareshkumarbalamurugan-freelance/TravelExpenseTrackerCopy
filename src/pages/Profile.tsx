import SEO from "@/components/SEO";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, logout } = useAuth();
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
