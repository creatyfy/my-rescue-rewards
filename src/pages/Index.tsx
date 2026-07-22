import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Gift,
  QrCode,
  Star,
  ChevronRight,
  Sparkles,
  Download,
  Check,
  Smartphone,
  Share,
  Store,
  Zap,
  ShieldCheck,
  Package,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import logoHorizontal from "@/assets/logo-horizontal.png";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePartners, usePrizes } from "@/hooks/useLandingData";
import type { Partner, Prize } from "@/integrations/supabase/landing";

/* ------------------------------------------------------------------ */
/* Config de marketing — EDITE AQUI os números de vitrine e a chamada  */
/* social. As lojas e prêmios vêm do banco; estes são institucionais.  */
/* ------------------------------------------------------------------ */
const MARKETING = {
  socialProof: "Mais de 10.000 usuários já acumulando pontos",
  stats: [
    { icon: Store, value: "+500", label: "Lojas parceiras" },
    { icon: TrendingUp, value: "+1 milhão", label: "Pontos distribuídos" },
    { icon: Gift, value: "+20 mil", label: "Resgates realizados" },
    { icon: Sparkles, value: "98%", label: "Clientes satisfeitos" },
  ],
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const FALLBACK_PRIZE_IMAGE =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop";

function formatPoints(n: number): string {
  return new Intl.NumberFormat("pt-BR").format(n);
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

// Fallbacks neutros usados SÓ quando a RPC ainda não retornou dados (ex.:
// migration ainda não aplicada). Depois de aplicada, os dados reais entram.
const demoPartners: Partner[] = [
  { id: "d1", name: "Supermercado", logoUrl: null, description: "Mercado" },
  { id: "d2", name: "Farmácia", logoUrl: null, description: "Saúde" },
  { id: "d3", name: "Restaurante", logoUrl: null, description: "Alimentação" },
  { id: "d4", name: "Pet Shop", logoUrl: null, description: "Pets" },
  { id: "d5", name: "Academia", logoUrl: null, description: "Fitness" },
  { id: "d6", name: "Loja", logoUrl: null, description: "Varejo" },
];

const demoPrizes: Prize[] = [
  { id: "p1", name: "Fone Bluetooth", imageUrl: null, pointsCost: 1200, valueReais: null, stock: 5 },
  { id: "p2", name: "Smartwatch", imageUrl: null, pointsCost: 1800, valueReais: null, stock: 3 },
  { id: "p3", name: "Caixa de Som", imageUrl: null, pointsCost: 1500, valueReais: null, stock: 4 },
  { id: "p4", name: "Liquidificador", imageUrl: null, pointsCost: 1000, valueReais: null, stock: 6 },
];

/* ------------------------------------------------------------------ */
/* Página                                                              */
/* ------------------------------------------------------------------ */

export default function Index() {
  const { isInstallable, isInstalled, isIOSDevice, installApp } = usePWAInstall();
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  const { data: partnersData } = usePartners();
  const { data: prizesData } = usePrizes();

  const partners = partnersData && partnersData.length > 0 ? partnersData : demoPartners;
  const prizes = (prizesData && prizesData.length > 0 ? prizesData : demoPrizes).slice(0, 8);

  const handleInstallClick = async () => {
    if (isIOSDevice) setShowIOSInstructions(true);
    else await installApp();
  };

  const statItems = MARKETING.stats;

  return (
    <div className="min-h-screen bg-background">
      {/* ============================= Header ============================= */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src={logoHorizontal} alt="Meu Resgate" className="h-9 w-auto" />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#como-funciona" className="hover:text-foreground transition-colors">Como funciona</a>
            <a href="#parceiros" className="hover:text-foreground transition-colors">Parceiros</a>
            <a href="#premios" className="hover:text-foreground transition-colors">Prêmios</a>
          </nav>

          <div className="flex items-center gap-2">
            {isInstallable && !isInstalled && (
              <Button variant="ghost" size="sm" onClick={handleInstallClick} className="gap-2 hidden sm:flex">
                <Download className="w-4 h-4" />
                Instalar
              </Button>
            )}
            <Button variant="ghost" size="sm" asChild>
              <Link to="/auth">Já tenho conta</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/auth?mode=register">Criar conta</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ============================== Hero ============================== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute top-10 -right-24 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-24 w-72 h-72 bg-secondary/15 rounded-full blur-3xl" />

        <div className="container px-4 py-16 md:py-24 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Copy */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent border border-border/50 mb-6">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Programa de fidelidade inteligente</span>
              </div>

              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-[1.1]">
                Transforme suas compras em{" "}
                <span className="text-primary">recompensas</span>.
              </h1>

              <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto lg:mx-0">
                Acumule pontos em lojas parceiras e troque por produtos exclusivos.
                Simples, rápido e vantajoso.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="xl" asChild>
                  <Link to="/auth?mode=register">
                    Começar agora
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </Link>
                </Button>
                <Button variant="outline" size="xl" asChild>
                  <Link to="/auth">Já tenho conta</Link>
                </Button>
              </div>

              {/* Prova social */}
              <div className="mt-8 flex items-center gap-4 justify-center lg:justify-start">
                <div className="flex -space-x-3">
                  {["from-primary to-cyan-400", "from-secondary to-amber-400", "from-emerald-400 to-teal-500", "from-sky-400 to-indigo-500"].map((g, i) => (
                    <div
                      key={i}
                      className={`w-9 h-9 rounded-full bg-gradient-to-br ${g} ring-2 ring-background`}
                    />
                  ))}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-0.5 text-secondary">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">{MARKETING.socialProof}</p>
                </div>
              </div>
            </div>

            {/* Visual (mockup construído em CSS, sem assets externos) */}
            <HeroVisual />
          </div>
        </div>
      </section>

      {/* ========================== Como funciona ========================= */}
      <section id="como-funciona" className="container px-4 py-16 md:py-24">
        <SectionHeading title="Como funciona" subtitle="Comece em menos de um minuto." />

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <StepCard
            step={1}
            icon={<QrCode className="w-7 h-7 text-primary-foreground" />}
            iconClass="gradient-primary shadow-primary"
            title="Escaneie o QR Code"
            desc="Ao fazer uma compra em um parceiro, escaneie o QR Code da loja."
          />
          <StepCard
            step={2}
            icon={<Star className="w-7 h-7 text-points-gold-foreground" />}
            iconClass="gradient-gold shadow-gold"
            title="Ganhe pontos"
            desc="Envie o comprovante e ganhe 10 pontos para cada R$1 gasto. Simples assim!"
          />
          <StepCard
            step={3}
            icon={<Gift className="w-7 h-7 text-success" />}
            iconClass="bg-success/20"
            title="Resgate prêmios"
            desc="Troque seus pontos por produtos incríveis na nossa loja virtual."
          />
        </div>
      </section>

      {/* ========================= Por que escolher ====================== */}
      <section className="container px-4 pb-4">
        <SectionHeading title="Por que escolher o Meu Resgate?" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          <BenefitCard icon={<Smartphone className="w-6 h-6 text-primary" />} title="Interface simples" desc="Tudo fácil e intuitivo, sem complicação." />
          <BenefitCard icon={<Zap className="w-6 h-6 text-primary" />} title="Pontos automáticos" desc="Seus pontos caem na hora, sem burocracia." />
          <BenefitCard icon={<Package className="w-6 h-6 text-primary" />} title="Produtos exclusivos" desc="Resgate prêmios incríveis na loja virtual." />
          <BenefitCard icon={<ShieldCheck className="w-6 h-6 text-primary" />} title="Acompanhe em tempo real" desc="Veja seus pontos e resgates a qualquer momento." />
        </div>
      </section>

      {/* ============================ Painel ============================= */}
      <section className="container px-4 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Acompanhe tudo no seu painel
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Veja seus pontos, acompanhe resgates, confira parceiros e aproveite ao
              máximo seu programa de fidelidade.
            </p>
            <Button size="lg" asChild>
              <Link to="/auth?mode=register">
                Criar minha conta
                <ChevronRight className="w-5 h-5 ml-1" />
              </Link>
            </Button>
          </div>
          <DashboardVisual />
        </div>
      </section>

      {/* ========================= Lojas parceiras ======================= */}
      <section id="parceiros" className="container px-4 py-8">
        <div className="flex items-end justify-between mb-8 max-w-6xl mx-auto">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">Lojas parceiras</h2>
            <p className="text-muted-foreground mt-1">Acumule pontos em estabelecimentos parceiros.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
          {partners.slice(0, 12).map((p) => (
            <PartnerCard key={p.id} partner={p} />
          ))}
        </div>
      </section>

      {/* ============================= Prêmios =========================== */}
      <section id="premios" className="container px-4 py-16">
        <div className="flex items-end justify-between mb-8 max-w-6xl mx-auto">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Troque seus pontos por prêmios incríveis
            </h2>
            <p className="text-muted-foreground mt-1">Produtos exclusivos esperando por você.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {prizes.map((prize) => (
            <PrizeCard key={prize.id} prize={prize} />
          ))}
        </div>
      </section>

      {/* ============================ Números ============================ */}
      <section className="container px-4 pb-16">
        <div className="max-w-6xl mx-auto rounded-3xl gradient-primary p-8 md:p-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {statItems.map((s, i) => (
              <div key={i} className="text-center text-primary-foreground">
                <s.icon className="w-6 h-6 mx-auto mb-2 opacity-90" />
                <div className="font-display text-3xl md:text-4xl font-bold">{s.value}</div>
                <div className="text-sm text-primary-foreground/80 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================== Depoimentos ========================== */}
      <section className="container px-4 pb-16">
        <SectionHeading title="O que nossos usuários dizem" />
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <TestimonialCard
            text="Acumulei pontos em poucas semanas e já troquei por uma Air Fryer. Plataforma incrível!"
            name="João Carlos"
            since="Cliente desde 2023"
          />
          <TestimonialCard
            text="Muito fácil de usar e os parceiros são ótimos. Já virei fã do Meu Resgate!"
            name="Mariana Silva"
            since="Cliente desde 2024"
          />
          <TestimonialCard
            text="O melhor programa de fidelidade da cidade. Já resgatei vários produtos!"
            name="Ricardo Almeida"
            since="Cliente desde 2023"
          />
        </div>
      </section>

      {/* ============================ CTA final ========================== */}
      <section className="container px-4 py-8">
        <div className="relative overflow-hidden rounded-3xl gradient-primary p-8 md:p-14 text-center max-w-5xl mx-auto">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative max-w-xl mx-auto">
            <h2 className="font-display text-2xl md:text-4xl font-bold text-primary-foreground mb-4">
              Pronto para transformar suas compras em recompensas?
            </h2>
            <p className="text-primary-foreground/80 mb-8">
              Cadastre-se gratuitamente e comece agora mesmo.
            </p>
            <Button variant="gold" size="xl" asChild>
              <Link to="/auth?mode=register">
                Criar conta grátis
                <ArrowRight className="w-5 h-5 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ============================= Footer ============================ */}
      <footer className="border-t border-border/50 mt-8">
        <div className="container px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <img src={logoHorizontal} alt="Meu Resgate" className="h-8 w-auto mb-4" />
              <p className="text-sm text-muted-foreground max-w-xs">
                Seu programa de fidelidade inteligente. Acumule pontos e troque por prêmios.
              </p>
            </div>
            <FooterCol
              title="Navegação"
              links={[
                { label: "Como funciona", href: "#como-funciona" },
                { label: "Parceiros", href: "#parceiros" },
                { label: "Prêmios", href: "#premios" },
              ]}
            />
            <FooterCol
              title="Minha conta"
              links={[
                { label: "Entrar", href: "/auth" },
                { label: "Criar conta", href: "/auth?mode=register" },
              ]}
              asRoutes
            />
            <div>
              <h4 className="font-display font-semibold text-foreground mb-3">Baixe nosso app</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Acesse mais rápido direto do seu celular.
              </p>
              {(!isInstalled) && (
                <Button variant="outline" size="sm" onClick={handleInstallClick} className="gap-2">
                  <Download className="w-4 h-4" />
                  Instalar app
                </Button>
              )}
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">© 2026 Meu Resgate. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* ==================== iOS install instructions =================== */}
      <Dialog open={showIOSInstructions} onOpenChange={setShowIOSInstructions}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" />
              Instalar no iPhone/iPad
            </DialogTitle>
            <DialogDescription>
              Siga os passos abaixo para adicionar o app à sua tela inicial
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {[
              { n: 1, t: "Toque no botão Compartilhar", d: "Na barra inferior do Safari, toque no ícone de compartilhar (quadrado com seta para cima)." },
              { n: 2, t: "Adicionar à Tela de Início", d: 'Role para baixo e toque em "Adicionar à Tela de Início".' },
              { n: 3, t: "Confirme a instalação", d: 'Toque em "Adicionar" no canto superior direito.' },
            ].map((s) => (
              <div key={s.n} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-semibold text-sm">
                  {s.n}
                </div>
                <div>
                  <p className="font-medium text-foreground">{s.t}</p>
                  <p className="text-sm text-muted-foreground">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
          <Button onClick={() => setShowIOSInstructions(false)} className="w-full">
            Entendi
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Subcomponentes                                                      */
/* ------------------------------------------------------------------ */

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="text-center mb-12">
      <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">{title}</h2>
      {subtitle && <p className="text-muted-foreground max-w-md mx-auto">{subtitle}</p>}
    </div>
  );
}

function StepCard({
  step,
  icon,
  iconClass,
  title,
  desc,
}: {
  step: number;
  icon: React.ReactNode;
  iconClass: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="group relative p-6 rounded-2xl bg-card border border-border/50 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
      <div className="absolute top-6 right-6 font-display text-4xl font-bold text-muted/40">{step}</div>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${iconClass}`}>
        {icon}
      </div>
      <h3 className="font-display font-semibold text-lg text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function BenefitCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="p-5 rounded-2xl bg-card border border-border/50 shadow-soft hover:shadow-medium transition-all duration-300">
      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-3">{icon}</div>
      <h3 className="font-display font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function PartnerCard({ partner }: { partner: Partner }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl bg-card border border-border/50 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
      {partner.logoUrl ? (
        <img src={partner.logoUrl} alt={partner.name} className="h-12 w-12 object-contain rounded-lg" />
      ) : (
        <div className="h-12 w-12 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground font-display font-bold">
          {initials(partner.name)}
        </div>
      )}
      <span className="text-sm font-medium text-foreground text-center truncate w-full">{partner.name}</span>
    </div>
  );
}

function PrizeCard({ prize }: { prize: Prize }) {
  return (
    <div className="group rounded-2xl bg-card border border-border/50 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      <div className="aspect-square bg-muted/40 overflow-hidden">
        <img
          src={prize.imageUrl || FALLBACK_PRIZE_IMAGE}
          alt={prize.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = FALLBACK_PRIZE_IMAGE;
          }}
        />
      </div>
      <div className="p-4">
        <h3 className="font-medium text-foreground text-sm mb-2 truncate">{prize.name}</h3>
        <div className="flex items-center gap-1.5 mb-3">
          <Star className="w-4 h-4 text-secondary fill-current" />
          <span className="font-display font-bold text-foreground">{formatPoints(prize.pointsCost)}</span>
          <span className="text-xs text-muted-foreground">pontos</span>
        </div>
        <Button size="sm" className="w-full" asChild>
          <Link to="/auth?mode=register">Resgatar</Link>
        </Button>
      </div>
    </div>
  );
}

function TestimonialCard({ text, name, since }: { text: string; name: string; since: string }) {
  return (
    <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-soft">
      <div className="flex items-center gap-0.5 text-secondary mb-3">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-current" />
        ))}
      </div>
      <p className="text-foreground mb-5 leading-relaxed">"{text}"</p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-display font-bold text-sm">
          {initials(name)}
        </div>
        <div>
          <p className="font-medium text-foreground text-sm">{name}</p>
          <p className="text-xs text-muted-foreground">{since}</p>
        </div>
      </div>
    </div>
  );
}

function FooterCol({
  title,
  links,
  asRoutes,
}: {
  title: string;
  links: { label: string; href: string }[];
  asRoutes?: boolean;
}) {
  return (
    <div>
      <h4 className="font-display font-semibold text-foreground mb-3">{title}</h4>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            {asRoutes ? (
              <Link to={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {l.label}
              </Link>
            ) : (
              <a href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {l.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* -------- Visuais construídos em CSS (sem assets de terceiros) -------- */

function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-sm lg:max-w-md">
      {/* Card "celular" */}
      <div className="relative rounded-[2.5rem] border-8 border-foreground/90 bg-card shadow-large overflow-hidden aspect-[9/16] max-h-[520px] mx-auto">
        <div className="gradient-primary p-6 text-primary-foreground">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Gift className="w-4 h-4" />
            </div>
            <span className="font-display font-bold">Meu Resgate</span>
          </div>
          <p className="text-sm text-primary-foreground/80">Saldo de pontos</p>
          <p className="font-display text-4xl font-bold mb-1">2.560</p>
          <p className="text-xs text-primary-foreground/70">pontos disponíveis</p>
        </div>
        <div className="p-5 space-y-3">
          <div className="rounded-xl bg-primary/10 flex items-center gap-3 p-3">
            <QrCode className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-foreground">Escanear QR Code</span>
          </div>
          <div className="rounded-xl border border-border/50 p-3">
            <p className="text-xs text-muted-foreground mb-1">10 pontos por R$1</p>
            <p className="text-sm font-medium text-foreground">em compras nos parceiros</p>
          </div>
          <div className="rounded-xl border border-border/50 p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
              <Check className="w-4 h-4 text-success" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Resgate aprovado</p>
              <p className="text-xs text-muted-foreground">Parabéns!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Badges flutuantes */}
      <div className="absolute -top-4 -left-4 md:-left-8 animate-float">
        <div className="points-badge shadow-gold">
          <Star className="w-4 h-4 fill-current" /> +250 pontos
        </div>
      </div>
      <div className="absolute bottom-16 -right-4 md:-right-8 animate-float" style={{ animationDelay: "1.5s" }}>
        <div className="bg-card border border-border/50 shadow-medium rounded-xl px-3 py-2 flex items-center gap-2">
          <QrCode className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">QR Lido</span>
        </div>
      </div>
    </div>
  );
}

function DashboardVisual() {
  return (
    <div className="rounded-2xl bg-card border border-border/50 shadow-large p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm text-muted-foreground">Olá, João 👋</p>
          <p className="font-display font-semibold text-foreground">Bem-vindo de volta</p>
        </div>
        <Button size="sm" variant="outline" className="pointer-events-none">
          <QrCode className="w-4 h-4 mr-1" /> Escanear
        </Button>
      </div>

      <div className="rounded-xl gradient-primary p-4 text-primary-foreground mb-4">
        <p className="text-xs text-primary-foreground/80">Saldo de pontos</p>
        <p className="font-display text-3xl font-bold">2.560</p>
        <p className="text-xs text-primary-foreground/70 mt-1">+320 pontos este mês</p>
      </div>

      {/* mini gráfico */}
      <div className="rounded-xl border border-border/50 p-4">
        <p className="text-xs text-muted-foreground mb-3">Evolução de pontos</p>
        <div className="flex items-end gap-1.5 h-20">
          {[30, 45, 40, 60, 55, 75, 90].map((h, i) => (
            <div key={i} className="flex-1 rounded-t gradient-primary" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
