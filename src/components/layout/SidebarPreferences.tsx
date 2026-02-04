import { LogOut, Moon } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { DeleteAccountDialog } from "./DeleteAccountDialog";

interface SidebarPreferencesProps {
  isDarkMode: boolean;
  onThemeChange: (checked: boolean) => void;
  onLogout: () => void;
}

export function SidebarPreferences({
  isDarkMode,
  onThemeChange,
  onLogout,
}: SidebarPreferencesProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Preferências</SidebarGroupLabel>
      <SidebarMenu className="gap-1">
        <SidebarMenuItem>
          <div className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground">
            <span className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span>Modo escuro</span>
            </span>
            <Switch
              checked={isDarkMode}
              onCheckedChange={onThemeChange}
              aria-label="Alternar modo escuro"
            />
          </div>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton onClick={onLogout} tooltip="Sair da conta">
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span>Sair da conta</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <DeleteAccountDialog />
      </SidebarMenu>
    </SidebarGroup>
  );
}
