import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import { SidebarNav } from "./SidebarNav";
import { Button } from "@/components/ui/button";
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
          <Header title={title} />
          <main className={`pb-20 md:pb-8 ${showNav ? "" : ""}`}>
            {children}
            {showBack && (
              <div className="container px-4 pt-6 pb-4">
                <Button variant="secondary" className="gap-2 text-muted-foreground hover:text-foreground" asChild>
                  <Link to="/dashboard" aria-label="Voltar para o dashboard">
                    <ArrowLeft className="h-4 w-4" />
                    Voltar
                  </Link>
                </Button>
              </div>
            )}
          </main>
          {showNav && <MobileNav />}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
