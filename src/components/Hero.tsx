import { ArrowRight, Zap, Shield, Clock } from "lucide-react";
import { Button } from "./ui/button";

const Hero = () => {
  const scrollToConverter = () => {
    document.getElementById('converter')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative py-20 px-4 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-5xl mx-auto text-center relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8 animate-fade-in">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">Conversão rápida e gratuita</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up">
          Converta seus arquivos{" "}
          <span className="gradient-text">instantaneamente</span>
        </h1>

        {/* Subheading */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '100ms' }}>
          Transforme documentos, imagens, vídeos e áudios em qualquer formato. 
          Sem registro, sem limites, 100% gratuito.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <Button variant="gradient" size="xl" onClick={scrollToConverter}>
            Começar Agora
            <ArrowRight className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="xl">
            Ver Formatos
          </Button>
        </div>

        {/* Features Pills */}
        <div className="flex flex-wrap items-center justify-center gap-6 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm">100% Seguro</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-5 h-5 text-primary" />
            <span className="text-sm">Conversão Rápida</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Zap className="w-5 h-5 text-primary" />
            <span className="text-sm">Sem Limites</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
