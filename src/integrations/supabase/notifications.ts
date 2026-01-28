import { supabase } from "./client";

export type NotificationType = 
  | "comprovante_aprovado" 
  | "comprovante_recusado" 
  | "resgate_aprovado";

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  arquivada: boolean;
  tipo: NotificationType | null;
  created_at: string;
}

export async function fetchUserNotifications(): Promise<Notification[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { data, error } = await client
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .eq("arquivada", false)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }

  return (data || []).map((n: Record<string, unknown>) => ({
    id: n.id as string,
    user_id: n.user_id as string,
    title: n.title as string,
    message: n.message as string,
    is_read: n.is_read as boolean,
    arquivada: (n.arquivada ?? false) as boolean,
    tipo: (n.tipo ?? null) as NotificationType | null,
    created_at: n.created_at as string,
  }));
}

export async function fetchUnreadCount(): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { count, error } = await client
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false)
    .eq("arquivada", false);

  if (error) {
    console.error("Error fetching unread count:", error);
    return 0;
  }

  return count || 0;
}

export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId);

  if (error) {
    console.error("Error marking notification as read:", error);
    return false;
  }

  return true;
}

export async function markAllNotificationsAsRead(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { error } = await client
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false)
    .eq("arquivada", false);

  if (error) {
    console.error("Error marking all notifications as read:", error);
    return false;
  }

  return true;
}

export async function archiveAllNotifications(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { error } = await client
    .from("notifications")
    .update({ arquivada: true })
    .eq("user_id", user.id)
    .eq("arquivada", false);

  if (error) {
    console.error("Error archiving notifications:", error);
    return false;
  }

  return true;
}
