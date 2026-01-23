import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import logoHorizontal from "@/assets/logo-horizontal.png";

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50">
      <div className="container flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-2">
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
          <h1 className="font-display font-semibold text-lg absolute left-1/2 -translate-x-1/2 max-w-[50%] truncate text-center">
            {title}
          </h1>
        )}

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
          </Button>
        </div>
      </div>
    </header>
  );
}
