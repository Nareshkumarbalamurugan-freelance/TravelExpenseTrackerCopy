import { NavLink } from "react-router-dom";
import { Home, MapPin, History, User, Map } from "lucide-react";

const TabItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex flex-col items-center justify-center gap-1 px-3 py-2 text-xs ${isActive ? "text-primary" : "text-muted-foreground"}`
    }
  >
    <Icon className="[&_svg]:size-4" />
    <span>{label}</span>
  </NavLink>
);


const BottomTabBar = () => {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-card border-t border-border z-50">
      <div className="grid grid-cols-5 max-w-md mx-auto py-2">
        <TabItem to="/dashboard" icon={Home} label="Dashboard" />
        <TabItem to="/trips" icon={MapPin} label="Trips" />
        <TabItem to="/claims" icon={History} label="Claims" />
        <TabItem to="/new-claim" icon={Map} label="New Claim" />
        <TabItem to="/profile" icon={User} label="Profile" />
      </div>
      <div className="h-[calc(env(safe-area-inset-bottom))]" />
    </nav>
  );
};

export default BottomTabBar;
