import { ReactNode } from "react";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  showNav?: boolean;
  showBack?: boolean;
}

export function AppLayout({ children, title, showNav = true, showBack = false }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header title={title} showBack={showBack} />
      <main className={`pb-20 md:pb-8 ${showNav ? '' : ''}`}>
        {children}
      </main>
      {showNav && <MobileNav />}
    </div>
  );
}
