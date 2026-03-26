import { Crosshair, Shield, HelpCircle, Play, PenTool, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background tactical-grid relative overflow-hidden">
      <div className="scan-line absolute inset-0 pointer-events-none z-0 h-[200%]" />

      <div className="relative z-10 max-w-md mx-auto px-4 py-8 pb-16">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Crosshair className="w-7 h-7 text-primary animate-pulse-neon" />
            <h1 className="font-display text-2xl font-bold tracking-wider text-primary neon-text">
              SNIPER
            </h1>
          </div>
          <p className="font-display text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
            Jogue na Lotofácil com estatística
          </p>
          <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-muted-foreground font-display tracking-wider">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3" /> Paridade
            </span>
            <span>Piso G2</span>
            <span>Teto G3</span>
            <span>Inversão</span>
          </div>
        </header>

        {/* Intro text */}
        <div className="neon-card rounded-xl p-4 mb-6 animate-fade-in-up">
          <p className="text-xs text-muted-foreground leading-relaxed text-justify">
            Esse aplicativo foi desenvolvido com base nos estudos do Professor <span className="text-primary font-semibold">Eustáquio Salamanca</span>, mestre em estatística que passou os últimos 8 anos estudando padrões nos jogos da Lotofácil para aumentar as chances de ao menos garantir 11, 12, 13 ou mesmo 14 pontos. Em todos os concursos haverá os jogos prontos que devem ser feitos para o próximo. Pode haver dias que será melhor não fazer nenhuma aposta, pois o algoritmo não acha viável segundo as estatísticas.
          </p>
          <p className="text-[10px] text-warning mt-2 font-display tracking-wider uppercase">
            ⚠️ Jogue com responsabilidade.
          </p>
        </div>

        {/* Menu options */}
        <div className="space-y-3">
          {/* Jogo do Dia */}
          <button
            onClick={() => navigate("/jogo-do-dia")}
            className="w-full py-4 rounded-xl font-display text-sm tracking-widest uppercase neon-card border-2 border-primary/50 neon-border text-primary hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            <Play className="w-5 h-5" />
            Jogo do Dia Pronto
          </button>

          {/* Construa Seu Jogo */}
          <button
            onClick={() => navigate("/construa-seu-jogo")}
            className="w-full py-3 rounded-lg font-display text-[11px] tracking-widest uppercase bg-muted/50 text-muted-foreground hover:text-foreground transition-all flex items-center justify-center gap-2"
          >
            <PenTool className="w-5 h-5" />
            Construa Seu Próprio Jogo
          </button>

          {/* Simular Outro Concurso */}
          <button
            onClick={() => navigate("/simular-concurso")}
            className="w-full py-3 rounded-lg font-display text-[11px] tracking-widest uppercase bg-muted/50 text-muted-foreground hover:text-foreground transition-all flex items-center justify-center gap-2"
          >
            <BarChart3 className="w-5 h-5" />
            Simular Outro Concurso
          </button>

          {/* Como Jogar */}
          <button
            onClick={() => navigate("/como-jogar")}
            className="w-full py-3 rounded-lg font-display text-[11px] tracking-widest uppercase bg-muted/50 text-muted-foreground hover:text-foreground transition-all flex items-center justify-center gap-2"
          >
            <HelpCircle className="w-5 h-5" />
            Como Jogar
          </button>
        </div>

        {/* Privacy & Terms */}
        <div className="mt-4 text-center">
          <a
            href="https://sites.google.com/view/privacysniperlotofacil"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-display tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
          >
            Política de Privacidade e Termos de Uso
          </a>
        </div>
      </div>
    </div>
  );
};

export default Index;
