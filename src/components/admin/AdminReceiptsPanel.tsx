import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import { createSignedReceiptUrl } from "@/integrations/supabase/storage";
import {
  AdminReceipt,
  ReceiptReviewStatus,
  fetchAdminReceipts,
  reviewReceipt,
} from "@/integrations/supabase/admin";
import { CheckCircle, ChevronLeft, ChevronRight, Eye, Search, XCircle } from "lucide-react";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export function AdminReceiptsPanel() {
  const [receipts, setReceipts] = useState<AdminReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewProtocol, setPreviewProtocol] = useState<string | null>(null);

  const [status, setStatus] = useState<ReceiptReviewStatus>("pending");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [total, setTotal] = useState(0);

  const loadReceipts = async () => {
    try {
      setLoading(true);
      const result = await fetchAdminReceipts({ status, query, page, pageSize });
      setReceipts(result.items);
      setTotal(result.total);
    } catch (error) {
      console.error("Erro ao carregar comprovantes pendentes:", error);
      toast.error("Não foi possível carregar os comprovantes pendentes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReceipts();
  }, [status, page]);

  useEffect(() => {
    // Ao alterar a busca, volta para a primeira página e recarrega.
    setPage(1);
    const handle = window.setTimeout(() => {
      loadReceipts();
    }, 250);
    return () => window.clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, status]);

  const handleReview = async (receiptId: string, status: "approved" | "rejected") => {
    try {
      await reviewReceipt(receiptId, status);
      setReceipts((prev) => prev.filter((receipt) => receipt.id !== receiptId));
      setTotal((prev) => Math.max(0, prev - 1));
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
    if (!receipt.receipt_image_url) {
      toast.error("Comprovante sem imagem disponível.");
      return;
    }

    try {
      const url = await createSignedReceiptUrl(receipt.receipt_image_url, 180);
      setPreviewUrl(url);
      setPreviewProtocol(receipt.id.slice(0, 8));
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

      <div className="space-y-4 mb-6">
        <Tabs
          value={status}
          onValueChange={(value) => setStatus(value as ReceiptReviewStatus)}
        >
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="pending">Pendentes</TabsTrigger>
            <TabsTrigger value="approved">Aprovados</TabsTrigger>
            <TabsTrigger value="rejected">Rejeitados</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por loja..."
            className="pl-10"
          />
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {loading ? "" : `${total.toLocaleString("pt-BR")} resultado(s)`}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={loading || page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <span className="text-xs text-muted-foreground">Página {page}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={loading || page * pageSize >= total}
            >
              Próxima
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando comprovantes...</p>
      ) : receipts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-muted-foreground/40 p-6 text-center text-sm text-muted-foreground">
          Nenhum comprovante encontrado.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Comprovante</TableHead>
              <TableHead>Loja</TableHead>
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
                <TableCell className="font-medium">{receipt.id.slice(0, 8)}</TableCell>
                <TableCell>{receipt.store_name ?? "Loja parceira"}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {receipt.user_id}
                </TableCell>
                <TableCell>{formatCurrency(Number(receipt.purchase_value))}</TableCell>
                <TableCell>{receipt.points}</TableCell>
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
                      disabled={!receipt.receipt_image_url}
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
