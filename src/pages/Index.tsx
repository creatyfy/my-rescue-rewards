import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Gift, QrCode, Star, ChevronRight, Sparkles, Download, Check, Smartphone } from "lucide-react";
import logoHorizontal from "@/assets/logo-horizontal.png";
import { usePWAInstall } from "@/hooks/usePWAInstall";

export default function Index() {
  const { isInstallable, isInstalled, installApp } = usePWAInstall();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 -left-20 w-48 h-48 bg-secondary/20 rounded-full blur-3xl" />

        <header className="container px-4 py-4 flex items-center justify-between relative">
          <Link to="/" className="flex items-center">
            <img 
              src={logoHorizontal} 
              alt="Meu Resgate" 
              className="h-10 w-auto"
            />
          </Link>
          <div className="flex items-center gap-2">
            {isInstallable && (
              <Button variant="outline" size="sm" onClick={installApp} className="gap-2">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Instalar App</span>
              </Button>
            )}
            {isInstalled && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/20 text-success text-sm font-medium">
                <Check className="w-4 h-4" />
                <span className="hidden sm:inline">Instalado</span>
              </div>
            )}
            <Button variant="ghost" asChild>
              <Link to="/auth">Entrar</Link>
            </Button>
          </div>
        </header>

        <div className="container px-4 py-16 md:py-24 relative">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent border border-border/50 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                Programa de fidelidade inteligente
              </span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Transforme suas compras em recompensas
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
              Acumule pontos em lojas parceiras e troque por produtos exclusivos. 
              Simples, rápido e vantajoso.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
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

            {/* PWA Install Banner */}
            {isInstallable && (
              <div className="mt-8 p-4 rounded-2xl bg-card border border-border/50 shadow-soft max-w-md mx-auto animate-fade-in">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                    <Smartphone className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="font-semibold text-foreground">Baixe o App</p>
                    <p className="text-sm text-muted-foreground">Acesse mais rápido direto do seu celular</p>
                  </div>
                  <Button size="sm" onClick={installApp} className="flex-shrink-0">
                    <Download className="w-4 h-4 mr-1" />
                    Instalar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features */}
      <section className="container px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Como funciona
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Em poucos passos você começa a acumular pontos e resgatar prêmios
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="group p-6 rounded-2xl bg-card border border-border/50 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-primary mb-4 group-hover:scale-110 transition-transform">
              <QrCode className="w-7 h-7 text-primary-foreground" />
            </div>
            <h3 className="font-display font-semibold text-lg text-foreground mb-2">
              1. Escaneie o QR Code
            </h3>
            <p className="text-sm text-muted-foreground">
              Ao fazer uma compra em um parceiro, escaneie o QR Code da loja
            </p>
          </div>

          <div className="group p-6 rounded-2xl bg-card border border-border/50 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 rounded-2xl gradient-gold flex items-center justify-center shadow-gold mb-4 group-hover:scale-110 transition-transform">
              <Star className="w-7 h-7 text-points-gold-foreground" />
            </div>
            <h3 className="font-display font-semibold text-lg text-foreground mb-2">
              2. Acumule pontos
            </h3>
            <p className="text-sm text-muted-foreground">
              Envie o comprovante e ganhe 1 ponto para cada R$1 gasto. Simples assim!
            </p>
          </div>

          <div className="group p-6 rounded-2xl bg-card border border-border/50 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 rounded-2xl bg-success/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Gift className="w-7 h-7 text-success" />
            </div>
            <h3 className="font-display font-semibold text-lg text-foreground mb-2">
              3. Resgate prêmios
            </h3>
            <p className="text-sm text-muted-foreground">
              Troque seus pontos por produtos incríveis na nossa loja virtual
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container px-4 py-16">
        <div className="relative overflow-hidden rounded-3xl gradient-primary p-8 md:p-12 text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative max-w-xl mx-auto">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
              Pronto para começar a ganhar?
            </h2>
            <p className="text-primary-foreground/80 mb-6">
              Crie sua conta grátis e comece a acumular pontos hoje mesmo
            </p>
            <Button variant="gold" size="lg" asChild>
              <Link to="/auth?mode=register">
                Criar conta grátis
                <ChevronRight className="w-5 h-5 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container px-4 py-8 border-t border-border/50">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center">
            <img 
              src={logoHorizontal} 
              alt="Meu Resgate" 
              className="h-8 w-auto"
            />
          </Link>
          <p className="text-sm text-muted-foreground">
            © 2024 Meu Resgate. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
