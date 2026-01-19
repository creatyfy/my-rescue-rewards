import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/sonner";
import { createSignedReceiptUrl } from "@/integrations/supabase/storage";
import { AdminReceipt, fetchPendingReceipts, reviewReceipt } from "@/integrations/supabase/admin";
import { CheckCircle, Eye, XCircle } from "lucide-react";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export function AdminReceiptsPanel() {
  const [receipts, setReceipts] = useState<AdminReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewProtocol, setPreviewProtocol] = useState<string | null>(null);

  const loadReceipts = async () => {
    try {
      setLoading(true);
      const data = await fetchPendingReceipts();
      setReceipts(data);
    } catch (error) {
      console.error("Erro ao carregar comprovantes pendentes:", error);
      toast.error("Não foi possível carregar os comprovantes pendentes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReceipts();
  }, []);

  const handleReview = async (receiptId: string, status: "approved" | "rejected") => {
    try {
      await reviewReceipt(receiptId, status);
      setReceipts((prev) => prev.filter((receipt) => receipt.id !== receiptId));
      toast.success(
        status === "approved"
          ? "Comprovante aprovado com sucesso."
          : "Comprovante rejeitado.",
      );
    } catch (error) {
      console.error("Erro ao atualizar comprovante:", error);
      toast.error("Não foi possível atualizar o comprovante.");
    }
  };

  const handlePreview = async (receipt: AdminReceipt) => {
    if (!receipt.image_url) {
      toast.error("Comprovante sem imagem disponível.");
      return;
    }

    try {
      const url = await createSignedReceiptUrl(receipt.image_url, 180);
      setPreviewUrl(url);
      setPreviewProtocol(receipt.protocol_number);
    } catch (error) {
      console.error("Erro ao gerar visualização do comprovante:", error);
      toast.error("Não foi possível carregar a imagem do comprovante.");
    }
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-1 mb-6">
        <h2 className="text-lg font-semibold">Aprovação de comprovantes</h2>
        <p className="text-sm text-muted-foreground">
          Revise e aprove os comprovantes enviados pelos usuários.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando comprovantes...</p>
      ) : receipts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-muted-foreground/40 p-6 text-center text-sm text-muted-foreground">
          Nenhum comprovante pendente no momento.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Protocolo</TableHead>
              <TableHead>Estabelecimento</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Pontos</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receipts.map((receipt) => (
              <TableRow key={receipt.id}>
                <TableCell className="font-medium">{receipt.protocol_number}</TableCell>
                <TableCell>{receipt.establishments?.name ?? "Estabelecimento"}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {receipt.user_id}
                </TableCell>
                <TableCell>{formatCurrency(Number(receipt.purchase_value))}</TableCell>
                <TableCell>{receipt.points_earned}</TableCell>
                <TableCell>
                  {new Date(receipt.created_at).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreview(receipt)}
                      disabled={!receipt.image_url}
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      Ver
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleReview(receipt.id, "approved")}
                    >
                      <CheckCircle className="mr-1 h-4 w-4" />
                      Aprovar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-destructive/50 text-destructive hover:bg-destructive/10"
                      onClick={() => handleReview(receipt.id, "rejected")}
                    >
                      <XCircle className="mr-1 h-4 w-4" />
                      Rejeitar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog
        open={Boolean(previewUrl)}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewUrl(null);
            setPreviewProtocol(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Comprovante {previewProtocol}</DialogTitle>
          </DialogHeader>
          {previewUrl && (
            <div className="flex justify-center">
              <img src={previewUrl} alt={`Comprovante ${previewProtocol ?? ""}`} className="max-h-[70vh]" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
