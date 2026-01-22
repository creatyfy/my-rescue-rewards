import { AppLayout } from "@/components/layout/AppLayout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Mail, MessageCircle, Phone, Clock } from "lucide-react";

const faqs = [
  {
    question: "Como acumulo pontos no Meu Resgate?",
    answer:
      "Você acumula pontos ao enviar comprovantes de compras elegíveis ou participar de campanhas especiais. Assim que a compra for validada, os pontos entram no seu saldo.",
  },
  {
    question: "Quanto tempo leva para validar um comprovante?",
    answer:
      "A validação costuma ocorrer em até 48 horas úteis. Você pode acompanhar o status em “Histórico”.",
  },
  {
    question: "O que faço se meus pontos não aparecerem?",
    answer:
      "Verifique se o comprovante foi aprovado. Caso esteja aprovado e o saldo não tenha sido atualizado, entre em contato pelo suporte abaixo.",
  },
  {
    question: "Posso transferir meus pontos para outra pessoa?",
    answer:
      "No momento, os pontos são pessoais e intransferíveis. Estamos trabalhando em novas opções para o futuro.",
  },
];

const contactChannels = [
  {
    title: "WhatsApp",
    description: "Atendimento rápido em dias úteis, das 9h às 18h.",
    detail: "+55 (11) 98888-7777",
    icon: MessageCircle,
  },
  {
    title: "E-mail",
    description: "Para solicitações detalhadas e anexos.",
    detail: "suporte@meuresgate.com",
    icon: Mail,
  },
  {
    title: "Telefone",
    description: "Suporte humanizado para questões urgentes.",
    detail: "0800 123 456",
    icon: Phone,
  },
];

export default function Help() {
  return (
    <AppLayout title="Ajuda e suporte" showBack>
      <div className="container px-4 py-6 space-y-6">
        <section className="bg-card border border-border/50 rounded-2xl shadow-soft p-6">
          <h2 className="font-display font-semibold text-lg text-foreground mb-4">
            Perguntas frequentes
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq) => (
              <AccordionItem key={faq.question} value={faq.question}>
                <AccordionTrigger className="text-left text-sm font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section className="bg-card border border-border/50 rounded-2xl shadow-soft p-6">
          <h2 className="font-display font-semibold text-lg text-foreground mb-4">
            Canais de contato
          </h2>
          <div className="space-y-4">
            {contactChannels.map((channel) => {
              const Icon = channel.icon;
              return (
                <div
                  key={channel.title}
                  className="flex items-start gap-3 rounded-xl border border-border/50 p-4"
                >
                  <div className="p-2 rounded-lg bg-accent">
                    <Icon className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">
                      {channel.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {channel.description}
                    </p>
                    <p className="text-sm text-foreground mt-1">
                      {channel.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-4 h-4" />
            Atendimento: segunda a sexta, das 9h às 18h (horário de Brasília).
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
