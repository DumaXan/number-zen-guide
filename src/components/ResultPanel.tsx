import { useState } from "react";
import { SniperResult } from "@/lib/sniper";
import {
  Rocket,
  ShieldAlert,
  Activity,
  Hash,
  TrendingUp,
  Copy,
  Check,
  Share2,
} from "lucide-react";

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
          className="aspect-square rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center font-display text-lg font-bold text-primary"
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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getShareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
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

  const handleWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(getShareText())}`;
    window.open(url, "_blank");
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

      {/* Alertas */}
      {result.alertas.length > 0 && (
        <div
          className="neon-card rounded-xl p-4 border-warning/20 animate-fade-in-up"
          style={{ animationDelay: "100ms" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-warning" />
            <span className="font-display text-xs tracking-widest text-warning uppercase">
              Alertas
            </span>
          </div>
          <ul className="space-y-1">
            {result.alertas.map((a, i) => (
              <li key={i} className="text-sm text-warning/80 flex items-start gap-2">
                <span className="text-warning mt-0.5">→</span> {a}
              </li>
            ))}
          </ul>
        </div>
      )}

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

      {/* Share buttons */}
      <div
        className="flex gap-3 animate-fade-in-up"
        style={{ animationDelay: "350ms" }}
      >
        <button
          onClick={handleCopy}
          className="flex-1 py-3.5 rounded-lg font-display text-xs tracking-widest uppercase bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copiado!" : "Copiar"}
        </button>
        <button
          onClick={handleWhatsApp}
          className="flex-1 py-3.5 rounded-lg font-display text-xs tracking-widest uppercase bg-success/20 text-success hover:bg-success/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          WhatsApp
        </button>
      </div>

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
