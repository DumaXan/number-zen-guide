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
} from "lucide-react";

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

const ResultPanel = ({ result, onReset, hideStatus, hideResetButton, contestNumber }: ResultPanelProps) => {
  const [copied, setCopied] = useState(false);

  const approvedGames = result.games.filter(g => g.aprovado);
  const allRejected = approvedGames.length === 0;
  const anyApproved = approvedGames.length > 0;

  const getShareText = () => {
    let text = "🎯 *SNIPER - Lotofácil*\n\n";
    let jogoNum = 1;
    for (const game of result.games) {
      if (game.aprovado) {
        text += `📋 *Jogo ${String(jogoNum).padStart(2, "0")}:* (${game.tag})\n${formatNumbers(game.numbers)}\n`;
        text += `Soma: ${game.attrs.soma} | ${game.attrs.pares}P/${15 - game.attrs.pares}I\n\n`;
        jogoNum++;
      }
    }
    if (allRejected) {
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

  const contestLabel = contestNumber ? `#${contestNumber}` : "";

  const getSimulationMessage = () => {
    if (!contestNumber) return null;
    if (allRejected) {
      return `A estratégia não achou viável realizar apostas para o concurso ${contestLabel}.`;
    }
    if (approvedGames.length === 4) {
      return `Estes foram os jogos gerados pela estratégia do Professor Eustáquio Salamanca para o concurso ${contestLabel}.`;
    }
    if (approvedGames.length === 1) {
      return `Este foi o jogo gerado pela estratégia do Professor Eustáquio Salamanca para o concurso ${contestLabel}.`;
    }
    return `Estes foram os jogos gerados pela estratégia do Professor Eustáquio Salamanca para o concurso ${contestLabel}.`;
  };

  const getStatusLabel = () => {
    if (approvedGames.length === 4) return "SINCRONIA TOTAL";
    if (approvedGames.length >= 2) return "JOGOS PARCIAIS";
    if (approvedGames.length === 1) return "JOGO PARCIAL";
    return "";
  };

  const simulationMessage = getSimulationMessage();

  let approvedIdx = 0;

  return (
    <div className="space-y-4">
      {/* Simulation context message */}
      {simulationMessage && (
        <div className="neon-card rounded-xl p-4 animate-fade-in-up text-center" style={{ animationDelay: "0ms" }}>
          <p className="text-xs text-muted-foreground leading-relaxed">{simulationMessage}</p>
        </div>
      )}

      {/* Status */}
      {!hideStatus && (
        <div
          className={`neon-card rounded-xl p-5 text-center animate-fade-in-up ${allRejected ? "border-destructive/30" : ""}`}
          style={{ animationDelay: "0ms" }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            {anyApproved ? (
              <Rocket className="w-6 h-6 text-primary animate-pulse-neon" />
            ) : (
              <ShieldAlert className="w-6 h-6 text-destructive" />
            )}
            <h2 className="font-display text-lg tracking-wider">
              {allRejected ? (
                <span className="text-destructive">OPERAÇÃO CANCELADA</span>
              ) : (
                <span className="text-primary neon-text">{getStatusLabel()}</span>
              )}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {allRejected
              ? "Filtros de segurança ativados. Economize para o próximo concurso."
              : approvedGames.length === 4
              ? "Cenário matematicamente ideal. Faça os quatro jogos."
              : `${approvedGames.length} jogo${approvedGames.length > 1 ? "s" : ""} aprovado${approvedGames.length > 1 ? "s" : ""} nos filtros.`}
          </p>
        </div>
      )}

      {/* All rejected: safety message */}
      {allRejected && !hideStatus && (
        <div className="neon-card rounded-xl p-6 animate-fade-in-up border-warning/20" style={{ animationDelay: "100ms" }}>
          <div className="flex justify-center mb-4">
            <safetyMessage.icon className="w-10 h-10 text-warning" />
          </div>
          <h3 className="font-display text-sm tracking-wider text-warning text-center mb-3">{safetyMessage.title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed text-justify">{safetyMessage.body}</p>
          <div className="mt-4 pt-4 border-t border-border/30 space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-3.5 h-3.5 text-warning" />
              <span className="font-display text-[10px] tracking-widest text-warning uppercase">Motivos do Descarte</span>
            </div>
            {result.games.map((g, i) => (
              <p key={i} className="text-[11px] text-warning/70">
                <span className="text-warning">→</span> {g.tag}: {g.motivo}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Game cards */}
      {!allRejected && (
        <>
          {result.games.map((game, i) => {
            const delay = `${200 + i * 100}ms`;
            if (game.aprovado) {
              approvedIdx++;
              return (
                <GameCard
                  key={i}
                  label={`Jogo ${String(approvedIdx).padStart(2, "0")}`}
                  tag={game.tag}
                  game={game}
                  delay={delay}
                />
              );
            }
            return (
              <RejectedCard
                key={i}
                label={game.tag}
                tag={game.tag}
                motivo={game.motivo}
                delay={delay}
              />
            );
          })}

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className="w-full py-3.5 rounded-lg font-display text-xs tracking-widest uppercase bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all active:scale-[0.98] flex items-center justify-center gap-2 animate-fade-in-up"
            style={{ animationDelay: "650ms" }}
          >
            {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copiado!" : "Copiar"}
          </button>
        </>
      )}

      {/* Reset */}
      {!hideResetButton && (
        <button
          onClick={onReset}
          className="w-full py-3 rounded-lg font-display text-xs tracking-widest uppercase bg-muted text-muted-foreground hover:text-foreground transition-all active:scale-[0.98] animate-fade-in-up"
          style={{ animationDelay: "700ms" }}
        >
          Retornar à Página Inicial
        </button>
      )}
    </div>
  );
};

export default ResultPanel;
