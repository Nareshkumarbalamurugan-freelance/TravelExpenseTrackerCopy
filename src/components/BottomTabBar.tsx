import { NavLink } from "react-router-dom";
import { Home, MapPin, History, User } from "lucide-react";

const TabItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex flex-col items-center justify-center gap-1 px-4 py-2 text-xs ${isActive ? "text-primary" : "text-muted-foreground"}`
    }
  >
    <Icon className="[&_svg]:size-5" />
    <span>{label}</span>
  </NavLink>
);

const BottomTabBar = () => {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-card border-t border-border z-50">
      <div className="grid grid-cols-4 max-w-md mx-auto py-2">
        <TabItem to="/" icon={Home} label="Home" />
        <TabItem to="/summary" icon={MapPin} label="Summary" />
        <TabItem to="/history" icon={History} label="History" />
        <TabItem to="/profile" icon={User} label="Profile" />
      </div>
      <div className="h-[calc(env(safe-area-inset-bottom))]" />
    </nav>
  );
};

export default BottomTabBar;
