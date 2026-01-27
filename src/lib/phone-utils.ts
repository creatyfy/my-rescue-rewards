/**
 * Centralized phone utilities for validation and WhatsApp integration.
 */

/**
 * Normalize phone number for WhatsApp - removes non-digits and ensures 55 prefix.
 * @param phone - Raw phone string
 * @returns Normalized phone digits or null if invalid
 */
export function normalizePhoneForWhatsapp(phone?: string | null): string | null {
  if (!phone) {
    return null;
  }
  const digits = phone.replace(/\D/g, "");
  if (!digits) {
    return null;
  }
  return digits.startsWith("55") ? digits : `55${digits}`;
}

/**
 * Validate Brazilian phone number - must include country code 55.
 * @param phone - Phone string to validate
 * @returns true if phone starts with 55 and has valid length (12+ digits)
 */
export function validateBrazilianPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  // Must start with 55 and have at least 12 digits (55 + DDD + number)
  return digits.startsWith("55") && digits.length >= 12;
}

/**
 * Build WhatsApp URL from phone number.
 * @param phone - Phone number (will be normalized)
 * @param message - Optional pre-filled message
 * @returns Complete WhatsApp URL or null if phone is invalid
 */
export function buildWhatsAppUrl(phone?: string | null, message?: string): string | null {
  const normalized = normalizePhoneForWhatsapp(phone);
  if (!normalized) {
    return null;
  }
  
  const baseUrl = `https://wa.me/${normalized}`;
  if (message) {
    return `${baseUrl}?text=${encodeURIComponent(message)}`;
  }
  return baseUrl;
}

/**
 * Get phone validation error message.
 * @param phone - Phone to check
 * @returns Error message or null if valid
 */
export function getPhoneValidationError(phone: string): string | null {
  if (!phone.trim()) {
    return null; // Empty is allowed (field-level required check handles this)
  }
  
  const digits = phone.replace(/\D/g, "");
  
  if (!digits.startsWith("55")) {
    return "O telefone deve incluir o código do país 55. Exemplo: 5511912345678";
  }
  
  if (digits.length < 12) {
    return "O telefone deve ter pelo menos 12 dígitos (código do país + DDD + número).";
  }
  
  return null;
}
