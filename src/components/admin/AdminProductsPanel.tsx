import { useEffect, useState } from "react";
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
  AdminProduct,
  createProduct,
  deleteProduct,
  fetchAdminProducts,
  updateProduct,
} from "@/integrations/supabase/admin";
import { Pencil, Plus, Trash2 } from "lucide-react";

const formatPoints = (value: number) => `${value.toLocaleString("pt-BR")} pts`;

type ProductFormState = {
  id?: string;
  name: string;
  description: string;
  pointsCost: string;
  stock: string;
  imageUrl: string;
  imageFile: File | null;
  active: boolean;
};

const emptyFormState: ProductFormState = {
  name: "",
  description: "",
  pointsCost: "",
  stock: "",
  imageUrl: "",
  imageFile: null,
  active: true,
};

export function AdminProductsPanel() {
  const [items, setItems] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formState, setFormState] = useState<ProductFormState>(emptyFormState);
  const [saving, setSaving] = useState(false);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminProducts();
      setItems(data);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      toast.error("Não foi possível carregar os produtos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleOpenCreate = () => {
    setFormState(emptyFormState);
    setDialogOpen(true);
  };

  const handleOpenEdit = (item: AdminProduct) => {
    setFormState({
      id: item.id,
      name: item.name,
      description: item.description ?? "",
      pointsCost: String(item.points_cost),
      stock: String(item.stock),
      imageUrl: item.image_url ?? "",
      imageFile: null,
      active: item.active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formState.name.trim()) {
      toast.error("Informe o nome do produto.");
      return;
    }

    const pointsCost = Number(formState.pointsCost);
    const stock = Number(formState.stock);

    if (Number.isNaN(pointsCost) || pointsCost <= 0) {
      toast.error("Informe o custo em pontos do produto.");
      return;
    }

    if (Number.isNaN(stock) || stock < 0) {
      toast.error("Informe o estoque do produto.");
      return;
    }

    try {
      setSaving(true);
      if (formState.id) {
        const updated = await updateProduct({
          id: formState.id,
          name: formState.name,
          description: formState.description || null,
          pointsCost,
          stock,
          imageFile: formState.imageFile,
          imageUrl: formState.imageUrl || null,
          active: formState.active,
        });
        setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        toast.success("Produto atualizado.");
      } else {
        const created = await createProduct({
          name: formState.name,
          description: formState.description || null,
          pointsCost,
          stock,
          imageFile: formState.imageFile,
          imageUrl: formState.imageUrl || null,
          active: formState.active,
        });
        setItems((prev) => [created, ...prev]);
        toast.success("Produto criado.");
      }
      setDialogOpen(false);
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      const message = error instanceof Error ? error.message : "Não foi possível salvar o produto.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      toast.success("Produto removido.");
    } catch (error) {
      console.error("Erro ao remover produto:", error);
      const message = error instanceof Error ? error.message : "Não foi possível remover o produto.";
      toast.error(message);
    }
  };

  useEffect(() => {
    if (!dialogOpen) {
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
      setLocalPreviewUrl(null);
      return;
    }

    if (!formState.imageFile) {
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
      setLocalPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(formState.imageFile);
    setLocalPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState.imageFile, dialogOpen]);

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-1 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Produtos</h2>
            <p className="text-sm text-muted-foreground">
              Controle o catálogo de resgates e estoque disponível.
            </p>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Novo produto
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando produtos...</p>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-muted-foreground/40 p-6 text-center text-sm text-muted-foreground">
          Nenhum produto cadastrado.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Ativo</TableHead>
              <TableHead>Pontos</TableHead>
              <TableHead>Estoque</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-12 w-12 rounded-lg border object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg border bg-muted" />
                    )}
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {item.description ?? "Sem descrição"}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{item.active ? "Sim" : "Não"}</TableCell>
                <TableCell>{formatPoints(item.points_cost)}</TableCell>
                <TableCell>{item.stock}</TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenEdit(item)}>
                      <Pencil className="mr-1 h-4 w-4" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-destructive/50 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="mr-1 h-4 w-4" />
                      Excluir
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{formState.id ? "Editar produto" : "Novo produto"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="rounded-xl border border-border/50 p-4">
              <p className="text-sm font-medium text-foreground mb-3">Preview</p>
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-xl border overflow-hidden bg-muted">
                  {(localPreviewUrl || formState.imageUrl) ? (
                    <img
                      src={localPreviewUrl ?? formState.imageUrl}
                      alt={formState.name || "Preview do produto"}
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
              <Label htmlFor="product-name">Nome</Label>
              <Input
                id="product-name"
                value={formState.name}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, name: event.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="product-description">Descrição</Label>
              <Textarea
                id="product-description"
                value={formState.description}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, description: event.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="product-points">Custo em pontos</Label>
              <Input
                id="product-points"
                type="number"
                min={0}
                value={formState.pointsCost}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, pointsCost: event.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="product-stock">Estoque</Label>
              <Input
                id="product-stock"
                type="number"
                min={0}
                value={formState.stock}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, stock: event.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="product-image">Imagem (upload)</Label>
              <Input
                id="product-image"
                type="file"
                accept="image/*"
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    imageFile: event.target.files?.[0] ?? null,
                  }))
                }
              />
              <Label htmlFor="product-image-url">Imagem (URL)</Label>
              <Input
                id="product-image-url"
                value={formState.imageUrl}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, imageUrl: event.target.value }))
                }
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">Produto ativo</p>
                <p className="text-sm text-muted-foreground">
                  Produtos inativos não ficam visíveis para resgate.
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
