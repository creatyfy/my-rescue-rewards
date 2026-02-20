import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { Copy, Share2, Users, Gift, TrendingUp } from "lucide-react";
import {
  fetchMyReferralCode,
  fetchReferralStats,
  buildReferralLink,
  type ReferralStats,
} from "@/integrations/supabase/referral";
import { supabase } from "@/integrations/supabase/client";

export default function Referral() {
  const [referralLink, setReferralLink] = useState("");
  const [stats, setStats] = useState<ReferralStats>({ total_referred: 0, total_points_earned: 0 });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !mounted) return;

        const [code, referralStats] = await Promise.all([
          fetchMyReferralCode(),
          fetchReferralStats(user.id),
        ]);

        if (!mounted) return;

        if (code) setReferralLink(buildReferralLink(code));
        setStats(referralStats);
      } catch (err) {
        console.error("Erro ao carregar dados de indicação:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success("Link copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar. Tente manualmente.");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Meu Resgate — Indicação",
          text: "Cadastre-se pelo meu link e ganhe pontos exclusivos!",
          url: referralLink,
        });
      } catch {
        // cancelled
      }
    } else {
      await handleCopy();
    }
  };

  return (
    <AppLayout title="Indique e Ganhe" showBack>
      <div className="container px-4 py-6 space-y-5">

        {/* Hero */}
        <div className="rounded-2xl gradient-primary p-6 text-primary-foreground text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
            <Gift className="h-7 w-7" />
          </div>
          <h1 className="font-display text-xl font-bold mb-1">Indique e Ganhe!</h1>
          <p className="text-sm opacity-90">
            Ganhe <strong>100 pontos</strong> para cada amigo que se cadastrar pelo seu link exclusivo.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 text-center border border-border/50">
            <div className="flex justify-center mb-2">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <p className="font-display font-bold text-2xl text-foreground">
              {loading ? "—" : stats.total_referred}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Amigos indicados</p>
          </Card>
          <Card className="p-4 text-center border border-border/50">
            <div className="flex justify-center mb-2">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <p className="font-display font-bold text-2xl text-foreground">
              {loading ? "—" : stats.total_points_earned.toLocaleString("pt-BR")}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Pontos ganhos</p>
          </Card>
        </div>

        {/* Link section */}
        <Card className="p-5 border border-border/50 space-y-4">
          <div>
            <p className="text-sm font-semibold text-foreground mb-2">Seu link exclusivo</p>
            <div className="rounded-lg border border-border bg-muted/40 px-3 py-2">
              {loading ? (
                <p className="text-xs text-muted-foreground">Carregando...</p>
              ) : referralLink ? (
                <p className="break-all text-xs text-foreground font-mono leading-relaxed">
                  {referralLink}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">Link não disponível. Tente novamente.</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={handleCopy} disabled={!referralLink || loading} className="w-full gap-2">
              <Copy className="h-4 w-4" />
              {copied ? "Copiado!" : "Copiar link"}
            </Button>
            <Button variant="outline" onClick={handleShare} disabled={!referralLink || loading} className="w-full gap-2">
              <Share2 className="h-4 w-4" />
              Compartilhar
            </Button>
          </div>
        </Card>

        {/* How it works */}
        <Card className="p-5 border border-border/50">
          <p className="text-sm font-semibold text-foreground mb-3">Como funciona</p>
          <ol className="space-y-3 text-xs text-muted-foreground list-decimal list-inside">
            <li>Compartilhe seu link exclusivo com amigos e familiares.</li>
            <li>Cada pessoa que se cadastrar pelo seu link conta como uma indicação válida.</li>
            <li>Assim que o cadastro for concluído, <span className="font-medium text-foreground">100 pontos</span> são creditados automaticamente na sua conta.</li>
            <li>Sem limite de indicações — quanto mais amigos, mais pontos!</li>
          </ol>
        </Card>

      </div>
    </AppLayout>
  );
}
