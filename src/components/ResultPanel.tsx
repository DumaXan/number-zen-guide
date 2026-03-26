import { useState, useMemo } from "react";
import { SniperResult, GameResult } from "@/lib/sniper";
import {
  Rocket,
  ShieldAlert,
  Activity,
  Hash,
  TrendingUp,
  Copy,
  Check,
  Crosshair,
  Ban,
  Telescope,
  Lock,
  Play,
  Timer,
  AlertCircle,
} from "lucide-react";
import { AdMob, RewardAdOptions, AdMobRewardItem } from "@capacitor-community/admob";

const SAFETY_MESSAGES = [
  {
    icon: Crosshair,
    title: "Aviso do Prof. Eustáquio Salamanca: Recuar também é estratégia.",
    body: "Após analisar os padrões de hoje, o algoritmo identificou uma baixa probabilidade de acerto para as tendências atuais. Para um Sniper de elite, a vitória consiste em saber não apenas o que apostar, mas o momento exato de quando apostar. Poupe sua munição para o próximo sorteio favorável.",
  },
  {
    icon: Ban,
    title: "Análise de Hoje: Fora do Alvo.",
    body: "Segundo os cálculos estatísticos do Prof. Salamanca, as combinações de hoje não atingiram o nível de confiança necessário. Não geramos jogos hoje para proteger seu capital. Lembre-se: ser Sniper é ser seletivo para ser letal.",
  },
  {
    icon: Telescope,
    title: "Hoje não é dia de tiro, é dia de observação.",
    body: "O Professor Salamanca analisou os últimos 8 anos de resultados e concluiu que o cenário de hoje é instável. Nossa estratégia é clara: só sugerimos apostas quando a matemática está ao nosso favor. Aguarde o próximo sinal para um jogo com maior potencial de acerto.",
  },
];

interface ResultPanelProps {
  result: SniperResult;
  onReset: () => void;
  hideG2Ad?: boolean;
  hideStatus?: boolean;
  hideResetButton?: boolean;
  contestNumber?: number;
}

const GameCard = ({
  label,
  tag,
  game,
  delay,
}: {
  label: string;
  tag: string;
  game: GameResult;
  delay: string;
}) => (
  <div className="neon-card rounded-xl p-4 animate-fade-in-up" style={{ animationDelay: delay }}>
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-display text-xs tracking-widest text-neon-cyan uppercase">{label}</h3>
      <div className="flex gap-3 text-xs text-muted-foreground">
        <span className="text-[10px] opacity-50">{tag}</span>
        <span className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3" /> {game.attrs.soma}
        </span>
        <span className="flex items-center gap-1">
          <Hash className="w-3 h-3" /> {game.attrs.pares}P/{15 - game.attrs.pares}I
        </span>
      </div>
    </div>
    <div className="grid grid-cols-5 gap-1.5">
      {game.numbers.map((n) => (
        <div
          key={n}
          className="aspect-square rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center font-display text-xl font-bold text-primary"
        >
          {String(n).padStart(2, "0")}
        </div>
      ))}
    </div>
  </div>
);

const RejectedCard = ({
  label,
  tag,
  motivo,
  delay,
}: {
  label: string;
  tag: string;
  motivo: string;
  delay: string;
}) => (
  <div
    className="neon-card rounded-xl p-4 animate-fade-in-up border-destructive/30"
    style={{ animationDelay: delay }}
  >
    <div className="flex items-center gap-2 mb-2">
      <ShieldAlert className="w-4 h-4 text-destructive" />
      <h3 className="font-display text-xs tracking-widest text-destructive uppercase">{label} — Descartado</h3>
      <span className="text-[10px] opacity-50 ml-auto">{tag}</span>
    </div>
    <p className="text-xs text-muted-foreground">
      <span className="text-warning">→</span> {motivo}
    </p>
  </div>
);

const formatNumbers = (numbers: number[]) =>
  numbers.map((n) => String(n).padStart(2, "0")).join(" - ");

