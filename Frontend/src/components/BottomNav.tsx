import { NavLink } from "react-router-dom";
import { Home, Mic, Camera, Users, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/triage", icon: Mic, label: "Triage" },
  { to: "/pratibimb", icon: Camera, label: "Pratibimb" },
  { to: "/patients", icon: Users, label: "Patients" },
  { to: "/dashboard", icon: BarChart3, label: "Stats" },
];

export const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] z-50 bg-card/95 backdrop-blur-lg border-t border-border">
      <ul className="flex justify-around items-center h-16 px-2">
        {items.map(({ to, icon: Icon, label }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition-all",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={cn(
                      "p-1.5 rounded-lg transition-all",
                      isActive && "bg-primary/15 shadow-glow"
                    )}
                  >
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className="text-[10px] font-medium tracking-wide">
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};
