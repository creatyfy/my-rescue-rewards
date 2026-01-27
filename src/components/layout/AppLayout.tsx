import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="offcanvas">
        <SidebarNav />
      </Sidebar>
      <SidebarInset>
        <div className="min-h-screen bg-background">
          <Header title={title} />
          <div className={`pb-20 md:pb-8 ${showNav ? "" : ""}`}>
            {children}
            {showBack && (
              <div className="container px-4 pt-6 pb-4 flex justify-center">
                <Button variant="outline" className="gap-2" onClick={handleGoBack} aria-label="Voltar para a página anterior">
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Button>
              </div>
            )}
          </div>
          {showNav && <MobileNav />}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