const ResultPanel = ({ result, onReset, hideG2Ad, hideStatus, contestNumber }: ResultPanelProps) => {
  const [copied, setCopied] = useState(false);
  const [g2Unlocked, setG2Unlocked] = useState(false);
  const [adPhase, setAdPhase] = useState<"idle" | "loading" | "done">("idle");
  const [adError, setAdError] = useState<string | null>(null);

  const anyApproved = result.g2.aprovado || result.g3.aprovado;
  const bothApproved = result.g2.aprovado && result.g3.aprovado;
  const bothRejected = !result.g2.aprovado && !result.g3.aprovado;

  const showG2Card = !bothApproved || g2Unlocked || hideG2Ad;

  const getShareText = () => {
    let text = "🎯 *SNIPER - Lotofácil*\n\n";
    let jogoNum = 1;
    if (result.g3.aprovado) {
      text += `📋 *Jogo ${String(jogoNum).padStart(2, "0")}:* (G3)\n${formatNumbers(result.g3.numbers)}\n`;
      text += `Soma: ${result.g3.attrs.soma} | ${result.g3.attrs.pares}P/${15 - result.g3.attrs.pares}I\n\n`;
      jogoNum++;
    }
    if (result.g2.aprovado && showG2Card) {
      text += `📋 *Jogo ${String(jogoNum).padStart(2, "0")}:* (G2)\n${formatNumbers(result.g2.numbers)}\n`;
      text += `Soma: ${result.g2.attrs.soma} | ${result.g2.attrs.pares}P/${15 - result.g2.attrs.pares}I\n\n`;
    }
    if (bothRejected) {
      text += "⛔ Nenhum jogo aprovado para este concurso.";
    }
    return text;
  };

  const safetyMessage = useMemo(
    () => SAFETY_MESSAGES[Math.floor(Math.random() * SAFETY_MESSAGES.length)],
    []
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getShareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = getShareText();
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUnlockG2 = async () => {
    setAdPhase("loading");
    setAdError(null);

    const options: RewardAdOptions = {
      adId: "ca-app-pub-3947057911901585/2799114495",
      isTesting: false,
    };

    try {
      await AdMob.prepareRewardVideoAd(options);
      const reward: AdMobRewardItem = await AdMob.showRewardVideoAd();

      if (reward) {
        setAdPhase("done");
        setG2Unlocked(true);
      } else {
        setAdError("O vídeo não foi concluído. Tente novamente.");
        setAdPhase("idle");
      }
    } catch (err) {
      console.error("Erro ao carregar o anúncio:", err);
      setAdError("Não foi possível carregar o anúncio. Tente novamente.");
      setAdPhase("idle");
    }
  };

  const contestLabel = contestNumber ? `#${contestNumber}` : "";

  const getSimulationMessage = () => {
    if (!contestNumber) return null;
    if (bothRejected) {
      return `A estratégia não achou viável realizar apostas para o concurso ${contestLabel}.`;
    }
    if (bothApproved) {
      return `Estes foram os jogos que foram gerados pela estratégia do Professor Eustáquio Salamanca para o concurso ${contestLabel}.`;
    }
    return `Este foi o jogo gerado pela estratégia do Professor Eustáquio Salamanca para o concurso ${contestLabel}.`;
  };

  const simulationMessage = getSimulationMessage();

  return (
    <div className="space-y-4">
      {/* Simulation context message */}
      {simulationMessage && (
        <div
          className="neon-card rounded-xl p-4 animate-fade-in-up text-center"
          style={{ animationDelay: "0ms" }}
        >
          <p className="text-xs text-muted-foreground leading-relaxed">
            {simulationMessage}
          </p>
        </div>
      )}

      {/* Status */}
      {!hideStatus && (
        <div
          className={`neon-card rounded-xl p-5 text-center animate-fade-in-up ${
            bothRejected ? "border-destructive/30" : ""
          }`}
          style={{ animationDelay: "0ms" }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            {anyApproved ? (
              <Rocket className="w-6 h-6 text-primary animate-pulse-neon" />
            ) : (
              <ShieldAlert className="w-6 h-6 text-destructive" />
            )}
            <h2 className="font-display text-lg tracking-wider">
              {bothRejected ? (
                <span className="text-destructive">OPERAÇÃO CANCELADA</span>
              ) : bothApproved ? (
                <span className="text-primary neon-text">SINCRONIA TOTAL</span>
              ) : (
                <span className="text-primary neon-text">JOGO PARCIAL</span>
              )}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {bothRejected
              ? "Filtros de segurança ativados. Economize para o próximo concurso."
              : bothApproved
              ? "Cenário matematicamente ideal. Faça os dois jogos."
              : "Apenas um cartão passou nos filtros."}
          </p>
        </div>
      )}

      {/* Both rejected: safety message */}
      {bothRejected && !hideStatus && (
        <div
          className="neon-card rounded-xl p-6 animate-fade-in-up border-warning/20"
          style={{ animationDelay: "100ms" }}
        >
          <div className="flex justify-center mb-4">
            <safetyMessage.icon className="w-10 h-10 text-warning" />
          </div>
          <h3 className="font-display text-sm tracking-wider text-warning text-center mb-3">
            {safetyMessage.title}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed text-justify">
            {safetyMessage.body}
          </p>
          <div className="mt-4 pt-4 border-t border-border/30 space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-3.5 h-3.5 text-warning" />
              <span className="font-display text-[10px] tracking-widest text-warning uppercase">
                Motivos do Descarte
              </span>
            </div>
            <p className="text-[11px] text-warning/70"><span className="text-warning">→</span> G2: {result.g2.motivo}</p>
            <p className="text-[11px] text-warning/70"><span className="text-warning">→</span> G3: {result.g3.motivo}</p>
          </div>
        </div>
      )}

      {/* Game cards */}
      {!bothRejected && (
        <>
          {/* G3 — always Jogo 01 (first shown) */}
          {result.g3.aprovado ? (
            <GameCard label="Jogo 01" tag="G3" game={result.g3} delay="200ms" />
          ) : (
            <RejectedCard label="Jogo 01" tag="G3" motivo={result.g3.motivo} delay="200ms" />
          )}

          {/* G2 — Jogo 02 (locked behind ad when both approved) */}
          {bothApproved && !g2Unlocked && !hideG2Ad ? (
            <div
              className="neon-card rounded-xl p-5 animate-fade-in-up border-primary/20 text-center"
              style={{ animationDelay: "300ms" }}
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                <Lock className="w-5 h-5 text-primary" />
                <h3 className="font-display text-xs tracking-widest text-primary uppercase">
                  Jogo 02 — Bloqueado
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Assista a um anúncio para desbloquear o segundo jogo aprovado.
              </p>

              {adError && (
                <div className="flex items-center gap-2 text-destructive text-xs mb-3 justify-center">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{adError}</span>
                </div>
              )}

              {adPhase === "loading" ? (
                <div className="flex items-center justify-center gap-2 py-3 text-warning">
                  <Timer className="w-4 h-4 animate-pulse" />
                  <span className="font-display text-xs tracking-widest uppercase">Carregando...</span>
                </div>
              ) : (
                <button
                  onClick={handleUnlockG2}
                  className="w-full py-3 rounded-lg font-display text-xs tracking-widest uppercase bg-primary text-primary-foreground neon-border hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Desbloquear Jogo 02
                </button>
              )}
            </div>
          ) : result.g2.aprovado ? (
            <GameCard label={bothApproved ? "Jogo 02" : "Jogo 01"} tag="G2" game={result.g2} delay="300ms" />
          ) : (
            <RejectedCard label={result.g3.aprovado ? "Jogo 02" : "Jogo 01"} tag="G2" motivo={result.g2.motivo} delay="300ms" />
          )}

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className="w-full py-3.5 rounded-lg font-display text-xs tracking-widest uppercase bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all active:scale-[0.98] flex items-center justify-center gap-2 animate-fade-in-up"
            style={{ animationDelay: "350ms" }}
          >
            {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copiado!" : "Copiar"}
          </button>
        </>
      )}

      {/* Reset */}
      <button
        onClick={onReset}
        className="w-full py-3 rounded-lg font-display text-xs tracking-widest uppercase bg-muted text-muted-foreground hover:text-foreground transition-all active:scale-[0.98] animate-fade-in-up"
        style={{ animationDelay: "400ms" }}
      >
        Retornar à Página Inicial
      </button>
    </div>
  );
};

export default ResultPanel;
