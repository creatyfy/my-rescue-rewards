import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { createSignedReceiptUrl } from "@/integrations/supabase/storage";
import {
  AdminReceipt,
  AdminReceiptDetails,
  ReceiptAuditEntry,
  ReceiptReviewStatus,
  fetchAdminEstablishments,
  fetchAdminReceipts,
  fetchAdminReceiptDetails,
  fetchReceiptAuditHistory,
  reviewReceipt,
  updateAdminReceipt,
} from "@/integrations/supabase/admin";
import { CheckCircle, ChevronDown, ChevronLeft, ChevronRight, Eye, Pencil, Search, XCircle } from "lucide-react";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "—";
  }
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const normalizePhoneForWhatsapp = (phone?: string | null) => {
  if (!phone) {
    return null;
  }
  const digits = phone.replace(/\D/g, "");
  if (!digits) {
    return null;
  }
  return digits.startsWith("55") ? digits : `55${digits}`;
};

export function AdminReceiptsPanel() {
  const [receipts, setReceipts] = useState<AdminReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<AdminReceiptDetails | null>(null);
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState<string | null>(null);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const [auditHistory, setAuditHistory] = useState<ReceiptAuditEntry[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState({
    establishmentId: "",
    purchaseValue: "",
    purchaseDate: "",
    pointsEarned: "",
    status: "pending" as ReceiptReviewStatus,
    adminNote: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [establishments, setEstablishments] = useState<Array<{ id: string; name: string }>>([]);

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

  const resetReceiptModal = () => {
    setSelectedReceiptId(null);
    setSelectedReceipt(null);
    setReceiptPreviewUrl(null);
    setReceiptError(null);
    setAuditHistory([]);
    setAuditLoading(false);
    setIsEditing(false);
    setFormError(null);
    setFormLoading(false);
  };

  const populateFormState = (receipt: AdminReceiptDetails) => {
    setFormState({
      establishmentId: receipt.establishment_id ?? "",
      purchaseValue: receipt.purchase_value ? String(receipt.purchase_value) : "",
      purchaseDate: receipt.purchase_date ? receipt.purchase_date.slice(0, 10) : "",
      pointsEarned: receipt.points ? String(receipt.points) : "",
      status: receipt.status,
      adminNote: receipt.admin_note ?? "",
    });
  };

  const loadReceiptDetails = async (receiptId: string) => {
    try {
      setReceiptLoading(true);
      setReceiptError(null);
      setAuditLoading(true);
      const [details, audit] = await Promise.all([
        fetchAdminReceiptDetails(receiptId),
        fetchReceiptAuditHistory(receiptId),
      ]);

      if (!details) {
        setReceiptError("Não foi possível carregar os detalhes do comprovante.");
        return;
      }

      setSelectedReceipt(details);
      populateFormState(details);
      setAuditHistory(audit);

      if (details.receipt_image_url) {
        const url = await createSignedReceiptUrl(details.receipt_image_url, 180);
        setReceiptPreviewUrl(url);
      } else {
        setReceiptPreviewUrl(null);
      }
    } catch (error) {
      console.error("Erro ao carregar detalhes do comprovante:", error);
      setReceiptError("Não foi possível carregar os detalhes do comprovante.");
    } finally {
      setReceiptLoading(false);
      setAuditLoading(false);
    }
  };

  const handleOpenReceipt = async (receipt: AdminReceipt, editMode = false) => {
    setSelectedReceiptId(receipt.id);
    await loadReceiptDetails(receipt.id);
    setIsEditing(editMode);
  };

  const handleSaveReceipt = async () => {
    if (!selectedReceipt) {
      return;
    }

    setFormError(null);

    if (formState.purchaseValue === "" || formState.pointsEarned === "") {
      setFormError("Preencha valor da compra e pontos gerados.");
      return;
    }

    const purchaseValue = Number(formState.purchaseValue);
    const pointsEarned = Number(formState.pointsEarned);

    if (Number.isNaN(purchaseValue) || Number.isNaN(pointsEarned)) {
      setFormError("Informe valores numéricos válidos.");
      return;
    }

    const changes = [];
    if ((selectedReceipt.establishment_id ?? "") !== formState.establishmentId) {
      const previousName = establishments.find((item) => item.id === selectedReceipt.establishment_id)?.name;
      const nextName = establishments.find((item) => item.id === formState.establishmentId)?.name;
      changes.push({
        field: "Loja associada",
        oldValue: previousName ?? selectedReceipt.establishment_id ?? "—",
        newValue: nextName ?? formState.establishmentId ?? "—",
      });
    }
    if (selectedReceipt.purchase_value !== purchaseValue) {
      changes.push({
        field: "Valor da compra",
        oldValue: String(selectedReceipt.purchase_value),
        newValue: String(purchaseValue),
      });
    }
    if (selectedReceipt.points !== pointsEarned) {
      changes.push({
        field: "Pontos gerados",
        oldValue: String(selectedReceipt.points),
        newValue: String(pointsEarned),
      });
    }
    if (selectedReceipt.status !== formState.status) {
      changes.push({
        field: "Status do comprovante",
        oldValue: selectedReceipt.status,
        newValue: formState.status,
      });
    }
    const purchaseDateNormalized = formState.purchaseDate ? `${formState.purchaseDate}T00:00:00` : null;
    if ((selectedReceipt.purchase_date ?? "") !== (purchaseDateNormalized ?? "")) {
      changes.push({
        field: "Data da compra",
        oldValue: selectedReceipt.purchase_date ?? "—",
        newValue: purchaseDateNormalized ?? "—",
      });
    }
    if ((selectedReceipt.admin_note ?? "") !== formState.adminNote) {
      changes.push({
        field: "Observação interna",
        oldValue: selectedReceipt.admin_note ?? "—",
        newValue: formState.adminNote || "—",
      });
    }

    if (changes.length === 0) {
      setFormError("Nenhuma alteração detectada.");
      return;
    }

    try {
      setFormLoading(true);
      await updateAdminReceipt(
        selectedReceipt.id,
        {
          establishment_id: formState.establishmentId || null,
          purchase_value: purchaseValue,
          points_earned: pointsEarned,
          status: formState.status,
          purchase_date: purchaseDateNormalized,
          admin_note: formState.adminNote || null,
        },
        changes,
      );

      toast.success("Comprovante atualizado com sucesso.");
      setIsEditing(false);
      await loadReceiptDetails(selectedReceipt.id);
      await loadReceipts();
    } catch (error) {
      console.error("Erro ao atualizar comprovante:", error);
      setFormError("Não foi possível salvar as alterações.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleReviewFromModal = async (receiptId: string, nextStatus: "approved" | "rejected") => {
    await handleReview(receiptId, nextStatus);
    resetReceiptModal();
  };

  useEffect(() => {
    const loadEstablishments = async () => {
      const result = await fetchAdminEstablishments();
      setEstablishments(result.map((item) => ({ id: item.id, name: item.name })));
    };
    loadEstablishments();
  }, []);

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

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
              <span className="hidden xs:inline">Anterior</span>
            </Button>
            <span className="text-xs text-muted-foreground">Pág. {page}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={loading || page * pageSize >= total}
            >
              <span className="hidden xs:inline">Próxima</span>
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
        <div className="overflow-x-auto -mx-6 px-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Comprovante</TableHead>
                <TableHead className="whitespace-nowrap">Loja</TableHead>
                <TableHead className="whitespace-nowrap">Usuário</TableHead>
                <TableHead className="whitespace-nowrap">Valor</TableHead>
                <TableHead className="whitespace-nowrap">Pontos</TableHead>
                <TableHead className="whitespace-nowrap">Data</TableHead>
                <TableHead className="text-right whitespace-nowrap">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receipts.map((receipt) => (
                <TableRow key={receipt.id}>
                  <TableCell className="font-medium whitespace-nowrap">{receipt.id.slice(0, 8)}</TableCell>
                  <TableCell className="whitespace-nowrap">{receipt.store_name ?? "Loja parceira"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {receipt.user_id.slice(0, 8)}...
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{formatCurrency(Number(receipt.purchase_value))}</TableCell>
                  <TableCell className="whitespace-nowrap">{receipt.points}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {new Date(receipt.created_at).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenReceipt(receipt)}>
                        <Eye className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Ver</span>
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleOpenReceipt(receipt, true)}>
                        <Pencil className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Editar</span>
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleReview(receipt.id, "approved")}
                      >
                        <CheckCircle className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Aprovar</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-destructive/50 text-destructive hover:bg-destructive/10"
                        onClick={() => handleReview(receipt.id, "rejected")}
                      >
                        <XCircle className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Rejeitar</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog
        open={Boolean(selectedReceiptId)}
        onOpenChange={(open) => {
          if (!open) {
            resetReceiptModal();
          }
        }}
      >
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true">
          <DialogHeader>
            <DialogTitle>Comprovante {selectedReceipt?.id.slice(0, 8) ?? ""}</DialogTitle>
          </DialogHeader>

          {receiptLoading ? (
            <p className="text-sm text-muted-foreground">Carregando dados do comprovante...</p>
          ) : receiptError ? (
            <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
              {receiptError}
            </div>
          ) : selectedReceipt ? (
            <div className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
                <section className="space-y-4">
                  <div className="rounded-lg border bg-card p-4">
                    <h3 className="text-sm font-semibold text-muted-foreground">Dados do usuário</h3>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Nome completo</p>
                        <p className="text-sm font-medium">{selectedReceipt.user?.full_name ?? "Não informado"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">CPF / Documento</p>
                        <p className="text-sm font-medium">{selectedReceipt.user?.document ?? "Não informado"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">E-mail</p>
                        <p className="text-sm font-medium">{selectedReceipt.user?.email ?? "Não informado"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Telefone</p>
                        <p className="text-sm font-medium">{selectedReceipt.user?.phone ?? "Não informado"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Data de cadastro</p>
                        <p className="text-sm font-medium">
                          {selectedReceipt.user?.created_at
                            ? formatDateTime(selectedReceipt.user?.created_at)
                            : "Não informado"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Status da conta</p>
                        <p className="text-sm font-medium">
                          {selectedReceipt.user?.role ? `Perfil: ${selectedReceipt.user.role}` : "Usuário"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        disabled={!normalizePhoneForWhatsapp(selectedReceipt.user?.phone)}
                      >
                        <a
                          href={
                            normalizePhoneForWhatsapp(selectedReceipt.user?.phone)
                              ? `https://wa.me/${normalizePhoneForWhatsapp(
                                  selectedReceipt.user?.phone,
                                )}?text=${encodeURIComponent(
                                  `Olá ${selectedReceipt.user?.full_name ?? ""}, tudo bem?`,
                                )}`
                              : "#"
                          }
                          target="_blank"
                          rel="noreferrer"
                        >
                          Abrir conversa no WhatsApp
                        </a>
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-lg border bg-card p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-muted-foreground">Dados do comprovante</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsEditing((prev) => !prev);
                          if (selectedReceipt) {
                            populateFormState(selectedReceipt);
                          }
                          setFormError(null);
                        }}
                      >
                        {isEditing ? "Cancelar edição" : "Editar comprovante"}
                      </Button>
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="establishment">Loja associada</Label>
                        <Select
                          value={formState.establishmentId}
                          onValueChange={(value) =>
                            setFormState((prev) => ({ ...prev, establishmentId: value }))
                          }
                          disabled={!isEditing}
                        >
                          <SelectTrigger id="establishment">
                            <SelectValue placeholder="Selecione a loja" />
                          </SelectTrigger>
                          <SelectContent>
                            {establishments.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="purchase-value">Valor da compra</Label>
                        <Input
                          id="purchase-value"
                          type="number"
                          inputMode="decimal"
                          value={formState.purchaseValue}
                          onChange={(event) =>
                            setFormState((prev) => ({ ...prev, purchaseValue: event.target.value }))
                          }
                          disabled={!isEditing}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="purchase-date">Data da compra</Label>
                        <Input
                          id="purchase-date"
                          type="date"
                          value={formState.purchaseDate}
                          onChange={(event) =>
                            setFormState((prev) => ({ ...prev, purchaseDate: event.target.value }))
                          }
                          disabled={!isEditing}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="points-earned">Pontos gerados</Label>
                        <Input
                          id="points-earned"
                          type="number"
                          inputMode="numeric"
                          value={formState.pointsEarned}
                          onChange={(event) =>
                            setFormState((prev) => ({ ...prev, pointsEarned: event.target.value }))
                          }
                          disabled={!isEditing}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="status">Status do comprovante</Label>
                        <Select
                          value={formState.status}
                          onValueChange={(value) =>
                            setFormState((prev) => ({ ...prev, status: value as ReceiptReviewStatus }))
                          }
                          disabled={!isEditing}
                        >
                          <SelectTrigger id="status">
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pendente</SelectItem>
                            <SelectItem value="approved">Aprovado</SelectItem>
                            <SelectItem value="rejected">Rejeitado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="admin-note">Observação interna do admin</Label>
                        <Textarea
                          id="admin-note"
                          value={formState.adminNote}
                          onChange={(event) =>
                            setFormState((prev) => ({ ...prev, adminNote: event.target.value }))
                          }
                          disabled={!isEditing}
                          rows={3}
                        />
                      </div>
                    </div>

                    {formError ? (
                      <p role="alert" className="mt-3 text-sm text-destructive">
                        {formError}
                      </p>
                    ) : null}

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <Button
                        onClick={() => handleReviewFromModal(selectedReceipt.id, "approved")}
                        disabled={formLoading}
                      >
                        <CheckCircle className="h-4 w-4 sm:mr-1" />
                        Aprovar
                      </Button>
                      <Button
                        variant="outline"
                        className="border-destructive/50 text-destructive hover:bg-destructive/10"
                        onClick={() => handleReviewFromModal(selectedReceipt.id, "rejected")}
                        disabled={formLoading}
                      >
                        <XCircle className="h-4 w-4 sm:mr-1" />
                        Rejeitar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleSaveReceipt}
                        disabled={!isEditing || formLoading}
                      >
                        {formLoading ? "Salvando..." : "Salvar alterações"}
                      </Button>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="rounded-lg border bg-card p-4">
                    <h3 className="text-sm font-semibold text-muted-foreground">Imagem do comprovante</h3>
                    {receiptPreviewUrl ? (
                      <div className="mt-4 flex justify-center">
                        <img
                          src={receiptPreviewUrl}
                          alt={`Comprovante ${selectedReceipt.id.slice(0, 8)}`}
                          className="max-h-[60vh] rounded-md border"
                        />
                      </div>
                    ) : (
                      <p className="mt-4 text-sm text-muted-foreground">Nenhuma imagem disponível.</p>
                    )}
                  </div>

                  <Collapsible defaultOpen>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between">
                        Histórico de alterações
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="rounded-lg border bg-card p-4">
                      {auditLoading ? (
                        <p className="text-sm text-muted-foreground">Carregando histórico...</p>
                      ) : auditHistory.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Nenhuma alteração registrada até o momento.
                        </p>
                      ) : (
                        <ul className="space-y-3" role="list">
                          {auditHistory.map((entry) => (
                            <li key={entry.id} className="text-sm">
                              <p className="font-medium">
                                {formatDateTime(entry.changed_at)} • {entry.admin_name ?? "Admin"}
                              </p>
                              <p className="text-muted-foreground">
                                {entry.field}: {entry.old_value ?? "—"} → {entry.new_value ?? "—"}
                              </p>
                            </li>
                          ))}
                        </ul>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                </section>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
