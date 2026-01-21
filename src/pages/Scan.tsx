import { useEffect, useRef, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Upload, Store, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { fetchEstablishmentByQrToken, submitReceiptForCurrentUser } from "@/integrations/supabase/receipts";
import { uploadReceiptForCurrentUser } from "@/integrations/supabase/storage";

type ScanStep = "scan" | "form" | "success";

type QrScanner = {
  stop: () => Promise<void>;
  clear: () => void;
};

export default function Scan() {
  const [step, setStep] = useState<ScanStep>("scan");
  const [establishmentName, setEstablishmentName] = useState("");
  const [purchaseValue, setPurchaseValue] = useState("");
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [qrCodeToken, setQrCodeToken] = useState<string | null>(null);
  const [isValidatingQr, setIsValidatingQr] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scannerRef = useRef<QrScanner | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const extractQrToken = (payload: string) => {
    try {
      const url = new URL(payload);
      return url.searchParams.get("token") || url.searchParams.get("qr") || payload;
    } catch {
      return payload;
    }
  };

  const stopScanner = async () => {
    if (!scannerRef.current) {
      return;
    }

    try {
      await scannerRef.current.stop();
      scannerRef.current.clear();
    } catch (error) {
      console.error("Erro ao parar o scanner:", error);
    } finally {
      scannerRef.current = null;
    }
  };

  const handleQrDetected = async (payload: string) => {
    if (isValidatingQr) {
      return;
    }

    const token = extractQrToken(payload);
    setIsValidatingQr(true);

    try {
      const establishment = await fetchEstablishmentByQrToken(token);

      if (!establishment) {
        toast.error("QR Code inválido ou estabelecimento inativo.");
        return;
      }

      setQrCodeToken(token);
      setEstablishmentName(establishment.name);
      await stopScanner();
      setStep("form");
    } catch (error) {
      console.error("Erro ao validar QR Code:", error);
      toast.error("Não foi possível validar o QR Code.");
    } finally {
      setIsValidatingQr(false);
    }
  };

  const handleScanSuccess = async () => {
    const demoToken = import.meta.env.VITE_DEMO_QR_TOKEN as string | undefined;

    if (!demoToken) {
      toast.error("Token de demonstração não configurado.");
      return;
    }

    await handleQrDetected(demoToken);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptFile || !qrCodeToken) {
      return;
    }

    try {
      const parsedValue = Number.parseFloat(purchaseValue);
      if (Number.isNaN(parsedValue) || parsedValue < 10) {
        toast.error("Valor mínimo é R$ 10,00.");
        return;
      }

      setIsSubmitting(true);
      const receiptPath = await uploadReceiptForCurrentUser(receiptFile);
      await submitReceiptForCurrentUser({
        qrCodeToken,
        purchaseValue: parsedValue,
        receiptPath,
      });
      setStep("success");
    } catch (error) {
      console.error("Erro ao enviar comprovante:", error);
      toast.error("Não foi possível enviar o comprovante.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep("scan");
    setEstablishmentName("");
    setPurchaseValue("");
    setReceiptImage(null);
    setReceiptFile(null);
    setQrCodeToken(null);
  };

  useEffect(() => {
    if (step !== "scan") {
      void stopScanner();
      return;
    }

    let active = true;

    const startScanner = async () => {
      if (scannerRef.current || !active) {
        return;
      }

      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("qr-reader");
      
      // Create a wrapper that adapts the Html5Qrcode interface
      scannerRef.current = {
        stop: () => scanner.stop(),
        clear: () => scanner.clear(),
      };

      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decodedText) => {
            void handleQrDetected(decodedText);
          },
          () => undefined,
        );
      } catch (error) {
        console.error("Erro ao iniciar o scanner:", error);
        toast.error("Não foi possível acessar a câmera.");
        scannerRef.current = null;
      }
    };

    void startScanner();

    return () => {
      active = false;
      void stopScanner();
    };
  }, [step]);

  return (
    <AppLayout title="Escanear QR">
      <div className="container px-4 py-6">
        {step === "scan" && (
          <div className="flex flex-col items-center">
            {/* Scanner Area */}
            <div className="w-full max-w-sm aspect-square bg-card rounded-3xl border-2 border-dashed border-primary/30 flex flex-col items-center justify-center mb-6 relative overflow-hidden">
              <div className="absolute inset-0" id="qr-reader" />
              <div className="absolute inset-4 border-2 border-primary/50 rounded-2xl">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
              </div>
              
              <div className="text-center z-10">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl gradient-primary flex items-center justify-center shadow-primary">
                  <Camera className="w-8 h-8 text-primary-foreground" />
                </div>
                <p className="font-display font-semibold text-lg text-foreground mb-1">
                  Aponte para o QR Code
                </p>
                <p className="text-sm text-muted-foreground">
                  do estabelecimento parceiro
                </p>
              </div>
            </div>

            {/* Info */}
            <div className="w-full max-w-sm bg-accent/50 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-sm text-foreground mb-2">Como funciona:</h3>
              <ol className="text-xs text-muted-foreground space-y-1">
                <li>1. Escaneie o QR Code do estabelecimento</li>
                <li>2. Informe o valor da sua compra</li>
                <li>3. Envie a foto do comprovante</li>
                <li>4. Aguarde a aprovação e ganhe pontos!</li>
              </ol>
            </div>

            {/* Manual simulation button */}
            <Button onClick={handleScanSuccess} className="w-full max-w-sm">
              Simular escaneamento
            </Button>
          </div>
        )}

        {step === "form" && (
          <div className="max-w-sm mx-auto">
            {/* Establishment Info */}
            <div className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-accent border border-border/50">
              <div className="p-3 rounded-xl bg-primary/10">
                <Store className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Estabelecimento</p>
                <p className="font-display font-semibold text-foreground">
                  {establishmentName}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Purchase Value */}
              <div className="space-y-2">
                <Label htmlFor="value">Valor da compra (mínimo R$ 10)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                    R$
                  </span>
                  <Input
                    id="value"
                    type="number"
                    min="10"
                    step="0.01"
                    placeholder="0,00"
                    value={purchaseValue}
                    onChange={(e) => setPurchaseValue(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
                {purchaseValue && parseFloat(purchaseValue) >= 10 && (
                  <p className="text-xs text-success flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Você receberá {Math.floor(parseFloat(purchaseValue))} pontos
                  </p>
                )}
                {purchaseValue && parseFloat(purchaseValue) < 10 && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Valor mínimo é R$ 10,00
                  </p>
                )}
              </div>

              {/* Receipt Upload */}
              <div className="space-y-2">
                <Label>Foto do comprovante</Label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    required
                  />
                  <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
                    {receiptImage ? (
                      <img
                        src={receiptImage}
                        alt="Comprovante"
                        className="max-h-48 mx-auto rounded-lg"
                      />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm font-medium text-foreground">
                          Toque para enviar
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ou tire uma foto do comprovante
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={
                    isSubmitting || !purchaseValue || parseFloat(purchaseValue) < 10 || !receiptImage
                  }
                >
                  Enviar
                </Button>
              </div>
            </form>
          </div>
        )}

        {step === "success" && (
          <div className="max-w-sm mx-auto text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              Enviado com sucesso!
            </h2>
            <p className="text-muted-foreground mb-6">
              Seu comprovante foi enviado e está aguardando aprovação. Você será notificado quando os pontos forem creditados.
            </p>
            <div className="p-4 rounded-xl bg-accent border border-border/50 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pontos estimados:</span>
                <span className="font-display font-bold text-lg text-foreground">
                  +{Math.floor(parseFloat(purchaseValue))} pts
                </span>
              </div>
            </div>
            <Button onClick={resetForm} className="w-full">
              Escanear outro QR
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
