import { useState, useEffect } from "react";
import { Play, Timer } from "lucide-react";

interface AdGateProps {
  onComplete: () => void;
}

const AdGate = ({ onComplete }: AdGateProps) => {
  const [phase, setPhase] = useState<"ready" | "watching" | "done">("ready");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (phase !== "watching") return;
    if (countdown <= 0) {
      setPhase("done");
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  if (phase === "ready") {
    return (
      <div className="neon-card rounded-xl p-6 text-center animate-fade-in-up">
        <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
          <Play className="w-7 h-7 text-primary" />
        </div>
        <h3 className="font-display text-sm tracking-widest text-primary uppercase mb-2">
          Jogo do Dia Pronto
        </h3>
        <p className="text-sm text-muted-foreground mb-5">
          Assista a um breve anúncio para liberar seus cartões gerados pelo Protocolo Sniper.
        </p>
        <button
          onClick={() => setPhase("watching")}
          className="w-full py-3.5 rounded-lg font-display text-sm tracking-widest uppercase bg-primary text-primary-foreground neon-border hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4" />
          Assistir Anúncio
        </button>
      </div>
    );
  }

  if (phase === "watching") {
    const progress = ((5 - countdown) / 5) * 100;
    return (
      <div className="neon-card rounded-xl p-6 text-center animate-fade-in-up">
        <div className="w-16 h-16 rounded-full bg-warning/10 border border-warning/20 flex items-center justify-center mx-auto mb-4">
          <Timer className="w-7 h-7 text-warning animate-pulse-neon" />
        </div>
        <h3 className="font-display text-sm tracking-widest text-warning uppercase mb-2">
          Anúncio em Andamento
        </h3>
        <p className="text-4xl font-display font-bold text-warning mb-4">{countdown}s</p>

        {/* Simulated ad placeholder */}
        <div className="w-full h-40 rounded-lg bg-muted/50 border border-border flex items-center justify-center mb-4">
          <span className="text-xs text-muted-foreground font-display tracking-widest">ESPAÇO PUBLICITÁRIO</span>
        </div>

        <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-warning rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }

  // done
  return (
    <div className="neon-card rounded-xl p-6 text-center animate-fade-in-up">
      <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
        <Play className="w-7 h-7 text-primary" />
      </div>
      <h3 className="font-display text-sm tracking-widest text-primary uppercase mb-3">
        Anúncio Concluído!
      </h3>
      <button
        onClick={onComplete}
        className="w-full py-3.5 rounded-lg font-display text-sm tracking-widest uppercase bg-primary text-primary-foreground neon-border hover:brightness-110 active:scale-[0.98] transition-all"
      >
        Ver Jogo do Dia
      </button>
    </div>
  );
};

export default AdGate;
