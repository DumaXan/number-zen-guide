import { useState } from "react";
import { Play, Timer, AlertCircle } from "lucide-react";
import { AdMob, RewardAdOptions, AdMobRewardItem } from "@capacitor-community/admob";

interface AdGateProps {
  onComplete: () => void;
}

const AdGate = ({ onComplete }: AdGateProps) => {
  const [phase, setPhase] = useState<"ready" | "loading" | "done">("ready");
  const [error, setError] = useState<string | null>(null);

  const showRewardedAd = async () => {
    setPhase("loading");
    setError(null);

    const options: RewardAdOptions = {
      adId: "ca-app-pub-3947057911901585/7268303549",
      isTesting: false,
    };

    try {
      await AdMob.prepareRewardVideoAd(options);
      const reward: AdMobRewardItem = await AdMob.showRewardVideoAd();

      if (reward) {
        console.log("Parabéns! Cartões liberados pelo Professor Eustáquio.");
        setPhase("done");
      } else {
        setError("O vídeo não foi concluído. Tente novamente mais tarde.");
        setPhase("ready");
      }
    } catch (err) {
      console.error("Erro ao carregar o anúncio:", err);
      setError("Não foi possível carregar o anúncio. Tente novamente mais tarde.");
      setPhase("ready");
    }
  };

  if (phase === "ready") {
    return (
      <div className="neon-card rounded-xl p-6 text-center animate-fade-in-up border-2 border-primary/50 neon-border">
        <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto mb-4">
          <Play className="w-9 h-9 text-primary" />
        </div>
        <h3 className="font-display text-xl tracking-widest text-primary uppercase mb-2 neon-text">
          Jogo do Dia Pronto
        </h3>
        <p className="text-sm text-muted-foreground mb-5">
          Assista a um breve anúncio para liberar seus jogos gerados pelo Protocolo Sniper.
        </p>
        {error && (
          <div className="flex items-center gap-2 text-destructive text-sm mb-4 justify-center">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
        <button
          onClick={showRewardedAd}
          className="w-full py-3.5 rounded-lg font-display text-sm tracking-widest uppercase bg-primary text-primary-foreground neon-border hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4" />
          Assistir Anúncio
        </button>
      </div>
    );
  }

  if (phase === "loading") {
    return (
      <div className="neon-card rounded-xl p-6 text-center animate-fade-in-up">
        <div className="w-16 h-16 rounded-full bg-warning/10 border border-warning/20 flex items-center justify-center mx-auto mb-4">
          <Timer className="w-7 h-7 text-warning animate-pulse-neon" />
        </div>
        <h3 className="font-display text-sm tracking-widest text-warning uppercase mb-2">
          Carregando Anúncio...
        </h3>
        <p className="text-sm text-muted-foreground">Aguarde enquanto o vídeo é preparado.</p>
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
