import { Link } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationPanel } from "@/components/notifications/NotificationPanel";
import logoHorizontal from "@/assets/logo-horizontal.png";

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50">
      <div className="container flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-2 flex-shrink-0 w-10">
          <SidebarTrigger />
        </div>

        <Link to="/dashboard" className="flex items-center absolute left-1/2 -translate-x-1/2">
          <img 
            src={logoHorizontal} 
            alt="Meu Resgate" 
            className="h-8 w-auto"
          />
        </Link>

        <div className="flex items-center gap-2 flex-shrink-0 w-10 justify-end">
          <NotificationPanel />
        </div>
      </div>

      {title && (
        <div className="container px-4 pb-3">
          <h1 className="font-display font-semibold text-lg text-center">
            {title}
          </h1>
        </div>
      )}
    </header>
  );
}
