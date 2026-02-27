import { useState, useMemo } from "react";
import { SniperResult } from "@/lib/sniper";
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
    title: "Aviso do Prof. Eustáquio Salamanca: Recuar também é estratégia. 🎯",
    body: "Após analisar os padrões de hoje, o algoritmo identificou uma baixa probabilidade de acerto para as tendências atuais. Para um Sniper de elite, a vitória consiste em saber não apenas o que apostar, mas o momento exato de quando apostar. Poupe sua munição para o próximo sorteio favorável.",
  },
  {
    icon: Ban,
    title: "Análise de Hoje: Fora do Alvo. 🚫",
    body: "Segundo os cálculos estatísticos do Prof. Salamanca, as combinações de hoje não atingiram o nível de confiança necessário. Não geramos jogos hoje para proteger seu capital. Lembre-se: ser Sniper é ser seletivo para ser letal.",
  },
  {
    icon: Telescope,
    title: "Hoje não é dia de tiro, é dia de observação. 🔭",
    body: "O Professor Salamanca analisou os últimos 8 anos de resultados e concluiu que o cenário de hoje é instável. Nossa estratégia é clara: só sugerimos apostas quando a matemática está ao nosso favor. Aguarde o próximo sinal para um jogo com maior potencial de acerto.",
  },
];

interface ResultPanelProps {
  result: SniperResult;
  onReset: () => void;
}

const GameCard = ({
  label,
  numbers,
  soma,
  pares,
  delay,
}: {
  label: string;
  numbers: number[];
  soma: number;
  pares: number;
  delay: string;
}) => (
  <div className="neon-card rounded-xl p-4 animate-fade-in-up" style={{ animationDelay: delay }}>
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-display text-xs tracking-widest text-neon-cyan uppercase">{label}</h3>
      <div className="flex gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3" /> {soma}
        </span>
        <span className="flex items-center gap-1">
          <Hash className="w-3 h-3" /> {pares}P/{15 - pares}I
        </span>
      </div>
    </div>
    <div className="grid grid-cols-5 gap-1.5">
      {numbers.map((n) => (
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

const formatNumbers = (numbers: number[]) =>
  numbers.map((n) => String(n).padStart(2, "0")).join(" - ");

const ResultPanel = ({ result, onReset }: ResultPanelProps) => {
  const [copied, setCopied] = useState(false);

  const getShareText = () => {
    let text = "🎯 *SNIPER - Lotofácil*\n\n";
    text += `📋 *Cartão 01:*\n${formatNumbers(result.g2)}\n`;
    text += `Soma: ${result.somaG2} | ${result.paresG2}P/${15 - result.paresG2}I\n\n`;
    text += `📋 *Cartão 02:*\n${formatNumbers(result.g3)}\n`;
    text += `Soma: ${result.somaG3} | ${result.paresG3}P/${15 - result.paresG3}I\n\n`;
    text += result.aprovado ? "✅ Cenário aprovado!" : "⛔ Operação cancelada.";
    if (result.alertas.length > 0) {
      text += "\n\n⚠️ Alertas:\n" + result.alertas.map((a) => `→ ${a}`).join("\n");
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

  return (
    <div className="space-y-4">
      {/* Status */}
      <div
        className={`neon-card rounded-xl p-5 text-center animate-fade-in-up ${
          result.aprovado ? "" : "border-destructive/30"
        }`}
        style={{ animationDelay: "0ms" }}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          {result.aprovado ? (
            <Rocket className="w-6 h-6 text-primary animate-pulse-neon" />
          ) : (
            <ShieldAlert className="w-6 h-6 text-destructive" />
          )}
          <h2 className="font-display text-lg tracking-wider">
            {result.aprovado ? (
              <span className="text-primary neon-text">SINCRONIA TOTAL</span>
            ) : (
              <span className="text-destructive">OPERAÇÃO CANCELADA</span>
            )}
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {result.aprovado
            ? "Cenário matematicamente ideal. Faça os dois jogos."
            : "Filtros de segurança ativados. Economize para o próximo concurso."}
        </p>
      </div>

      {/* When NOT approved: show safety message instead of cards */}
      {!result.aprovado ? (
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

          {/* Alertas técnicos */}
          {result.alertas.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border/30">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-3.5 h-3.5 text-warning" />
                <span className="font-display text-[10px] tracking-widest text-warning uppercase">
                  Detalhes Técnicos
                </span>
              </div>
              <ul className="space-y-1">
                {result.alertas.map((a, i) => (
                  <li key={i} className="text-[11px] text-warning/70 flex items-start gap-2">
                    <span className="text-warning mt-0.5">→</span> {a}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Game Cards */}
          <GameCard
            label="Cartão 01"
            numbers={result.g2}
            soma={result.somaG2}
            pares={result.paresG2}
            delay="200ms"
          />
          <GameCard
            label="Cartão 02"
            numbers={result.g3}
            soma={result.somaG3}
            pares={result.paresG3}
            delay="300ms"
          />

          {/* Share button - only when approved */}
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
        Nova Análise
      </button>
    </div>
  );
};

export default ResultPanel;
