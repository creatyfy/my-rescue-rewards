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
      <div className="container flex items-center h-14 px-4">
        <div className="flex items-center gap-2 flex-shrink-0">
          <SidebarTrigger />
          <Link to="/dashboard" className="flex items-center">
            <img 
              src={logoHorizontal} 
              alt="Meu Resgate" 
              className="h-8 w-auto"
            />
          </Link>
        </div>

        {title && (
          <div className="flex-1 flex justify-center px-2 min-w-0">
            <h1 className="font-display font-semibold text-lg truncate">
              {title}
            </h1>
          </div>
        )}

        <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
          <NotificationPanel />
        </div>
      </div>
    </header>
  );
}
