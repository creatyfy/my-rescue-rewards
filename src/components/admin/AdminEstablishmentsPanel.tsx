import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import {
  AdminEstablishment,
  createEstablishment,
  deleteEstablishment,
  fetchAdminEstablishments,
  updateEstablishment,
} from "@/integrations/supabase/admin";
import { Download, Pencil, Plus, Trash2 } from "lucide-react";

const buildQrCodeUrl = (token: string) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(token)}`;

type EstablishmentFormState = {
  id?: string;
  name: string;
  description: string;
  address: string;
  qrCodeToken: string;
  logoUrl: string;
  logoFile: File | null;
  active: boolean;
};

const emptyFormState: EstablishmentFormState = {
  name: "",
  description: "",
  address: "",
  qrCodeToken: "",
  logoUrl: "",
  logoFile: null,
  active: true,
};

export function AdminEstablishmentsPanel() {
  const [items, setItems] = useState<AdminEstablishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formState, setFormState] = useState<EstablishmentFormState>(emptyFormState);
  const [saving, setSaving] = useState(false);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

  const loadEstablishments = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminEstablishments();
      setItems(data);
    } catch (error) {
      console.error("Erro ao carregar estabelecimentos:", error);
      toast.error("Não foi possível carregar os estabelecimentos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEstablishments();
  }, []);

  const handleOpenCreate = () => {
    setFormState({
      ...emptyFormState,
      qrCodeToken: crypto.randomUUID(),
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (item: AdminEstablishment) => {
    setFormState({
      id: item.id,
      name: item.name,
      description: item.description ?? "",
      address: item.address ?? "",
      qrCodeToken: item.qr_code_token,
      logoUrl: item.logo_url ?? "",
      logoFile: null,
      active: item.active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formState.name.trim()) {
      toast.error("Informe o nome do estabelecimento.");
      return;
    }

    if (!formState.qrCodeToken.trim()) {
      toast.error("Informe o token do QR Code.");
      return;
    }

    try {
      setSaving(true);
      if (formState.id) {
        const updated = await updateEstablishment({
          id: formState.id,
          name: formState.name,
          description: formState.description || null,
          address: formState.address || null,
          qrCodeToken: formState.qrCodeToken,
          logoFile: formState.logoFile,
          logoUrl: formState.logoUrl || null,
          active: formState.active,
        });
        setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        toast.success("Estabelecimento atualizado.");
      } else {
        const created = await createEstablishment({
          name: formState.name,
          description: formState.description || null,
          address: formState.address || null,
          qrCodeToken: formState.qrCodeToken,
          logoFile: formState.logoFile,
          logoUrl: formState.logoUrl || null,
          active: formState.active,
        });
        setItems((prev) => [created, ...prev]);
        toast.success("Estabelecimento criado.");
      }
      setDialogOpen(false);
    } catch (error) {
      console.error("Erro ao salvar estabelecimento:", error);
      const message = error instanceof Error ? error.message : "Não foi possível salvar o estabelecimento.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEstablishment(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      toast.success("Estabelecimento removido.");
    } catch (error) {
      console.error("Erro ao remover estabelecimento:", error);
      const message = error instanceof Error ? error.message : "Não foi possível remover o estabelecimento.";
      toast.error(message);
    }
  };

  useEffect(() => {
    if (!dialogOpen) {
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
      setLocalPreviewUrl(null);
      return;
    }

    if (!formState.logoFile) {
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
      setLocalPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(formState.logoFile);
    setLocalPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState.logoFile, dialogOpen]);

  const qrMap = useMemo(() => new Map<string, string>(), []);
  const [qrRefresh, setQrRefresh] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadQrCodes = () => {
      const entries = items.map((item) => {
        if (!item.qr_code_token) {
          return [item.id, ""] as const;
        }
        return [item.id, buildQrCodeUrl(item.qr_code_token)] as const;
      });

      if (!isMounted) {
        return;
      }

      qrMap.clear();
      entries.forEach(([id, url]) => qrMap.set(id, url));
      setQrRefresh((prev) => prev + 1);
    };

    loadQrCodes();

    return () => {
      isMounted = false;
    };
  }, [items, qrMap]);

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-1 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Estabelecimentos</h2>
            <p className="text-sm text-muted-foreground">
              Gerencie os estabelecimentos parceiros e seus QR Codes.
            </p>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Novo estabelecimento
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando estabelecimentos...</p>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-muted-foreground/40 p-6 text-center text-sm text-muted-foreground">
          Nenhum estabelecimento cadastrado.
        </div>
      ) : (
        <div className="overflow-x-auto -mx-6 px-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Nome</TableHead>
                <TableHead className="whitespace-nowrap">Ativo</TableHead>
                <TableHead className="whitespace-nowrap">QR Code</TableHead>
                <TableHead className="whitespace-nowrap">Endereço</TableHead>
                <TableHead className="text-right whitespace-nowrap">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const qrUrl = qrMap.get(item.id) || "";
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium whitespace-nowrap">{item.name}</TableCell>
                    <TableCell className="whitespace-nowrap">{item.active ? "Sim" : "Não"}</TableCell>
                    <TableCell>
                      {qrUrl ? (
                        <div className="flex items-center gap-2" key={qrRefresh}>
                          <img
                            src={qrUrl}
                            alt={`QR Code ${item.name}`}
                            className="h-12 w-12 sm:h-16 sm:w-16 rounded border"
                          />
                          <Button variant="outline" size="sm" asChild>
                            <a href={qrUrl} download={`qr-${item.name}.png`}>
                              <Download className="h-4 w-4 sm:mr-1" />
                              <span className="hidden sm:inline">Download</span>
                            </a>
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Sem QR</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                      {item.address ?? "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleOpenEdit(item)}>
                          <Pencil className="h-4 w-4 sm:mr-1" />
                          <span className="hidden sm:inline">Editar</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-destructive/50 text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4 sm:mr-1" />
                          <span className="hidden sm:inline">Excluir</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setFormState(emptyFormState);
          }
          setDialogOpen(open);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {formState.id ? "Editar estabelecimento" : "Novo estabelecimento"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="rounded-xl border border-border/50 p-4">
              <p className="text-sm font-medium text-foreground mb-3">Preview</p>
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-xl border overflow-hidden bg-muted">
                  {(localPreviewUrl || formState.logoUrl) ? (
                    <img
                      src={localPreviewUrl ?? formState.logoUrl}
                      alt={formState.name || "Preview do estabelecimento"}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : null}
                </div>
                <p className="text-xs text-muted-foreground">
                  Se você selecionar um arquivo, ele será enviado e substituirá a URL.
                </p>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="est-name">Nome</Label>
              <Input
                id="est-name"
                value={formState.name}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, name: event.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="est-description">Descrição</Label>
              <Textarea
                id="est-description"
                value={formState.description}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, description: event.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="est-address">Endereço</Label>
              <Input
                id="est-address"
                value={formState.address}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, address: event.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="est-qr">Token do QR Code</Label>
              <Input
                id="est-qr"
                value={formState.qrCodeToken}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, qrCodeToken: event.target.value }))
                }
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setFormState((prev) => ({ ...prev, qrCodeToken: crypto.randomUUID() }))
                }
              >
                Gerar novo token
              </Button>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="est-logo">Logo (upload)</Label>
              <Input
                id="est-logo"
                type="file"
                accept="image/*"
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    logoFile: event.target.files?.[0] ?? null,
                  }))
                }
              />
              <Label htmlFor="est-logo-url">Logo (URL)</Label>
              <Input
                id="est-logo-url"
                value={formState.logoUrl}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, logoUrl: event.target.value }))
                }
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">Estabelecimento ativo</p>
                <p className="text-sm text-muted-foreground">
                  Controle se o QR Code fica disponível para clientes.
                </p>
              </div>
              <Switch
                checked={formState.active}
                onCheckedChange={(checked) =>
                  setFormState((prev) => ({ ...prev, active: checked }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
