import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { AdminEstablishmentsPanel } from "@/components/admin/AdminEstablishmentsPanel";
import { AdminProductsPanel } from "@/components/admin/AdminProductsPanel";
import { AdminReceiptsPanel } from "@/components/admin/AdminReceiptsPanel";
import { AdminReportsPanel } from "@/components/admin/AdminReportsPanel";
import { AdminUsersPanel } from "@/components/admin/AdminUsersPanel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { fetchAdminStatus } from "@/integrations/supabase/admin";
import { ShieldAlert } from "lucide-react";

export default function Admin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "authorized" | "unauthorized">("loading");
  const tabParam = searchParams.get("tab");
  const defaultTab = ["receipts", "establishments", "products", "users", "reports"].includes(
    tabParam ?? "",
  )
    ? tabParam!
    : "receipts";

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();

        if (error) {
          throw error;
        }

        if (!data.user) {
          navigate("/auth");
          return;
        }

        const isAdmin = await fetchAdminStatus();

        setStatus(isAdmin ? "authorized" : "unauthorized");
      } catch (error) {
        console.error("Erro ao validar acesso admin:", error);
        toast.error("Não foi possível validar o acesso ao painel.");
        setStatus("unauthorized");
      }
    };

    checkAccess();
  }, [navigate]);

  return (
    <AppLayout title="Admin" showNav={false} showBack>
      <div className="container px-4 py-6">
        {status === "loading" ? (
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Validando acesso administrativo...</p>
          </Card>
        ) : status === "unauthorized" ? (
          <Card className="p-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <ShieldAlert className="h-10 w-10 text-destructive" />
              <div>
                <h2 className="text-lg font-semibold">Acesso restrito</h2>
                <p className="text-sm text-muted-foreground">
                  Este painel é exclusivo para administradores.
                </p>
              </div>
              <Button onClick={() => navigate("/dashboard")}>
                Voltar para o dashboard
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="p-6">
              <h1 className="text-2xl font-semibold">Painel administrativo</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Controle completo de comprovantes, parceiros, produtos e indicadores.
              </p>
            </Card>

            <Tabs defaultValue={defaultTab} className="space-y-6">
              <TabsList className="flex flex-wrap">
                <TabsTrigger value="receipts">Comprovantes</TabsTrigger>
                <TabsTrigger value="establishments">Estabelecimentos</TabsTrigger>
                <TabsTrigger value="products">Produtos</TabsTrigger>
                <TabsTrigger value="users">Usuários</TabsTrigger>
                <TabsTrigger value="reports">Relatórios</TabsTrigger>
              </TabsList>

              <TabsContent value="receipts">
                <AdminReceiptsPanel />
              </TabsContent>
              <TabsContent value="establishments">
                <AdminEstablishmentsPanel />
              </TabsContent>
              <TabsContent value="products">
                <AdminProductsPanel />
              </TabsContent>
              <TabsContent value="users">
                <AdminUsersPanel />
              </TabsContent>
              <TabsContent value="reports">
                <AdminReportsPanel />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
