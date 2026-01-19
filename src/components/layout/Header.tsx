import { Link } from "react-router-dom";
import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  showBack?: boolean;
  title?: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50">
      <div className="container flex items-center justify-between h-14 px-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">MR</span>
          </div>
          <span className="font-display font-bold text-lg hidden sm:block">
            Meu Resgate
          </span>
        </Link>

        {title && (
          <h1 className="font-display font-semibold text-lg absolute left-1/2 -translate-x-1/2">
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
