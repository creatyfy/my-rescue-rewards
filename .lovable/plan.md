
# Plan: Reusable User Profile Modal with WhatsApp and Phone Validation

## Overview
This plan addresses three key requirements:
1. Create a reusable profile modal component to eliminate code duplication
2. Add mandatory phone validation requiring country code 55 during registration and editing
3. Integrate the modal into the Users admin panel

---

## 1. Create Shared Phone Utility Functions

**File: `src/lib/phone-utils.ts` (new)**

Create centralized utility functions for phone handling:
- `normalizePhoneForWhatsapp(phone)` - Normalize phone number for WhatsApp links
- `validateBrazilianPhone(phone)` - Validate phone includes country code 55
- `buildWhatsAppUrl(phone, message?)` - Generate complete WhatsApp URL

This eliminates the duplicated `normalizePhoneForWhatsapp` function currently in both admin panels.

---

## 2. Create Reusable User Profile Modal Component

**File: `src/components/admin/UserProfileModal.tsx` (new)**

A standalone, accessible modal component displaying:
- Full name
- CPF
- Email
- Phone
- Registration date
- Account role/status
- WhatsApp button (disabled when no phone available)

**Props:**
```text
- open: boolean
- onOpenChange: (open: boolean) => void  
- userId: string | null
- triggerRef?: RefObject (for focus management)
```

The component will:
- Fetch user details via `fetchAdminUserDetails` when opened
- Handle loading and error states
- Include accessible `role="dialog"` and `aria-modal="true"` attributes
- Manage focus correctly on open/close

---

## 3. Update Phone Validation in Registration and Profile Edit

### Auth.tsx (Registration)
- Add phone field validation before form submission
- Check that phone number starts with `55` (after removing non-digits)
- Display clear error message: "O telefone deve incluir o código do país 55. Exemplo: 5511912345678"
- Add helper text below the phone input field explaining the requirement

### ProfileEdit.tsx (Profile Editing)
- Apply the same validation rule when saving profile changes
- Show validation error if phone doesn't include country code 55
- Add helper text below the phone input field

---

## 4. Integrate Modal into AdminUsersPanel

**File: `src/components/admin/AdminUsersPanel.tsx`**

Changes:
- Import the new `UserProfileModal` component
- Make the user name in the table a clickable button (matching Receipts/Redemptions panels)
- Add state for modal control: `userModalOpen`, `selectedUserId`
- Add ref for focus management
- Render the `UserProfileModal` component

---

## 5. Refactor Existing Panels to Use Shared Components

### AdminReceiptsPanel.tsx
- Remove local `normalizePhoneForWhatsapp` function
- Import from `src/lib/phone-utils.ts`
- Replace inline user modal with `UserProfileModal` component
- Remove related state variables that are now handled by the shared component

### AdminRedemptionsPanel.tsx
- Remove local `normalizePhoneForWhatsapp` function  
- Import from `src/lib/phone-utils.ts`
- Replace inline user modal with `UserProfileModal` component
- Remove related state variables that are now handled by the shared component

---

## Files to Create

| File | Description |
|------|-------------|
| `src/lib/phone-utils.ts` | Centralized phone validation and WhatsApp utilities |
| `src/components/admin/UserProfileModal.tsx` | Reusable profile modal component |

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Auth.tsx` | Add phone validation requiring 55 prefix |
| `src/pages/ProfileEdit.tsx` | Add phone validation requiring 55 prefix |
| `src/components/admin/AdminUsersPanel.tsx` | Add clickable names + profile modal |
| `src/components/admin/AdminReceiptsPanel.tsx` | Use shared modal and phone utils |
| `src/components/admin/AdminRedemptionsPanel.tsx` | Use shared modal and phone utils |

---

## Technical Details

### Phone Validation Logic
```text
function validateBrazilianPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("55") && digits.length >= 12;
}
```

### WhatsApp URL Format
```text
https://wa.me/{PHONE_DIGITS}?text={ENCODED_MESSAGE}
```
Phone must be in international format without + or special characters (e.g., `5511912345678`).

### Accessibility Requirements
- Modal: `role="dialog"`, `aria-modal="true"`
- Clickable names: `aria-label` describing the action
- WhatsApp button: `aria-label="Abrir conversa no WhatsApp"`
- Disabled state with visual indicator when phone is missing

---

## Acceptance Criteria Checklist

- [ ] Profile modal opens from Receipts panel
- [ ] Profile modal opens from Redemptions panel  
- [ ] Profile modal opens from Users panel (new)
- [ ] WhatsApp button works in all three panels
- [ ] Phone without 55 prefix cannot be saved during registration
- [ ] Phone without 55 prefix cannot be saved during profile edit
- [ ] Clear validation messages displayed to users
- [ ] No code duplication between panels
- [ ] Existing functionality remains intact
