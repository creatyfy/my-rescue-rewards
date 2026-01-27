import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar";

export function SidebarSkeleton() {
  return (
    <SidebarContent>
      <SidebarGroup className="pt-4">
        <SidebarGroupLabel>Menu</SidebarGroupLabel>
        <SidebarMenu className="gap-1">
          {Array.from({ length: 6 }).map((_, index) => (
            <SidebarMenuItem key={`menu-skeleton-${index}`}>
              <SidebarMenuSkeleton showIcon />
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel>Preferências</SidebarGroupLabel>
        <SidebarMenu className="gap-1">
          {Array.from({ length: 2 }).map((_, index) => (
            <SidebarMenuItem key={`preferences-skeleton-${index}`}>
              <SidebarMenuSkeleton showIcon />
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
  );
}
