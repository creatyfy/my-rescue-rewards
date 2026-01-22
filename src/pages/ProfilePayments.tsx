import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { CreditCard, Trash2 } from "lucide-react";

const initialMethods = [
  {
    id: "card-1",
    brand: "Mastercard",
    last4: "4588",
    expires: "08/26",
    isDefault: true,
  },
  {
    id: "card-2",
    brand: "Visa",
    last4: "1120",
    expires: "11/25",
    isDefault: false,
  },
];

export default function ProfilePayments() {
  const [methods, setMethods] = useState(initialMethods);

  const handleAdd = () => {
    toast.info("Integração de pagamentos em breve.");
  };

  const handleRemove = (id: string) => {
    setMethods((prev) => prev.filter((method) => method.id !== id));
    toast.success("Método removido.");
  };

  return (
    <AppLayout title="Pagamentos" showBack>
      <div className="container px-4 py-6 space-y-6">
        <div className="bg-card border border-border/50 rounded-2xl shadow-soft p-6 space-y-4">
          <div>
            <h2 className="font-display font-semibold text-lg text-foreground">
              Métodos cadastrados
            </h2>
            <p className="text-sm text-muted-foreground">
              Gerencie os cartões usados para resgates e assinaturas.
            </p>
          </div>

          {methods.length === 0 ? (
            <div className="text-sm text-muted-foreground bg-muted/40 rounded-xl p-4">
              Nenhum método cadastrado ainda.
            </div>
          ) : (
            <div className="space-y-3">
              {methods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between gap-4 bg-muted/40 rounded-xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center border border-border/50">
                      <CreditCard className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {method.brand} •••• {method.last4}
                      </p>
                      <p className="text-sm text-muted-foreground">Expira em {method.expires}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {method.isDefault && (
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                        Principal
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(method.id)}
                      aria-label="Remover método"
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button className="w-full" onClick={handleAdd}>
          Adicionar novo método
        </Button>
      </div>
    </AppLayout>
  );
}
