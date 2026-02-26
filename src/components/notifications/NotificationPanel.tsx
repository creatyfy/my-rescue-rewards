import { useState, useEffect } from "react";
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  fetchUserNotifications,
  fetchUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  archiveAllNotifications,
  type Notification,
} from "@/integrations/supabase/notifications";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";

export function NotificationPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadNotifications = async () => {
    setIsLoading(true);
    const [notifs, count] = await Promise.all([
      fetchUserNotifications(),
      fetchUnreadCount(),
    ]);
    setNotifications(notifs);
    setUnreadCount(count);
    setIsLoading(false);
  };

  useEffect(() => {
    loadNotifications();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("notifications-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        () => {
          loadNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      const success = await markNotificationAsRead(notification.id);
      if (success) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, is_read: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    const success = await markAllNotificationsAsRead();
    if (success) {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast.success("Todas as notificações foram marcadas como lidas");
    }
  };

  const handleArchiveAll = async () => {
    const success = await archiveAllNotifications();
    if (success) {
      setNotifications([]);
      setUnreadCount(0);
      toast.success("Notificações arquivadas com sucesso");
    } else {
      toast.error("Erro ao arquivar notificações");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return format(date, "'Hoje às' HH:mm", { locale: ptBR });
    } else if (diffInHours < 48) {
      return format(date, "'Ontem às' HH:mm", { locale: ptBR });
    } else {
      return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    }
  };

  const getNotificationIcon = (tipo: Notification["tipo"]) => {
    switch (tipo) {
      case "comprovante_aprovado":
        return "✅";
      case "comprovante_recusado":
        return "❌";
      case "resgate_aprovado":
        return "🎁";
      case "indicacao_aceita":
        return "🤝";
      default:
        return "📢";
    }
  };


  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-sm">Notificações</h3>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={handleMarkAllAsRead}
                title="Marcar todas como lidas"
              >
                <CheckCheck className="w-3.5 h-3.5" />
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1 text-muted-foreground hover:text-destructive"
                onClick={handleArchiveAll}
                title="Limpar notificações"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-[350px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              Carregando...
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-sm text-muted-foreground p-4">
              <Bell className="w-8 h-8 mb-2 opacity-50" />
              <p>Nenhuma notificação</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  className={cn(
                    "w-full text-left p-4 hover:bg-muted/50 transition-colors",
                    !notification.is_read && "bg-primary/5"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-lg flex-shrink-0">
                      {getNotificationIcon(notification.tipo)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm font-medium",
                          notification.is_read && "text-muted-foreground"
                        )}
                      >
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 whitespace-pre-line break-words [overflow-wrap:anywhere]">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        {formatDate(notification.created_at)}
                      </p>
                    </div>
                    {notification.is_read && (
                      <Check className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <div className="p-2 border-t border-border flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              <CheckCheck className="w-3 h-3 mr-1" />
              Marcar lidas
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs text-muted-foreground hover:text-destructive"
              onClick={handleArchiveAll}
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Limpar
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
