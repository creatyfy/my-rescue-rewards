import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Camera,
  Upload,
  Store,
  CheckCircle,
  AlertCircle,
  CameraOff,
  RefreshCw,
  Loader2,
  FileText,
} from "lucide-react";
import { toast } from "@/components/ui/sonner";
import {
  fetchReceiptEstablishments,
  fetchStoreByQrValue,
  submitReceiptWithFile,
} from "@/integrations/supabase/receipts";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import { isNativePlatform, scanQrNative, takePhotoNative } from "@/lib/native";

type ScanStep = "ready" | "scan" | "form" | "manual" | "success";

const MAX_RECEIPT_SIZE = 10 * 1024 * 1024;

const formatCurrency = (value: string): string => {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  const numericValue = parseInt(digits, 10) / 100;
  return numericValue.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const parseCurrency = (formatted: string): number => {
  const clean = formatted.replace(/\./g, "").replace(",", ".");
  return parseFloat(clean) || 0;
};

export default function Scan() {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<ScanStep>("ready");
  const [establishmentName, setEstablishmentName] = useState("");
  const [purchaseValue, setPurchaseValue] = useState("");
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreviewType, setReceiptPreviewType] = useState<"image" | "pdf" | null>(null);
  const [qrCodeToken, setQrCodeToken] = useState<string | null>(null);
  const [isValidatingQr, setIsValidatingQr] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);
  const [storeOptions, setStoreOptions] = useState<
    { id: string; name: string; qrCodeToken: string | null }[]
  >([]);
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [storeError, setStoreError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isLoadingStores, setIsLoadingStores] = useState(false);
  const [submissionMode, setSubmissionMode] = useState<"qr" | "manual" | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileWidgetId = useRef<string | null>(null);
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
  
  const scannerRef = useRef<{ stop: () => Promise<void>; clear: () => void } | null>(null);
  const isProcessingRef = useRef(false);

  const validateReceiptFile = (file: File, allowPdf = false) => {
    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf";

    if (!isImage && !(allowPdf && isPdf)) {
      return "Formato inválido. Envie uma imagem (JPG/PNG) ou PDF.";
    }

    if (file.size > MAX_RECEIPT_SIZE) {
      return "O arquivo deve ter no máximo 10MB.";
    }

    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, allowPdf = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const validationError = validateReceiptFile(file, allowPdf);
      setFileError(validationError);

      if (validationError) {
        setReceiptFile(null);
        setReceiptImage(null);
        setReceiptPreviewType(null);
        return;
      }

      setReceiptFile(file);
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setReceiptImage(reader.result as string);
          setReceiptPreviewType("image");
        };
        reader.readAsDataURL(file);
      } else {
        setReceiptImage(null);
        setReceiptPreviewType("pdf");
      }
    }
  };

  const handleNativePhoto = async (source: "camera" | "photos" = "camera") => {
    try {
      const file = await takePhotoNative(source);
      if (!file) return;
      const validationError = validateReceiptFile(file, false);
      setFileError(validationError);
      if (validationError) {
        setReceiptFile(null);
        setReceiptImage(null);
        setReceiptPreviewType(null);
        return;
      }
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
        setReceiptPreviewType("image");
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setFileError(err instanceof Error ? err.message : "Não foi possível abrir a câmera.");
    }
  };

  const extractQrToken = (payload: string) => {
    const trimmed = payload.trim();
    try {
      const url = new URL(trimmed);
      const fromParam = url.searchParams.get("token") || url.searchParams.get("qr");
      if (fromParam) return fromParam.trim();
      // Fallback: use last path segment (e.g. https://.../r/<token>)
      const segments = url.pathname.split("/").filter(Boolean);
      const last = segments[segments.length - 1];
      return (last || trimmed).trim();
    } catch {
      return trimmed;
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
    console.log("QR Code detectado. Payload bruto:", JSON.stringify(payload), "Token extraído:", JSON.stringify(token));

    try {
      const store = await fetchStoreByQrValue(token);

      if (!store) {
        const preview = token.length > 40 ? `${token.slice(0, 40)}…` : token;
        toast.error(`QR Code não reconhecido. Valor lido: ${preview}`);
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
    resetReceiptState();
    setSubmissionMode("qr");
    setStep("scan");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptFile || !qrCodeToken) return;

    const parsedValue = parseCurrency(purchaseValue);
    if (isNaN(parsedValue) || parsedValue < 10) {
      toast.error("Valor mínimo é R$ 10,00.");
      return;
    }

    if (!turnstileToken) {
      toast.error("Confirme o desafio de segurança antes de continuar.");
      return;
    }

    try {
      setIsSubmitting(true);
      await submitReceiptWithFile({
        qrCodeToken,
        purchaseValue: parsedValue,
        file: receiptFile,
        turnstileToken,
      });
      toast.success("Comprovante enviado para análise.");
      setStep("success");
    } catch (error) {
      console.error("Erro ao enviar:", error);
      const message = error instanceof Error ? error.message : "Não foi possível enviar o comprovante.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
      resetTurnstile();
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmissionMode("manual");
    const selectedStore = storeOptions.find((option) => option.id === selectedStoreId);
    const nextStoreError = selectedStore ? null : "Selecione a loja da compra.";
    setStoreError(nextStoreError);

    if (!receiptFile) {
      setFileError("Envie o comprovante para continuar.");
    }

    const validationError = receiptFile ? validateReceiptFile(receiptFile, true) : null;
    if (validationError) {
      setFileError(validationError);
    }

    const parsedValue = parseCurrency(purchaseValue);
    if (isNaN(parsedValue) || parsedValue < 10) {
      toast.error("Valor mínimo é R$ 10,00.");
    }

    if (!selectedStore || !receiptFile || validationError || isNaN(parsedValue) || parsedValue < 10) {
      return;
    }

    if (!selectedStore.qrCodeToken) {
      setStoreError("Esta loja não possui QR Code cadastrado.");
      return;
    }

    if (!turnstileToken) {
      toast.error("Confirme o desafio de segurança antes de continuar.");
      return;
    }

    try {
      setIsSubmitting(true);
      await submitReceiptWithFile({
        qrCodeToken: selectedStore.qrCodeToken,
        purchaseValue: parsedValue,
        file: receiptFile,
        turnstileToken,
      });
      setEstablishmentName(selectedStore.name);
      setQrCodeToken(selectedStore.qrCodeToken);
      toast.success("Comprovante enviado para análise.");
      setStep("success");
    } catch (error) {
      console.error("Erro ao enviar:", error);
      const message = error instanceof Error ? error.message : "Não foi possível enviar o comprovante.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
      resetTurnstile();
    }
  };

  const resetTurnstile = () => {
    if (turnstileWidgetId.current && window.turnstile) {
      window.turnstile.reset(turnstileWidgetId.current);
    }
    setTurnstileToken("");
  };

  const resetReceiptState = () => {
    setEstablishmentName("");
    setPurchaseValue("");
    setReceiptImage(null);
    setReceiptFile(null);
    setReceiptPreviewType(null);
    setQrCodeToken(null);
    setSelectedStoreId("");
    setStoreError(null);
    setFileError(null);
    setSubmissionMode(null);
    resetTurnstile();
  };

  const resetForm = () => {
    setStep("ready");
    resetReceiptState();
    setCameraError(null);
    isProcessingRef.current = false;
  };

  const openManualUpload = () => {
    resetReceiptState();
    setSubmissionMode("manual");
    setStep("manual");
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
      // NATIVO (Android/iOS): usa o scanner ML Kit em vez do html5-qrcode.
      if (isNativePlatform()) {
        try {
          setIsLoadingCamera(true);
          const value = await scanQrNative();
          if (!mounted) return;
          setIsLoadingCamera(false);
          if (value) {
            void handleQrDetected(value);
          } else {
            setStep("ready"); // usuário cancelou
          }
        } catch (err) {
          if (!mounted) return;
          setIsLoadingCamera(false);
          setCameraError(
            err instanceof Error ? err.message : "Não foi possível abrir a câmera.",
          );
        }
        return;
      }

      // WEB: html5-qrcode
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

  useEffect(() => {
    if (step !== "manual") return;

    const loadStores = async () => {
      setIsLoadingStores(true);
      try {
        const stores = await fetchReceiptEstablishments();
        setStoreOptions(stores);
        if (!stores.length) {
          toast.error("Nenhuma loja disponível para envio manual.");
        }
      } catch (error) {
        console.error("Erro ao carregar lojas:", error);
        toast.error("Não foi possível carregar as lojas.");
      } finally {
        setIsLoadingStores(false);
      }
    };

    void loadStores();
  }, [step]);

  useEffect(() => {
    if (searchParams.get("manual") === "1") {
      openManualUpload();
    }
  }, [searchParams]);

  return (
    <AppLayout title="Escanear QR">
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

            <Button onClick={openManualUpload} variant="outline" className="w-full mt-3" size="lg">
              <Upload className="w-5 h-5 mr-2" />
              Enviar comprovante manualmente
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
                    type="text"
                    inputMode="numeric"
                    placeholder="0,00"
                    value={purchaseValue}
                    onChange={(e) => setPurchaseValue(formatCurrency(e.target.value))}
                    className="pl-10"
                    required
                  />
                </div>
                {purchaseValue && parseCurrency(purchaseValue) >= 10 && (
                  <p className="text-xs text-success flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Você receberá {Math.floor(parseCurrency(purchaseValue) * 10).toLocaleString('pt-BR')} pontos
                  </p>
                )}
                {purchaseValue && parseCurrency(purchaseValue) > 0 && parseCurrency(purchaseValue) < 10 && (
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
                    onChange={(event) => handleFileChange(event)}
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
                          Toque para adicionar
                        </p>
                        <p className="text-xs text-muted-foreground">
                          foto ou da galeria
                        </p>
                      </>
                    )}
                  </div>
                </div>
                {isNativePlatform() && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleNativePhoto("camera")}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Câmera
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleNativePhoto("photos")}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Galeria
                    </Button>
                  </div>
                )}
                {fileError && (
                  <p className="text-xs text-destructive flex items-center gap-1" role="alert">
                    <AlertCircle className="w-3 h-3" />
                    {fileError}
                  </p>
                )}
              </div>

              {turnstileSiteKey && (
                <div className="space-y-2">
                  <Label>Verificação de segurança</Label>
                  <TurnstileWidget
                    siteKey={turnstileSiteKey}
                    onVerify={(token) => setTurnstileToken(token)}
                    onExpire={() => setTurnstileToken("")}
                    onError={() => setTurnstileToken("")}
                    onWidgetId={(id) => { turnstileWidgetId.current = id; }}
                    className="w-full"
                  />
                </div>
              )}

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting || !purchaseValue || parseCurrency(purchaseValue) < 10 || !receiptImage || (!turnstileToken && !!turnstileSiteKey)}
                >
                  {isSubmitting ? "Enviando..." : "Enviar"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {step === "manual" && (
          <div className="max-w-sm mx-auto">
            <div className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-accent border border-border/50">
              <div className="p-3 rounded-xl bg-primary/10">
                <Store className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Upload manual</p>
                <p className="font-display font-semibold text-foreground">
                  Informe a loja e envie o comprovante
                </p>
              </div>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="store-select">Selecione a loja da compra</Label>
                <Select
                  value={selectedStoreId}
                  onValueChange={(value) => {
                    setSelectedStoreId(value);
                    setStoreError(null);
                  }}
                  disabled={isLoadingStores}
                >
                  <SelectTrigger
                    id="store-select"
                    className="bg-background"
                    aria-describedby={storeError ? "store-error" : undefined}
                    aria-invalid={Boolean(storeError)}
                  >
                    <SelectValue placeholder={isLoadingStores ? "Carregando lojas..." : "Informe a loja"} />
                  </SelectTrigger>
                  <SelectContent>
                    {storeOptions.map((store) => (
                      <SelectItem key={store.id} value={store.id}>
                        {store.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {storeError && (
                  <p
                    id="store-error"
                    className="text-xs text-destructive flex items-center gap-1"
                    role="alert"
                  >
                    <AlertCircle className="w-3 h-3" />
                    {storeError}
                  </p>
                )}
                {!isLoadingStores && storeOptions.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Nenhuma loja disponível no momento.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="value-manual">Valor da compra (mínimo R$ 10)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                    R$
                  </span>
                  <Input
                    id="value-manual"
                    type="text"
                    inputMode="numeric"
                    placeholder="0,00"
                    value={purchaseValue}
                    onChange={(e) => setPurchaseValue(formatCurrency(e.target.value))}
                    className="pl-10"
                    required
                  />
                </div>
                {purchaseValue && parseCurrency(purchaseValue) >= 10 && (
                  <p className="text-xs text-success flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Você receberá {Math.floor(parseCurrency(purchaseValue) * 10).toLocaleString('pt-BR')} pontos
                  </p>
                )}
                {purchaseValue && parseCurrency(purchaseValue) > 0 && parseCurrency(purchaseValue) < 10 && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Valor mínimo é R$ 10,00
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="manual-receipt">Comprovante (JPG, PNG ou PDF)</Label>
                <div className="relative">
                  <input
                    id="manual-receipt"
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(event) => handleFileChange(event, true)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    aria-describedby={fileError ? "manual-file-error" : undefined}
                    required
                  />
                  <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
                    {receiptPreviewType === "image" && receiptImage ? (
                      <img
                        src={receiptImage}
                        alt="Pré-visualização do comprovante"
                        className="max-h-48 mx-auto rounded-lg"
                      />
                    ) : receiptPreviewType === "pdf" && receiptFile ? (
                      <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="w-8 h-8 text-primary" />
                        <span className="font-medium text-foreground">{receiptFile.name}</span>
                        <span>PDF selecionado</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm font-medium text-foreground">
                          Toque para selecionar o arquivo
                        </p>
                        <p className="text-xs text-muted-foreground">
                          JPG, PNG ou PDF (até 10MB)
                        </p>
                      </>
                    )}
                  </div>
                </div>
                {fileError && (
                  <p
                    id="manual-file-error"
                    className="text-xs text-destructive flex items-center gap-1"
                    role="alert"
                  >
                    <AlertCircle className="w-3 h-3" />
                    {fileError}
                  </p>
                )}
              </div>

              {turnstileSiteKey && (
                <div className="space-y-2">
                  <Label>Verificação de segurança</Label>
                  <TurnstileWidget
                    siteKey={turnstileSiteKey}
                    onVerify={(token) => setTurnstileToken(token)}
                    onExpire={() => setTurnstileToken("")}
                    onError={() => setTurnstileToken("")}
                    onWidgetId={(id) => { turnstileWidgetId.current = id; }}
                    className="w-full"
                  />
                </div>
              )}

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={
                    isSubmitting ||
                    !purchaseValue ||
                    parseCurrency(purchaseValue) < 10 ||
                    !receiptFile ||
                    Boolean(storeError) ||
                    isLoadingStores ||
                    (!turnstileToken && !!turnstileSiteKey)
                  }
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
              Comprovante enviado para análise
            </h2>
            <p className="text-muted-foreground mb-6">
              Seu comprovante foi encaminhado para aprovação.
            </p>
            <div className="p-4 rounded-xl bg-accent border border-border/50 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pontos estimados:</span>
                <span className="font-display font-bold text-lg text-foreground">
                  +{Math.floor(parseCurrency(purchaseValue) * 10).toLocaleString('pt-BR')} pts
                </span>
              </div>
            </div>
            <Button onClick={resetForm} className="w-full">
              {submissionMode === "qr" ? "Escanear outro QR" : "Enviar outro comprovante"}
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
