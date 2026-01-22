import { ReactNode } from "react";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import { SidebarNav } from "./SidebarNav";
import { Sidebar, SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  showNav?: boolean;
  showBack?: boolean;
}

export function AppLayout({ children, title, showNav = true, showBack = false }: AppLayoutProps) {
  return (
    <SidebarProvider defaultOpen={false}>
      <Sidebar collapsible="offcanvas">
        <SidebarNav />
      </Sidebar>
      <SidebarInset>
        <div className="min-h-screen bg-background">
          <Header title={title} showBack={showBack} />
          <main className={`pb-20 md:pb-8 ${showNav ? "" : ""}`}>
            {children}
          </main>
          {showNav && <MobileNav />}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
