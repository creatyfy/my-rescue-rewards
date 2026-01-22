import { useEffect, useRef, useState, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Upload, Store, CheckCircle, AlertCircle, CameraOff, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { fetchStoreByQrValue, submitReceiptForCurrentUser } from "@/integrations/supabase/receipts";
import { uploadReceiptForCurrentUser } from "@/integrations/supabase/storage";

type ScanStep = "ready" | "scan" | "form" | "success";

export default function Scan() {
  const [step, setStep] = useState<ScanStep>("ready");
  const [establishmentName, setEstablishmentName] = useState("");
  const [purchaseValue, setPurchaseValue] = useState("");
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [qrCodeToken, setQrCodeToken] = useState<string | null>(null);
  const [isValidatingQr, setIsValidatingQr] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);
  
  const scannerRef = useRef<{ stop: () => Promise<void>; clear: () => void } | null>(null);
  const isProcessingRef = useRef(false);

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

  const stopScanner = useCallback(async () => {
    if (!scannerRef.current) return;
    
    try {
      await scannerRef.current.stop();
      scannerRef.current.clear();
    } catch (error) {
      console.error("Erro ao parar scanner:", error);
    } finally {
      scannerRef.current = null;
    }
  }, []);

  const handleQrDetected = useCallback(async (payload: string) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    setIsValidatingQr(true);

    const token = extractQrToken(payload);
    console.log("QR Code detectado:", token);

    try {
      const store = await fetchStoreByQrValue(token);

      if (!store) {
        toast.error("QR Code inválido ou loja não encontrada.");
        isProcessingRef.current = false;
        setIsValidatingQr(false);
        return;
      }

      await stopScanner();
      setQrCodeToken(token);
      setEstablishmentName(store.name);
      setStep("form");
      toast.success(`Loja identificada: ${store.name}`);
    } catch (error) {
      console.error("Erro ao validar QR:", error);
      toast.error("Erro ao validar QR Code.");
      isProcessingRef.current = false;
    } finally {
      setIsValidatingQr(false);
    }
  }, [stopScanner]);

  const openCamera = () => {
    setCameraError(null);
    setIsLoadingCamera(true);
    isProcessingRef.current = false;
    setStep("scan");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptFile || !qrCodeToken) return;

    const parsedValue = Number.parseFloat(purchaseValue);
    if (Number.isNaN(parsedValue) || parsedValue < 10) {
      toast.error("Valor mínimo é R$ 10,00.");
      return;
    }

    try {
      setIsSubmitting(true);
      const receiptPath = await uploadReceiptForCurrentUser(receiptFile);
      await submitReceiptForCurrentUser({
        qrCodeToken,
        purchaseValue: parsedValue,
        receiptPath,
      });
      setStep("success");
    } catch (error) {
      console.error("Erro ao enviar:", error);
      toast.error("Não foi possível enviar o comprovante.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep("ready");
    setEstablishmentName("");
    setPurchaseValue("");
    setReceiptImage(null);
    setReceiptFile(null);
    setQrCodeToken(null);
    setCameraError(null);
    isProcessingRef.current = false;
  };

  const handleCancelScan = async () => {
    await stopScanner();
    setStep("ready");
    setCameraError(null);
    setIsLoadingCamera(false);
  };

  useEffect(() => {
    if (step !== "scan") {
      void stopScanner();
      return;
    }

    let mounted = true;

    const initScanner = async () => {
      // Wait for DOM to be ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (!mounted) return;

      const container = document.getElementById("qr-reader-container");
      if (!container) {
        console.error("Container não encontrado");
        setCameraError("Erro interno. Tente novamente.");
        setIsLoadingCamera(false);
        return;
      }

      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        
        if (!mounted) return;

        // Create unique ID for this scanner instance
        const scannerId = "qr-scanner-" + Date.now();
        container.innerHTML = `<div id="${scannerId}" style="width: 100%; height: 100%;"></div>`;
        
        const scanner = new Html5Qrcode(scannerId);
        
        scannerRef.current = {
          stop: async () => {
            try {
              const state = scanner.getState();
              if (state === 2) { // SCANNING
                await scanner.stop();
              }
            } catch (e) {
              console.warn("Stop error:", e);
            }
          },
          clear: () => {
            try {
              scanner.clear();
            } catch (e) {
              console.warn("Clear error:", e);
            }
          },
        };

        console.log("Iniciando câmera...");

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 200, height: 200 },
            aspectRatio: 1,
          },
          (decodedText) => {
            console.log("Lido:", decodedText);
            void handleQrDetected(decodedText);
          },
          () => {} // Ignore failed scans
        );

        console.log("Câmera iniciada com sucesso");
        if (mounted) {
          setIsLoadingCamera(false);
        }
      } catch (error) {
        console.error("Erro ao iniciar câmera:", error);
        
        if (!mounted) return;

        const msg = error instanceof Error ? error.message : String(error);
        
        if (msg.includes("NotAllowedError") || msg.includes("Permission")) {
          setCameraError("Permissão de câmera negada. Verifique as configurações do navegador.");
        } else if (msg.includes("NotFoundError") || msg.includes("no camera")) {
          setCameraError("Nenhuma câmera encontrada no dispositivo.");
        } else if (msg.includes("NotReadableError") || msg.includes("in use")) {
          setCameraError("Câmera em uso por outro app. Feche e tente novamente.");
        } else {
          setCameraError("Não foi possível acessar a câmera: " + msg);
        }
        
        setIsLoadingCamera(false);
        scannerRef.current = null;
      }
    };

    void initScanner();

    return () => {
      mounted = false;
      void stopScanner();
    };
  }, [step, handleQrDetected, stopScanner]);

  return (
    <AppLayout title="Escanear QR" showBack>
      <div className="container px-4 py-6">
        {step === "ready" && (
          <div className="flex flex-col items-center max-w-sm mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl gradient-primary flex items-center justify-center shadow-primary">
              <Camera className="w-12 h-12 text-primary-foreground" />
            </div>

            <h2 className="font-display text-2xl font-bold text-foreground mb-2 text-center">
              Escanear QR Code
            </h2>
            <p className="text-muted-foreground text-center mb-8">
              Aponte a câmera para o QR Code da loja parceira
            </p>

            <div className="w-full bg-accent/50 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-sm text-foreground mb-2">Como funciona:</h3>
              <ol className="text-xs text-muted-foreground space-y-1">
                <li>1. Clique em "Abrir câmera"</li>
                <li>2. Permita o acesso à câmera</li>
                <li>3. Aponte para o QR Code da loja</li>
                <li>4. Informe o valor e envie o comprovante</li>
              </ol>
            </div>

            <Button onClick={openCamera} className="w-full" size="lg">
              <Camera className="w-5 h-5 mr-2" />
              Abrir câmera
            </Button>
          </div>
        )}

        {step === "scan" && (
          <div className="flex flex-col items-center">
            {cameraError ? (
              <div className="max-w-sm mx-auto text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
                  <CameraOff className="w-10 h-10 text-destructive" />
                </div>
                <h2 className="font-display text-xl font-bold text-foreground mb-2">
                  Erro na câmera
                </h2>
                <p className="text-muted-foreground mb-6 text-sm">
                  {cameraError}
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleCancelScan} className="flex-1">
                    Voltar
                  </Button>
                  <Button onClick={openCamera} className="flex-1">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Tentar novamente
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Camera container */}
                <div className="w-full max-w-sm aspect-square bg-black rounded-3xl overflow-hidden relative mb-4">
                  {/* Scanner will be injected here */}
                  <div 
                    id="qr-reader-container" 
                    className="w-full h-full [&_video]:w-full [&_video]:h-full [&_video]:object-cover"
                  />
                  
                  {/* Overlay corners */}
                  <div className="absolute inset-4 pointer-events-none">
                    <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-primary rounded-tl-xl" />
                    <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-primary rounded-tr-xl" />
                    <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-primary rounded-bl-xl" />
                    <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-primary rounded-br-xl" />
                  </div>

                  {/* Loading overlay */}
                  {isLoadingCamera && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
                      <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                      <p className="text-white text-sm">Iniciando câmera...</p>
                    </div>
                  )}

                  {/* Validating overlay */}
                  {isValidatingQr && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
                      <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                      <p className="text-white text-sm">Validando QR Code...</p>
                    </div>
                  )}
                </div>

                <p className="text-center text-muted-foreground text-sm mb-4">
                  Posicione o QR Code dentro da área
                </p>

                <Button variant="outline" onClick={handleCancelScan} className="w-full max-w-sm">
                  Cancelar
                </Button>
              </>
            )}
          </div>
        )}

        {step === "form" && (
          <div className="max-w-sm mx-auto">
            <div className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-accent border border-border/50">
              <div className="p-3 rounded-xl bg-primary/10">
                <Store className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Loja identificada</p>
                <p className="font-display font-semibold text-foreground">
                  {establishmentName}
                </p>
              </div>
              <CheckCircle className="w-5 h-5 text-success ml-auto" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                          Toque para tirar uma foto
                        </p>
                        <p className="text-xs text-muted-foreground">
                          do comprovante de compra
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
                  disabled={isSubmitting || !purchaseValue || parseFloat(purchaseValue) < 10 || !receiptImage}
                >
                  {isSubmitting ? "Enviando..." : "Enviar"}
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
              Seu comprovante está aguardando aprovação.
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
