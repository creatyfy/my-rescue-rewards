import { Capacitor } from "@capacitor/core";

/** true quando rodando dentro do app nativo (Android/iOS via Capacitor). */
export const isNativePlatform = (): boolean => Capacitor.isNativePlatform();

/**
 * Abre o scanner nativo de QR (ML Kit) e devolve o valor lido, ou null se
 * o usuário cancelar. Lança erro se a permissão de câmera for negada.
 */
export async function scanQrNative(): Promise<string | null> {
  const { BarcodeScanner } = await import("@capacitor-mlkit/barcode-scanning");

  // Em alguns Androids o módulo do Google precisa ser baixado uma vez.
  try {
    const { available } = await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
    if (!available) {
      await BarcodeScanner.installGoogleBarcodeScannerModule();
    }
  } catch {
    // isGoogleBarcodeScannerModuleAvailable só existe no Android; ignora no iOS.
  }

  const perm = await BarcodeScanner.requestPermissions();
  if (perm.camera !== "granted" && perm.camera !== "limited") {
    throw new Error("Permissão de câmera negada.");
  }

  const { barcodes } = await BarcodeScanner.scan();
  if (!barcodes || barcodes.length === 0) return null;
  return barcodes[0].rawValue ?? null;
}

/**
 * Abre a câmera nativa pra tirar uma foto (ex.: comprovante) e devolve um File,
 * ou null se cancelar. `source` = 'camera' (tirar foto) ou 'photos' (galeria).
 */
export async function takePhotoNative(
  source: "camera" | "photos" = "camera",
): Promise<File | null> {
  const { Camera, CameraResultType, CameraSource } = await import("@capacitor/camera");

  const photo = await Camera.getPhoto({
    quality: 80,
    allowEditing: false,
    resultType: CameraResultType.Uri,
    source: source === "camera" ? CameraSource.Camera : CameraSource.Photos,
    saveToGallery: false,
  }).catch(() => null);

  if (!photo?.webPath) return null;

  const res = await fetch(photo.webPath);
  const blob = await res.blob();
  const ext = photo.format || "jpeg";
  return new File([blob], `comprovante-${Date.now()}.${ext}`, {
    type: blob.type || `image/${ext}`,
  });
}
