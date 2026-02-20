import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { Megaphone, Trash2, Send, Store, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Campaign {
  id: string;
  title: string;
  message: string;
  store_id: string | null;
  admin_id: string;
  created_at: string;
  status: string;
  store_name?: string;
}

interface Establishment {
  id: string;
  name: string;
}

export function AdminCampaignsPanel() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [storeQuery, setStoreQuery] = useState("");
  const [selectedStore, setSelectedStore] = useState<Establishment | null>(null);
  const [showStoreSuggestions, setShowStoreSuggestions] = useState(false);

  const filteredStores = storeQuery.trim().length > 0
    ? establishments.filter((e) =>
        e.name.toLowerCase().includes(storeQuery.toLowerCase())
      )
    : establishments.slice(0, 8);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const client = supabase as any;
      const [{ data: camps }, { data: estabs }] = await Promise.all([
        client.from("campaigns").select("*").order("created_at", { ascending: false }),
        client.from("establishments").select("id, name").eq("active", true).order("name"),
      ]);

      setEstablishments(estabs ?? []);

      // Enrich campaigns with store names
      const estabMap = new Map<string, string>((estabs ?? []).map((e: Establishment) => [e.id, e.name]));
      setCampaigns(
        (camps ?? []).map((c: Campaign) => ({
          ...c,
          store_name: c.store_id ? (estabMap.get(c.store_id) ?? "—") : "—",
        }))
      );
    } catch (err) {
      console.error("Erro ao carregar campanhas:", err);
      toast.error("Erro ao carregar campanhas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSelectStore = (store: Establishment) => {
    setSelectedStore(store);
    setStoreQuery(store.name);
    setShowStoreSuggestions(false);
  };

  const handleClearStore = () => {
    setSelectedStore(null);
    setStoreQuery("");
  };

  const isFormValid = title.trim().length > 0 && message.trim().length > 0;

  const handleDispatch = async () => {
    setConfirmOpen(false);
    setSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Sessão expirada. Faça login novamente.");
        return;
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const res = await fetch(`${supabaseUrl}/functions/v1/send-campaign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          store_id: selectedStore?.id ?? null,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Erro ao disparar campanha.");
        return;
      }

      toast.success(`Campanha disparada para ${json.recipients} usuários!`);
      setTitle("");
      setMessage("");
      setSelectedStore(null);
      setStoreQuery("");
      fetchData();
    } catch (err) {
      console.error("Erro ao disparar campanha:", err);
      toast.error("Erro inesperado ao disparar campanha.");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from("campaigns").delete().eq("id", id);
      if (error) throw error;
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
      toast.success("Campanha removida.");
    } catch (err) {
      console.error("Erro ao excluir campanha:", err);
      toast.error("Erro ao excluir campanha.");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Form */}
      <Card className="p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Nova campanha</h2>
        </div>

        <div className="space-y-2">
          <Label htmlFor="camp-title">Título da campanha</Label>
          <Input
            id="camp-title"
            placeholder="Ex: Promoção de fim de ano"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
          />
        </div>

        {/* Store autocomplete */}
        <div className="space-y-2 relative">
          <Label htmlFor="camp-store">Loja parceira (opcional)</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="camp-store"
                className="pl-9"
                placeholder="Buscar loja..."
                value={storeQuery}
                onChange={(e) => {
                  setStoreQuery(e.target.value);
                  setSelectedStore(null);
                  setShowStoreSuggestions(true);
                }}
                onFocus={() => setShowStoreSuggestions(true)}
                onBlur={() => setTimeout(() => setShowStoreSuggestions(false), 150)}
                autoComplete="off"
              />
              {showStoreSuggestions && filteredStores.length > 0 && (
                <div className="absolute z-10 top-full mt-1 w-full bg-popover border rounded-md shadow-md max-h-52 overflow-y-auto">
                  {filteredStores.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                      onMouseDown={() => handleSelectStore(s)}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedStore && (
              <Button variant="ghost" size="sm" onClick={handleClearStore} className="shrink-0">
                Limpar
              </Button>
            )}
          </div>
          {selectedStore && (
            <p className="text-xs text-muted-foreground">
              Loja selecionada: <span className="font-medium text-foreground">{selectedStore.name}</span>
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="camp-message">Mensagem</Label>
          <Textarea
            id="camp-message"
            placeholder="Escreva a mensagem que será enviada para todos os usuários..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            maxLength={1000}
          />
          <p className="text-xs text-muted-foreground text-right">{message.length}/1000</p>
        </div>

        {/* Preview */}
        {(title.trim() || message.trim()) && (
          <div className="rounded-lg border bg-muted/30 p-4 space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Preview da notificação</p>
            <p className="font-semibold text-sm">{title.trim() || "Título da campanha"}</p>
            <p className="text-sm text-muted-foreground">{message.trim() || "Mensagem da campanha"}</p>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            onClick={() => setConfirmOpen(true)}
            disabled={!isFormValid || sending}
            className="gap-2"
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Disparando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Disparar campanha
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Campaigns list */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Campanhas disparadas</h2>
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : campaigns.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">
            Nenhuma campanha disparada ainda.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Mensagem</TableHead>
                  <TableHead>Loja</TableHead>
                  <TableHead>Disparada em</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((camp) => (
                  <TableRow key={camp.id}>
                    <TableCell className="font-medium max-w-[180px] truncate">{camp.title}</TableCell>
                    <TableCell className="text-muted-foreground max-w-[260px] truncate">{camp.message}</TableCell>
                    <TableCell className="text-muted-foreground">{camp.store_name}</TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {format(new Date(camp.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {camp.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        disabled={deleting === camp.id}
                        onClick={() => handleDelete(camp.id)}
                      >
                        {deleting === camp.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Confirm modal */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Confirmar disparo
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Esta campanha será enviada para <strong className="text-foreground">todos os usuários ativos</strong>. Deseja continuar?
            </p>
            <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
              <p className="font-semibold text-sm">{title}</p>
              <p className="text-xs text-muted-foreground">{message}</p>
              {selectedStore && (
                <p className="text-xs text-muted-foreground">Loja: {selectedStore.name}</p>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleDispatch} className="gap-2">
              <Send className="h-4 w-4" />
              Confirmar disparo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
