import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BarChart3, Trophy, Target, Loader2 } from "lucide-react";
import { getAllContests, ConcursoHistorico } from "@/lib/historico-service";
import { runSniperAlgorithm } from "@/lib/sniper";

interface ContestPerformance {
  concurso: number;
  resultado: number[];
  melhorAcertos: number;
  melhorTag: string;
  jogosAprovados: number;
  totalJogos: number;
}

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
  if (hits >= 14) return "bg-green-400/10 border-green-400/30";
  if (hits >= 13) return "bg-emerald-400/10 border-emerald-400/30";
  if (hits >= 12) return "bg-primary/10 border-primary/30";
  if (hits >= 11) return "bg-yellow-400/10 border-yellow-400/30";
  return "bg-muted/30 border-border/30";
}

const HistoricoResultados = () => {
  const navigate = useNavigate();
  const [historico, setHistorico] = useState<ConcursoHistorico[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllContests()
      .then(setHistorico)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const performances = useMemo<ContestPerformance[]>(() => {
    if (historico.length < 12) return [];

    const results: ContestPerformance[] = [];
    // Last 10 contests (skip the very last one since it's the "current" one)
    const startIdx = historico.length - 11;

    for (let i = startIdx; i < historico.length - 1; i++) {
      const contestAnterior = historico[i - 1];
      const contestAtual = historico[i];
      const historicoAntes = historico.slice(0, i).map((c) => c.dezenas);

      const sniperResult = runSniperAlgorithm(contestAnterior.dezenas, historicoAntes);

      let melhorAcertos = 0;
      let melhorTag = "—";
      const jogosAprovados = sniperResult.games.filter((g) => g.aprovado).length;

      for (const game of sniperResult.games) {
        if (!game.aprovado) continue;
        const hits = calcHits(game.numbers, contestAtual.dezenas);
        if (hits > melhorAcertos) {
          melhorAcertos = hits;
          melhorTag = game.tag;
        }
      }

      results.push({
        concurso: contestAtual.concurso,
        resultado: contestAtual.dezenas,
        melhorAcertos: jogosAprovados > 0 ? melhorAcertos : -1,
        melhorTag,
        jogosAprovados,
        totalJogos: 4,
      });
    }

    return results.reverse();
  }, [historico]);

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
              Últimos 10 concursos da estratégia
            </p>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <p className="text-xs text-muted-foreground font-display tracking-wider">Calculando...</p>
          </div>
        ) : (
          <div className="space-y-2">
            {performances.map((p, idx) => (
              <div
                key={p.concurso}
                className={`neon-card rounded-xl p-4 animate-fade-in-up border ${getHitBg(p.melhorAcertos)}`}
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div className="flex items-center justify-between">
                  {/* Left: contest info */}
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      <span className="font-display text-[10px] tracking-wider text-muted-foreground uppercase">Concurso</span>
                      <span className="font-display text-sm font-bold text-foreground">#{p.concurso}</span>
                    </div>
                    <div className="h-8 w-px bg-border/30" />
                    <div className="flex flex-col">
                      <span className="font-display text-[10px] tracking-wider text-muted-foreground">
                        {p.jogosAprovados === 0 ? "Nenhum jogo" : `${p.jogosAprovados} jogo${p.jogosAprovados > 1 ? "s" : ""}`}
                      </span>
                      {p.jogosAprovados > 0 && (
                        <span className="text-[10px] text-muted-foreground/60">
                          Melhor: {p.melhorTag}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: hits */}
                  <div className="flex items-center gap-2">
                    {p.melhorAcertos >= 0 ? (
                      <div className="flex items-center gap-1.5">
                        <Target className={`w-4 h-4 ${getHitColor(p.melhorAcertos)}`} />
                        <span className={`font-display text-xl font-bold ${getHitColor(p.melhorAcertos)}`}>
                          {p.melhorAcertos}
                        </span>
                        <span className="text-[10px] text-muted-foreground/60 self-end mb-0.5">/ 15</span>
                      </div>
                    ) : (
                      <span className="font-display text-[10px] tracking-wider text-muted-foreground/50 uppercase">
                        Sem aposta
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {performances.length === 0 && (
              <div className="neon-card rounded-xl p-6 text-center">
                <p className="text-xs text-muted-foreground">Dados insuficientes para calcular o histórico.</p>
              </div>
            )}
          </div>
        )}

        {/* Legend */}
        {!loading && performances.length > 0 && (
          <div className="neon-card rounded-xl p-3 mt-4 animate-fade-in-up" style={{ animationDelay: "700ms" }}>
            <p className="font-display text-[10px] tracking-wider text-muted-foreground/60 uppercase text-center mb-2">
              Legenda — Acertos do melhor jogo
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <span className="flex items-center gap-1 text-[10px]">
                <Trophy className="w-3 h-3 text-green-400" /> 14-15
              </span>
              <span className="flex items-center gap-1 text-[10px]">
                <Trophy className="w-3 h-3 text-emerald-400" /> 13
              </span>
              <span className="flex items-center gap-1 text-[10px]">
                <Trophy className="w-3 h-3 text-primary" /> 12
              </span>
              <span className="flex items-center gap-1 text-[10px]">
                <Trophy className="w-3 h-3 text-yellow-400" /> 11
              </span>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground/50">
                ≤10
              </span>
            </div>
          </div>
        )}

        {/* Back button */}
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
