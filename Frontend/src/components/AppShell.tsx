import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

interface AppShellProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export const AppShell = ({ children, title, subtitle }: AppShellProps) => {
  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[390px] min-h-screen bg-background relative pb-20">
        {title && (
          <header className="px-5 pt-6 pb-4">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </header>
        )}
        <main className="px-5">{children}</main>
        <BottomNav />
      </div>
    </div>
  );
};

export const StatusBadge = ({
  variant,
  children,
}: {
  variant: "red" | "amber" | "green";
  children: ReactNode;
}) => {
  const styles = {
    red: "bg-destructive/15 text-destructive border-destructive/30",
    amber: "bg-warning/15 text-warning border-warning/30",
    green: "bg-success/15 text-success border-success/30",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${styles[variant]}`}
    >
      {children}
    </span>
  );
};

export const Card = ({
  children,
  className = "",
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) => (
  <div
    onClick={onClick}
    className={`bg-card border border-border rounded-2xl p-4 shadow-card ${
      onClick ? "active:scale-[0.98] transition-transform cursor-pointer" : ""
    } ${className}`}
  >
    {children}
  </div>
);
