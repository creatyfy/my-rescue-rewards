-- Dispara push (edge function send-push) sempre que uma notificação é criada.
create extension if not exists pg_net;

create or replace function public.notify_push_on_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform net.http_post(
    url := 'https://quhfnktjmkakskuhjamf.supabase.co/functions/v1/send-push',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      -- chave anon (pública) só para passar no verify_jwt; a função usa a
      -- service_role internamente via env.
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1aGZua3RqbWtha3NrdWhqYW1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyNTYyNDgsImV4cCI6MjA5OTgzMjI0OH0.sJrI3_zw7fM8RXTCll6wXsWujCS6oRXWWIqtOxca6lg'
    ),
    body := jsonb_build_object('record', to_jsonb(new))
  );
  return new;
end;
$$;

drop trigger if exists trg_push_on_notification on public.notifications;
create trigger trg_push_on_notification
after insert on public.notifications
for each row execute function public.notify_push_on_notification();
