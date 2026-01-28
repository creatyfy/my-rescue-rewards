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
import { Check, Pencil, Plus, Trash2 } from "lucide-react";
import {
  calculateProductPoints,
  calculateProductValue,
  formatCurrency,
  formatPoints,
  PRODUCT_POINTS_MULTIPLIER,
} from "@/lib/points-config";

type ProductFormState = {
  id?: string;
  name: string;
  description: string;
  prizeValueReais: string;
  pointsCost: string;
  pointsManualEdit: boolean;
  pointsConfirmed: boolean;
  stock: string;
  imageUrl: string;
  imageFile: File | null;
  active: boolean;
};

const emptyFormState: ProductFormState = {
  name: "",
  description: "",
  prizeValueReais: "",
  pointsCost: "",
  pointsManualEdit: false,
  pointsConfirmed: false,
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
    const hasManualEdit = item.points_manual_edit;
    const prizeValue = item.prize_value_reais;
    
    setFormState({
      id: item.id,
      name: item.name,
      description: item.description ?? "",
      prizeValueReais: prizeValue != null ? String(prizeValue) : "",
      pointsCost: String(item.points_cost),
      pointsManualEdit: hasManualEdit,
      pointsConfirmed: true, // Produto existente já está confirmado
      stock: String(item.stock),
      imageUrl: item.image_url ?? "",
      imageFile: null,
      active: item.active,
    });
    setDialogOpen(true);
  };

  const handlePrizeValueChange = (value: string) => {
    const numericValue = parseFloat(value);
    const calculatedPoints = !isNaN(numericValue) && numericValue > 0
      ? calculateProductPoints(numericValue)
      : 0;
    
    setFormState((prev) => ({
      ...prev,
      prizeValueReais: value,
      pointsCost: calculatedPoints > 0 ? String(calculatedPoints) : "",
      pointsManualEdit: false,
      pointsConfirmed: false,
    }));
  };

  const handleConfirmPoints = () => {
    setFormState((prev) => ({
      ...prev,
      pointsConfirmed: true,
      pointsManualEdit: false,
    }));
  };

  const handleEditPoints = () => {
    setFormState((prev) => ({
      ...prev,
      pointsManualEdit: true,
      pointsConfirmed: false,
    }));
  };

  const handlePointsCostChange = (value: string) => {
    setFormState((prev) => ({
      ...prev,
      pointsCost: value,
      pointsConfirmed: false,
    }));
  };

  const handleConfirmManualPoints = () => {
    setFormState((prev) => ({
      ...prev,
      pointsConfirmed: true,
    }));
  };

  const handleSave = async () => {
    if (!formState.name.trim()) {
      toast.error("Informe o nome do produto.");
      return;
    }

    const prizeValueReais = parseFloat(formState.prizeValueReais);
    const pointsCost = Number(formState.pointsCost);
    const stock = Number(formState.stock);

    if (isNaN(prizeValueReais) || prizeValueReais <= 0) {
      toast.error("Informe o valor do prêmio em reais.");
      return;
    }

    if (isNaN(pointsCost) || pointsCost <= 0) {
      toast.error("Informe o custo em pontos do produto.");
      return;
    }

    if (!formState.pointsConfirmed) {
      toast.error("Confirme ou edite o custo em pontos antes de salvar.");
      return;
    }

    if (isNaN(stock) || stock < 0) {
      toast.error("Informe o estoque do produto.");
      return;
    }

    const pointsCalculated = calculateProductPoints(prizeValueReais);

    try {
      setSaving(true);
      if (formState.id) {
        const updated = await updateProduct({
          id: formState.id,
          name: formState.name,
          description: formState.description || null,
          pointsCost,
          prizeValueReais,
          pointsCalculated,
          pointsManualEdit: formState.pointsManualEdit,
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
          prizeValueReais,
          pointsCalculated,
          pointsManualEdit: formState.pointsManualEdit,
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

  const showConfirmationBox =
    formState.prizeValueReais &&
    !isNaN(parseFloat(formState.prizeValueReais)) &&
    parseFloat(formState.prizeValueReais) > 0 &&
    !formState.pointsConfirmed;

  const calculatedPointsDisplay = formState.pointsCost
    ? formatPoints(Number(formState.pointsCost))
    : "0";

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
        <div className="overflow-x-auto -mx-6 px-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Produto</TableHead>
                <TableHead className="whitespace-nowrap">Ativo</TableHead>
                <TableHead className="whitespace-nowrap">Valor (R$)</TableHead>
                <TableHead className="whitespace-nowrap">Pontos</TableHead>
                <TableHead className="whitespace-nowrap">Estoque</TableHead>
                <TableHead className="text-right whitespace-nowrap">Ações</TableHead>
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
                          className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg border object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg border bg-muted flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1 hidden sm:block">
                          {item.description ?? "Sem descrição"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{item.active ? "Sim" : "Não"}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {item.prize_value_reais != null
                      ? formatCurrency(item.prize_value_reais)
                      : formatCurrency(calculateProductValue(item.points_cost))}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex flex-col">
                      <span>{formatPoints(item.points_cost)} pts</span>
                      {item.points_manual_edit && (
                        <span className="text-xs text-muted-foreground">(editado)</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{item.stock}</TableCell>
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
              ))}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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

            {/* Valor do prêmio em reais */}
            <div className="grid gap-2">
              <Label htmlFor="product-prize-value">Valor do prêmio (R$)</Label>
              <Input
                id="product-prize-value"
                type="number"
                min={0}
                step="0.01"
                placeholder="Ex: 500.00"
                value={formState.prizeValueReais}
                onChange={(event) => handlePrizeValueChange(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Regra: 1 real = {PRODUCT_POINTS_MULTIPLIER} pontos
              </p>
            </div>

            {/* Custo em pontos */}
            <div className="grid gap-2">
              <Label htmlFor="product-points">Custo em pontos</Label>
              <Input
                id="product-points"
                type="number"
                min={0}
                value={formState.pointsCost}
                onChange={(event) => handlePointsCostChange(event.target.value)}
                disabled={!formState.pointsManualEdit && !formState.pointsConfirmed}
                className={!formState.pointsManualEdit && !formState.pointsConfirmed ? "bg-muted" : ""}
              />
            </div>

            {/* Bloco de confirmação */}
            {showConfirmationBox && !formState.pointsManualEdit && (
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                <p className="text-sm text-foreground mb-3">
                  Com base no valor informado, este produto exigirá{" "}
                  <strong>{calculatedPointsDisplay} pontos</strong> para resgate.
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Deseja confirmar ou editar esse valor?
                </p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleConfirmPoints}>
                    <Check className="h-4 w-4 mr-1" />
                    Confirmar
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleEditPoints}>
                    <Pencil className="h-4 w-4 mr-1" />
                    Editar pontos
                  </Button>
                </div>
              </div>
            )}

            {/* Bloco para confirmar edição manual */}
            {formState.pointsManualEdit && !formState.pointsConfirmed && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
                <p className="text-sm text-foreground mb-3">
                  Você está editando o custo em pontos manualmente.
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Valor atual: <strong>{calculatedPointsDisplay} pontos</strong>
                </p>
                <Button size="sm" onClick={handleConfirmManualPoints}>
                  <Check className="h-4 w-4 mr-1" />
                  Confirmar edição
                </Button>
              </div>
            )}

            {/* Indicador de confirmação */}
            {formState.pointsConfirmed && (
              <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-3 flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700">
                  Custo em pontos confirmado: {calculatedPointsDisplay} pts
                  {formState.pointsManualEdit && " (editado manualmente)"}
                </span>
              </div>
            )}

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
            <Button onClick={handleSave} disabled={saving || !formState.pointsConfirmed}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
