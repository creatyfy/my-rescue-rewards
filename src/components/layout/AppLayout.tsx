import { ReactNode } from "react";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  showNav?: boolean;
}

export function AppLayout({ children, title, showNav = true }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header title={title} />
      <main className={`pb-20 md:pb-8 ${showNav ? '' : ''}`}>
        {children}
      </main>
      {showNav && <MobileNav />}
    </div>
  );
}
