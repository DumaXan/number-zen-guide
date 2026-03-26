import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Crosshair, Target, RotateCcw } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { getAllContests, ConcursoHistorico } from "@/lib/historico-service";

interface Regras {
  soma: boolean;
  paridade: boolean;
  linhas: boolean;
  colunas: boolean;
  repetidos: boolean;
}

function analisarJogo(escolhidos: number[], ultimoConcurso: number[]): { score: number; regras: Regras; somaAtual: number; pares: number; impares: number; repetidos: number } {
  const regras: Regras = { soma: false, paridade: false, linhas: false, colunas: false, repetidos: false };
  if (escolhidos.length === 0) return { score: 0, regras, somaAtual: 0, pares: 0, impares: 0, repetidos: 0 };

  const somaAtual = escolhidos.reduce((a, b) => a + b, 0);
  regras.soma = somaAtual >= 180 && somaAtual <= 210;

  const pares = escolhidos.filter(n => n % 2 === 0).length;
  const impares = escolhidos.length - pares;
  regras.paridade = pares <= 10 && impares <= 10;

  const linhasOcupadas = new Set(escolhidos.map(n => Math.floor((n - 1) / 5)));
  regras.linhas = linhasOcupadas.size === 5;

  const colunasOcupadas = new Set(escolhidos.map(n => (n - 1) % 5));
  regras.colunas = colunasOcupadas.size === 5;

  const repetidos = escolhidos.filter(n => ultimoConcurso.includes(n)).length;
  regras.repetidos = repetidos <= 12;

  const score = Object.values(regras).filter(Boolean).length * 20;
  return { score, regras, somaAtual, pares, impares, repetidos };
}

