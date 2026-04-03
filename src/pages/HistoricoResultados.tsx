import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BarChart3, Loader2, Target } from "lucide-react";
import { getAllContests, addNewContest, ConcursoHistorico } from "@/lib/historico-service";
import { fetchLatestResult, fetchContestRange } from "@/lib/lotofacil-api";
import { runSniperAlgorithm, GameResult } from "@/lib/sniper";

interface StrategyResult {
  tag: string;
  label: string;
  acertos: number;
  aprovado: boolean;
  motivo: string;
}

interface ContestPerformance {
  concurso: number;
  strategies: StrategyResult[];
}

const STRATEGY_ORDER = [
  { tag: "FLS", label: "FLS" },
  { tag: "LH", label: "LH" },
  { tag: "J01", label: "G3+" },
  { tag: "J04", label: "G2+" },
];

function calcHits(game: number[], resultado: number[]): number {
  return game.filter((n) => resultado.includes(n)).length;
}

function getHitColor(hits: number): string {
  if (hits >= 14) return "text-green-400";
  if (hits >= 13) return "text-emerald-400";
  if (hits >= 12) return "text-primary";
  if (hits >= 11) return "text-yellow-400";
  return "text-muted-foreground";
}

function getHitBg(hits: number): string {
  if (hits >= 14) return "bg-green-400/20";
  if (hits >= 13) return "bg-emerald-400/20";
  if (hits >= 12) return "bg-primary/20";
  if (hits >= 11) return "bg-yellow-400/20";
  return "";
}

function getShortMotivo(motivo: string): string {
  // Shorten rejection reasons for compact display
  if (motivo.includes("Repetidas")) return "Repetidas";
  if (motivo.includes("Ímpares")) return "Ímpares";
  if (motivo.includes("Desvio") || motivo.includes("DP")) return "DP";
  if (motivo.includes("Quadrad")) return "Quadrad.";
  if (motivo.includes("Primos")) return "Primos";
  if (motivo.includes("Soma 5")) return "Soma 5+";
  if (motivo.includes("Soma")) return "Soma";
  if (motivo.includes("Coluna")) return "Col. Vazia";
  if (motivo.includes("Linha")) return "Lin. Vazia";
  if (motivo.includes("Gap")) return "Gap";
  if (motivo.includes("Dígitos") || motivo.includes("Soma Dígitos")) return "Dígitos";
  if (motivo.includes("Fibonacci")) return "Fibonacci";
  if (motivo.includes("Moldura")) return "Moldura";
  if (motivo.includes("consecutivos")) return "Consec.";
  if (motivo.includes("duplicata")) return "Duplicata";
  return motivo.length > 12 ? motivo.slice(0, 10) + "…" : motivo;
}

function findGameByTag(games: GameResult[], tag: string): GameResult | undefined {
  return games.find((g) => g.tag === tag);
}

