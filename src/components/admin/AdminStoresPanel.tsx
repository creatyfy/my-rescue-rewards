import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/sonner";
import {
  AdminQrCode,
  AdminStore,
  createStore,
  deactivateStore,
  fetchActiveQrCodesForStores,
  fetchAdminStores,
  generateStoreQrCode,
  updateStore,
} from "@/integrations/supabase/admin";
import { Download, Pencil, Plus, QrCode, RefreshCcw } from "lucide-react";

type StoreFormState = {
  id?: string;
  name: string;
  phone: string;
  city: string;
  state: string;
  isActive: boolean;
};

const emptyFormState: StoreFormState = {
  name: "",
  phone: "",
  city: "",
  state: "",
  isActive: true,
};

export function AdminStoresPanel() {
  const [stores, setStores] = useState<AdminStore[]>([]);
  const [qrCodes, setQrCodes] = useState<Record<string, AdminQrCode>>({});
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formState, setFormState] = useState<StoreFormState>(emptyFormState);
  const [saving, setSaving] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const loadStores = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminStores();
      setStores(data);
      const storeIds = data.map((store) => store.id);
      const codes = await fetchActiveQrCodesForStores(storeIds);
      const mapped: Record<string, AdminQrCode> = {};
      codes.forEach((code) => {
        mapped[code.store_id] = code;
      });
      setQrCodes(mapped);
    } catch (error) {
      console.error("Erro ao carregar lojas:", error);
      toast.error("Não foi possível carregar as lojas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStores();
  }, []);

  const handleOpenCreate = () => {
    setFormState(emptyFormState);
    setDialogOpen(true);
  };

  const handleOpenEdit = (store: AdminStore) => {
    setFormState({
      id: store.id,
      name: store.name,
      phone: store.phone,
      city: store.city,
      state: store.state,
      isActive: store.is_active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formState.name.trim() || !formState.phone.trim() || !formState.city.trim() || !formState.state.trim()) {
      toast.error("Preencha nome, telefone, cidade e estado.");
      return;
    }

    try {
      setSaving(true);
      if (formState.id) {
        const updated = await updateStore({
          id: formState.id,
          name: formState.name.trim(),
          phone: formState.phone.trim(),
          city: formState.city.trim(),
          state: formState.state.trim(),
          isActive: formState.isActive,
        });
        setStores((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        toast.success("Loja atualizada.");
      } else {
        const created = await createStore({
          name: formState.name.trim(),
          phone: formState.phone.trim(),
          city: formState.city.trim(),
          state: formState.state.trim(),
          isActive: formState.isActive,
        });
        setStores((prev) => [created, ...prev]);
        toast.success("Loja cadastrada.");
      }
      setDialogOpen(false);
    } catch (error) {
      console.error("Erro ao salvar loja:", error);
      const message = error instanceof Error ? error.message : "Não foi possível salvar a loja.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (storeId: string) => {
    try {
      const updated = await deactivateStore(storeId);
      setStores((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      toast.success("Loja desativada.");
    } catch (error) {
      console.error("Erro ao desativar loja:", error);
      const message = error instanceof Error ? error.message : "Não foi possível desativar a loja.";
      toast.error(message);
    }
  };

  const handleGenerateQr = async (store: AdminStore) => {
    try {
      setGeneratingId(store.id);
      const qr = await generateStoreQrCode(store.id);
      if (!qr) {
        toast.error("Não foi possível gerar o QR Code.");
        return;
      }
      setQrCodes((prev) => ({ ...prev, [store.id]: qr }));
      setStores((prev) =>
        prev.map((item) => (item.id === store.id ? { ...item, qr_code_id: qr.id } : item)),
      );
      toast.success("QR Code gerado.");
    } catch (error) {
      console.error("Erro ao gerar QR Code:", error);
      const message = error instanceof Error ? error.message : "Não foi possível gerar o QR Code.";
      toast.error(message);
    } finally {
      setGeneratingId(null);
    }
  };

  const qrCodeByStore = useMemo(() => qrCodes, [qrCodes]);

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-1 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Lojas parceiras</h2>
            <p className="text-sm text-muted-foreground">
              Cadastre lojas, mantenha os dados atualizados e gere QR Codes ativos.
            </p>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nova loja
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando lojas...</p>
      ) : stores.length === 0 ? (
        <div className="rounded-lg border border-dashed border-muted-foreground/40 p-6 text-center text-sm text-muted-foreground">
          Nenhuma loja cadastrada.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Loja</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Localização</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>QR Code</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stores.map((store) => {
              const qrCode = qrCodeByStore[store.id];
              return (
                <TableRow key={store.id}>
                  <TableCell className="font-medium">{store.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{store.phone}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {store.city} / {store.state}
                  </TableCell>
                  <TableCell>{store.is_active ? "Ativa" : "Inativa"}</TableCell>
                  <TableCell>
                    {qrCode?.qr_image ? (
                      <div className="flex items-center gap-2">
                        <img
                          src={qrCode.qr_image}
                          alt={`QR Code ${store.name}`}
                          className="h-16 w-16 rounded border"
                        />
                        <Button variant="outline" size="sm" asChild>
                          <a href={qrCode.qr_image} download={`qr-${store.name}.png`}>
                            <Download className="mr-1 h-4 w-4" />
                            Download
                          </a>
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Sem QR ativo</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenEdit(store)}>
                        <Pencil className="mr-1 h-4 w-4" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleGenerateQr(store)}
                        disabled={generatingId === store.id}
                      >
                        {generatingId === store.id ? (
                          <RefreshCcw className="mr-1 h-4 w-4 animate-spin" />
                        ) : (
                          <QrCode className="mr-1 h-4 w-4" />
                        )}
                        {store.qr_code_id ? "Regenerar QR" : "Gerar QR"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-destructive/50 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeactivate(store.id)}
                        disabled={!store.is_active}
                      >
                        Desativar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
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
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{formState.id ? "Editar loja" : "Nova loja"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="store-name">Nome</Label>
              <Input
                id="store-name"
                value={formState.name}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, name: event.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="store-phone">Telefone</Label>
              <Input
                id="store-phone"
                value={formState.phone}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, phone: event.target.value }))
                }
              />
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="store-city">Cidade</Label>
                <Input
                  id="store-city"
                  value={formState.city}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, city: event.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="store-state">Estado</Label>
                <Input
                  id="store-state"
                  value={formState.state}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, state: event.target.value }))
                  }
                />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">Loja ativa</p>
                <p className="text-sm text-muted-foreground">
                  Desative para interromper novos escaneamentos.
                </p>
              </div>
              <Switch
                checked={formState.isActive}
                onCheckedChange={(checked) =>
                  setFormState((prev) => ({ ...prev, isActive: checked }))
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