const ConstruaSeuJogo = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<number[]>([]);
  const [historico, setHistorico] = useState<ConcursoHistorico[]>([]);
  const [finalizado, setFinalizado] = useState(false);

  useEffect(() => {
    getAllContests().then(setHistorico).catch(() => {});
  }, []);

  const ultimoConcurso = useMemo(() => {
    if (historico.length === 0) return [];
    return historico[historico.length - 1].dezenas;
  }, [historico]);

  const ultimoConcursoNum = historico.length > 0 ? historico[historico.length - 1].concurso : null;

  const { score, regras, somaAtual, pares, impares, repetidos } = useMemo(
    () => analisarJogo(selected, ultimoConcurso),
    [selected, ultimoConcurso]
  );

  const toggle = (n: number) => {
    if (finalizado) return;
    setSelected(prev => {
      if (prev.includes(n)) return prev.filter(x => x !== n);
      if (prev.length >= 15) return prev;
      return [...prev, n];
    });
  };

  const handleReset = () => {
    setSelected([]);
    setFinalizado(false);
  };

  const handleFinalizar = () => {
    if (selected.length === 15) setFinalizado(true);
  };

  const scoreColor = score === 100 ? "text-green-400" : score >= 60 ? "text-yellow-400" : "text-red-400";

  return (
    <div className="min-h-screen bg-background tactical-grid relative overflow-hidden">
      <div className="scan-line absolute inset-0 pointer-events-none z-0 h-[200%]" />
      <div className="relative z-10 max-w-md mx-auto px-4 py-6 pb-16">
        {/* Header */}
        <header className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-display text-lg font-bold tracking-wider text-primary neon-text flex items-center gap-2">
              <Target className="w-5 h-5" /> CONSTRUA SEU JOGO
            </h1>
            {ultimoConcursoNum && (
              <p className="text-[10px] text-muted-foreground font-display tracking-wider">
                Base: Concurso #{ultimoConcursoNum}
              </p>
            )}
          </div>
        </header>

        {/* Thermometer */}
        <div className="neon-card rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-display text-xs tracking-widest text-muted-foreground uppercase">Qualidade</span>
            <span className={`font-display text-sm font-bold ${scoreColor}`}>{score}%</span>
          </div>
          <Progress value={score} className="h-3" />
        </div>

        {/* Rules */}
        <div className="neon-card rounded-xl p-4 mb-4 space-y-2">
          <h2 className="font-display text-xs tracking-widest text-primary uppercase mb-2">Status das Regras</h2>
          <RuleRow ok={regras.soma} label={`Soma entre 180–210 (Atual: ${somaAtual})`} />
          <RuleRow ok={regras.paridade} label={`Máx 10 Pares/Ímpares (P:${pares} I:${impares})`} />
          <RuleRow ok={regras.linhas} label="Todas as 5 linhas ocupadas" />
          <RuleRow ok={regras.colunas} label="Todas as 5 colunas ocupadas" />
          <RuleRow ok={regras.repetidos} label={`Máx 12 repetidas do anterior (${repetidos})`} />
        </div>

        {/* Grid */}
        <div className="neon-card rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-display text-xs tracking-widest text-muted-foreground uppercase">
              {selected.length}/15 selecionadas
            </span>
            <button onClick={handleReset} className="text-xs text-destructive hover:text-destructive/80 flex items-center gap-1 transition-colors">
              <RotateCcw className="w-3 h-3" /> Limpar
            </button>
          </div>
          <div className="grid grid-cols-5 gap-2 mb-4">
            {Array.from({ length: 25 }, (_, i) => i + 1).map(n => {
              const isSelected = selected.includes(n);
              const isFromLast = ultimoConcurso.includes(n);
              return (
                <button
                  key={n}
                  onClick={() => toggle(n)}
                  disabled={finalizado}
                  className={`
                    relative aspect-square rounded-lg font-display text-2xl font-bold
                    transition-all duration-200 active:scale-95
                    ${finalizado ? "cursor-default" : ""}
                    ${isSelected
                      ? "bg-primary text-primary-foreground neon-border"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    }
                  `}
                >
                  {String(n).padStart(2, "0")}
                  {isFromLast && !isSelected && (
                    <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-primary/50" />
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-muted-foreground text-center">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary/50 mr-1 align-middle" />
            Números do último concurso
          </p>
        </div>

        {/* Finalizar / Resultado */}
        {!finalizado ? (
          <button
            onClick={handleFinalizar}
            disabled={selected.length !== 15}
            className={`
              w-full py-3.5 rounded-lg font-display text-sm tracking-widest uppercase
              transition-all duration-300 flex items-center justify-center gap-2
              ${selected.length === 15
                ? "bg-primary text-primary-foreground neon-border hover:brightness-110 active:scale-[0.98]"
                : "bg-muted text-muted-foreground cursor-not-allowed"
              }
            `}
          >
            <Crosshair className="w-4 h-4" /> Finalizar Jogo
          </button>
        ) : (
          <div className="neon-card rounded-xl p-5 animate-fade-in-up">
            <h2 className="font-display text-sm tracking-widest text-primary uppercase text-center mb-3">Jogo Finalizado</h2>
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {[...selected].sort((a, b) => a - b).map(n => (
                <span key={n} className="w-9 h-9 rounded-md bg-primary text-primary-foreground font-display text-sm font-bold flex items-center justify-center">
                  {String(n).padStart(2, "0")}
                </span>
              ))}
            </div>
            <div className="text-center">
              {score === 100 ? (
                <p className="text-xs text-green-400 font-display tracking-wider">🔥 JOGO EXCELENTE! Dentro de todos os parâmetros.</p>
              ) : (
                <p className="text-xs text-yellow-400 font-display tracking-wider">⚠️ Qualidade: {score}%. Ajuste os números para 100%.</p>
              )}
            </div>
            <button
              onClick={handleReset}
              className="w-full mt-4 py-3 rounded-lg font-display text-xs tracking-widest uppercase bg-muted text-muted-foreground hover:text-foreground transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Novo Jogo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const RuleRow = ({ ok, label }: { ok: boolean; label: string }) => (
  <div className="flex items-start gap-2 text-xs">
    <span className="mt-0.5">{ok ? "✅" : "❌"}</span>
    <span className={ok ? "text-green-400" : "text-muted-foreground"}>{label}</span>
  </div>
);

export default ConstruaSeuJogo;