const HistoricoResultados = () => {
  const navigate = useNavigate();
  const [historico, setHistorico] = useState<ConcursoHistorico[]>([]);
  const [loading, setLoading] = useState(true);
  const [latestConcurso, setLatestConcurso] = useState<number | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const latest = await fetchLatestResult();
        setLatestConcurso(latest.concurso);

        let allContests = await getAllContests();
        const maxLocal = allContests.length > 0 ? allContests[allContests.length - 1].concurso : 0;

        // We need contests up to (latest - 1) for performance analysis
        // Need at least 16 extra contests before for the algorithm + 15 results
        const neededUpTo = latest.concurso - 1;
        const neededFrom = neededUpTo - 15 - 1;

        if (maxLocal < neededUpTo) {
          const fetchFrom = Math.max(maxLocal + 1, neededFrom);
          const fetched = await fetchContestRange(fetchFrom, neededUpTo);
          for (const r of fetched) {
            addNewContest(r.concurso, r.dezenas);
          }
          addNewContest(latest.concurso, latest.dezenas);
          allContests = await getAllContests();
        }

        setHistorico(allContests);
      } catch {
        const allContests = await getAllContests();
        setHistorico(allContests);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const performances = useMemo<ContestPerformance[]>(() => {
    if (historico.length < 3 || !latestConcurso) return [];

    // Find the latest contest index to exclude it
    const latestIdx = historico.findIndex((c) => c.concurso === latestConcurso);
    const endIdx = latestIdx >= 0 ? latestIdx - 1 : historico.length - 2;

    if (endIdx < 1) return [];

    const results: ContestPerformance[] = [];
    const startIdx = Math.max(1, endIdx - 14); // last 15 contests

    for (let i = startIdx; i <= endIdx; i++) {
      const contestAnterior = historico[i - 1];
      const contestAtual = historico[i];
      const historicoAntes = historico.slice(0, i).map((c) => c.dezenas);

      const sniperResult = runSniperAlgorithm(contestAnterior.dezenas, historicoAntes);

      const strategies: StrategyResult[] = STRATEGY_ORDER.map(({ tag, label }) => {
        const game = findGameByTag(sniperResult.games, tag);
        if (!game) {
          return { tag, label, acertos: -1, aprovado: false, motivo: "Não gerado" };
        }
        if (!game.aprovado) {
          return { tag, label, acertos: -1, aprovado: false, motivo: game.motivo };
        }
        const hits = calcHits(game.numbers, contestAtual.dezenas);
        return { tag, label, acertos: hits, aprovado: true, motivo: "Aprovado" };
      });

      results.push({
        concurso: contestAtual.concurso,
        strategies,
      });
    }

    return results.reverse();
  }, [historico, latestConcurso]);

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
              <BarChart3 className="w-5 h-5" /> DESEMPENHO
            </h1>
            <p className="text-[10px] text-muted-foreground font-display tracking-wider">
              Últimos 15 concursos — todas as estratégias
            </p>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <p className="text-xs text-muted-foreground font-display tracking-wider">Buscando resultados...</p>
          </div>
        ) : performances.length === 0 ? (
          <div className="neon-card rounded-xl p-6 text-center">
            <p className="text-xs text-muted-foreground">Dados insuficientes para calcular o histórico.</p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="neon-card rounded-xl p-3 mb-2 animate-fade-in-up">
              <div className="grid grid-cols-[60px_1fr_1fr_1fr_1fr] gap-1 text-center">
                <span className="font-display text-[9px] tracking-wider text-muted-foreground uppercase">Conc.</span>
                {STRATEGY_ORDER.map((s) => (
                  <span key={s.tag} className="font-display text-[9px] tracking-wider text-primary font-bold">
                    {s.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Rows */}
            <div className="space-y-1">
              {performances.map((p, idx) => (
                <div
                  key={p.concurso}
                  className="neon-card rounded-lg p-3 animate-fade-in-up border border-border/20"
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  <div className="grid grid-cols-[60px_1fr_1fr_1fr_1fr] gap-1 items-center text-center">
                    <span className="font-display text-[11px] font-bold text-foreground text-left">
                      #{p.concurso}
                    </span>
                    {p.strategies.map((s) => (
                      <div key={s.tag}>
                        {s.aprovado ? (
                          <div className={`rounded-md py-1 px-1 ${getHitBg(s.acertos)}`}>
                            <span className={`font-display text-sm font-bold ${getHitColor(s.acertos)}`}>
                              {s.acertos}
                            </span>
                          </div>
                        ) : (
                          <div className="rounded-md py-1 px-1">
                            <span className="font-display text-[8px] text-red-400/80 leading-tight block">
                              🛑 {getShortMotivo(s.motivo)}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="neon-card rounded-xl p-3 mt-4 animate-fade-in-up" style={{ animationDelay: "700ms" }}>
              <p className="font-display text-[10px] tracking-wider text-muted-foreground/60 uppercase text-center mb-2">
                Legenda — Acertos por estratégia
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <span className="flex items-center gap-1 text-[10px]">
                  <Target className="w-3 h-3 text-green-400" /> 14-15
                </span>
                <span className="flex items-center gap-1 text-[10px]">
                  <Target className="w-3 h-3 text-emerald-400" /> 13
                </span>
                <span className="flex items-center gap-1 text-[10px]">
                  <Target className="w-3 h-3 text-primary" /> 12
                </span>
                <span className="flex items-center gap-1 text-[10px]">
                  <Target className="w-3 h-3 text-yellow-400" /> 11
                </span>
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground/50">
                  ≤10
                </span>
                <span className="flex items-center gap-1 text-[10px] text-red-400/80">
                  🛑 Reprovado
                </span>
              </div>
            </div>
          </>
        )}

        <button
          onClick={() => navigate("/")}
          className="w-full py-3.5 rounded-lg font-display text-sm tracking-widest uppercase bg-muted text-primary neon-border hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-6"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para a Página Inicial
        </button>
      </div>
    </div>
  );
};

export default HistoricoResultados;
