import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Eye, Receipt, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { createSignedReceiptUrl } from "@/integrations/supabase/storage";
import type { AdminReceiptSummary, AdminEstablishment } from "@/integrations/supabase/admin";
import type { UserSearchResult } from "@/hooks/useAdminReports";

type ReportsReceiptsTableProps = {
  receipts: AdminReceiptSummary[];
  establishments: AdminEstablishment[];
  userLookup: Map<string, UserSearchResult>;
};

const statusConfig: Record<string, { label: string; icon: typeof Clock; className: string }> = {
  pending: {
    label: "Pendente",
    icon: Clock,
    className: "bg-pending/10 text-pending border-pending/30",
  },
  approved: {
    label: "Aprovado",
    icon: CheckCircle,
    className: "bg-success/10 text-success border-success/30",
  },
  rejected: {
    label: "Rejeitado",
    icon: XCircle,
    className: "bg-destructive/10 text-destructive border-destructive/30",
  },
};

const PAGE_SIZE = 10;

export function ReportsReceiptsTable({
  receipts,
  establishments,
  userLookup,
}: ReportsReceiptsTableProps) {
  const [page, setPage] = useState(1);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(receipts.length / PAGE_SIZE));
  const startIdx = (page - 1) * PAGE_SIZE;
  const paginatedReceipts = receipts.slice(startIdx, startIdx + PAGE_SIZE);

  const establishmentMap = new Map(establishments.map((e) => [e.id, e.name]));

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR });
    } catch {
      return "—";
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleViewImage = async (imagePath: string | null) => {
    if (!imagePath) return;
    try {
      const url = await createSignedReceiptUrl(imagePath, 300);
      if (url) {
        setPreviewImage(url);
      }
    } catch (error) {
      console.warn("Failed to create signed URL:", error);
    }
  };

  if (receipts.length === 0) {
    return null;
  }

  return (
    <Card className="overflow-hidden border-border/60">
      <div className="p-4 border-b border-border/50 bg-muted/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-muted-foreground" />
          <div>
            <h3 className="font-semibold text-foreground">Comprovantes</h3>
            <p className="text-sm text-muted-foreground">
              {receipts.length} registro{receipts.length !== 1 ? "s" : ""} encontrado{receipts.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Página {page} de {totalPages}
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <ScrollArea className="w-full">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/20 hover:bg-muted/20">
              <TableHead className="font-semibold text-foreground whitespace-nowrap min-w-[140px]">
                Data
              </TableHead>
              <TableHead className="font-semibold text-foreground whitespace-nowrap min-w-[180px]">
                Usuário
              </TableHead>
              <TableHead className="font-semibold text-foreground whitespace-nowrap min-w-[160px]">
                Estabelecimento
              </TableHead>
              <TableHead className="font-semibold text-foreground text-right whitespace-nowrap min-w-[100px]">
                Valor
              </TableHead>
              <TableHead className="font-semibold text-foreground text-right whitespace-nowrap min-w-[80px]">
                Pontos
              </TableHead>
              <TableHead className="font-semibold text-foreground whitespace-nowrap min-w-[100px]">
                Status
              </TableHead>
              <TableHead className="font-semibold text-foreground text-center whitespace-nowrap min-w-[70px]">
                Imagem
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedReceipts.map((receipt) => {
              const user = userLookup.get(receipt.user_id);
              const status = statusConfig[receipt.status] ?? statusConfig.pending;
              const StatusIcon = status.icon;
              const establishmentName = receipt.establishment_name ?? establishmentMap.get(receipt.establishment_id ?? "") ?? "—";

              return (
                <TableRow key={receipt.id} className="hover:bg-muted/20">
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatDate(receipt.created_at)}
                  </TableCell>
                  <TableCell>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {user?.full_name ?? "Usuário"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user?.email ?? receipt.user_id.slice(0, 8)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-foreground truncate max-w-[160px]">
                    {establishmentName}
                  </TableCell>
                  <TableCell className="text-sm font-medium text-foreground text-right tabular-nums">
                    {formatCurrency(receipt.purchase_value)}
                  </TableCell>
                  <TableCell className="text-sm font-semibold text-primary text-right tabular-nums">
                    {receipt.points.toLocaleString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn("gap-1 text-xs whitespace-nowrap", status.className)}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {receipt.image_path && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleViewImage(receipt.image_path)}
                        title="Visualizar comprovante"
                      >
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Image Preview Modal */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] p-0">
          <DialogHeader className="px-4 py-3 border-b border-border">
            <DialogTitle className="text-sm font-semibold">
              Comprovante
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-muted/30">
            {previewImage && (
              <img
                src={previewImage}
                alt="Comprovante"
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
