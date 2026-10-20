import {
  HelpCircle,
  History,
  Home,
  Package,
  QrCode,
  Settings,
  ShoppingBag,
  User,
} from "lucide-react";

export const navItems = [
  { icon: Home, label: "Início", path: "/dashboard" },
  { icon: QrCode, label: "Escanear", path: "/scan" },
  { icon: ShoppingBag, label: "Loja", path: "/store" },
  { icon: Package, label: "Meus Pedidos", path: "/meus-pedidos" },
  { icon: History, label: "Histórico", path: "/history" },
  { icon: User, label: "Perfil", path: "/profile", matchPrefix: true },
  { icon: HelpCircle, label: "Ajuda", path: "/help" },
  { icon: Settings, label: "Configurações", path: "/settings" },
];

export const adminNavItems = [
  { label: "Comprovantes", path: "/admin/receipts" },
  { label: "Estabelecimentos", path: "/admin/establishments" },
  { label: "Produtos", path: "/admin/products" },
  { label: "Usuários", path: "/admin/users" },
  { label: "Resgates", path: "/admin/redemptions" },
  { label: "Pedidos", path: "/admin/orders" },
  { label: "Campanhas", path: "/admin/campaigns" },
];
