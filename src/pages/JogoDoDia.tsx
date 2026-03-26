import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2, AlertCircle, Hash, Calendar, Clock } from "lucide-react";
import AdGate from "@/components/AdGate";
import ResultPanel from "@/components/ResultPanel";
import { runSniperAlgorithm, SniperResult } from "@/lib/sniper";
import { fetchLatestResult } from "@/lib/lotofacil-api";
import { getAllContests, addNewContest, ConcursoHistorico } from "@/lib/historico-service";

function isBlockedTime(): boolean {
  const now = new Date();
  const utcHours = now.getUTCHours();
  const brasiliaHour = (utcHours - 3 + 24) % 24;
  return brasiliaHour >= 20 && brasiliaHour < 22;
}

const JogoDoDia = () => {
  const navigate = useNavigate();
  const [adCompleted, setAdCompleted] = useState(false);
  const [blocked, setBlocked] = useState(isBlockedTime());
  const [historico, setHistorico] = useState<ConcursoHistorico[]>([]);

  useEffect(() => {
    getAllContests().then(setHistorico).catch(() => {});
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setBlocked(isBlockedTime()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const { data: latest, isLoading, error } = useQuery({
    queryKey: ["lotofacil-latest"],
    queryFn: fetchLatestResult,
    staleTime: 1000 * 60 * 30,
  });

  useEffect(() => {
    if (latest) {
      addNewContest(latest.concurso, latest.dezenas);
      getAllContests().then(setHistorico).catch(() => {});
    }
  }, [latest]);

  const historicoNumbers = historico.map((c) => c.dezenas);
  const autoResult = latest ? runSniperAlgorithm(latest.dezenas, historicoNumbers) : null;

  const handleReset = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background tactical-grid relative overflow-hidden">
      <div className="scan-line absolute inset-0 pointer-events-none z-0 h-[200%]" />

      <div className="relative z-10 max-w-md mx-auto px-4 py-8 pb-16">
        <header className="text-center mb-8">
          <h2 className="font-display text-lg tracking-widest text-primary neon-text uppercase">
            Jogo do Dia
          </h2>
          <p className="font-display text-[10px] tracking-[0.3em] text-muted-foreground uppercase mt-1">
            Protocolo Sniper · Lotofácil
          </p>
        </header>

        {/* Loading */}
        {isLoading && (
          <div className="neon-card rounded-xl p-8 text-center animate-fade-in-up">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
            <p className="font-display text-xs tracking-widest text-muted-foreground uppercase">
              Buscando último concurso...
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="neon-card rounded-xl p-6 text-center border-destructive/30 animate-fade-in-up mb-4">
            <AlertCircle className="w-6 h-6 text-destructive mx-auto mb-2" />
            <p className="text-sm text-destructive mb-1 font-display tracking-wider">Erro ao buscar resultado</p>
            <p className="text-xs text-muted-foreground">Tente novamente mais tarde.</p>
          </div>
        )}

        {/* Latest contest info */}
        {latest && !adCompleted && !blocked && (
          <div className="neon-card rounded-xl p-5 mb-4 animate-fade-in-up">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-xs tracking-widest text-neon-cyan uppercase">
                Último Concurso
              </h3>
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Hash className="w-3 h-3" /> {latest.concurso}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {latest.data}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {latest.dezenas.map((n) => (
                <div
                  key={n}
                  className="w-7 h-7 rounded bg-primary/10 border border-primary/20 flex items-center justify-center font-display font-bold text-primary overflow-hidden"
                >
                  <span style={{ fontSize: "13px", lineHeight: 1, transform: "scaleY(1.4)", display: "inline-block" }}>
                    {String(n).padStart(2, "0")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Blocked time */}
        {blocked && (
          <div className="neon-card rounded-xl p-6 text-center animate-fade-in-up mb-4 border-warning/30">
            <Clock className="w-8 h-8 text-warning mx-auto mb-3 animate-pulse" />
            <p className="text-sm font-display tracking-wider text-warning mb-1">
              Aguardando Sorteio
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              O sorteio da Lotofácil acontece às <span className="text-primary font-semibold">21h</span>.
              Novos jogos estarão disponíveis após a atualização do resultado.
            </p>
            <p className="text-[10px] text-muted-foreground mt-3 font-display tracking-wider uppercase">
              Apostas encerram às 20h · Resultado após 21h
            </p>
          </div>
        )}

        {/* Ad gate → Result */}
        {latest && !blocked && (
          <>
            {!adCompleted ? (
              <AdGate onComplete={() => setAdCompleted(true)} />
            ) : (
              <div className="animate-fade-in-up">
                <ResultPanel result={autoResult!} onReset={handleReset} />
              </div>
            )}
          </>
        )}

        {/* Back button when blocked or error */}
        {(blocked || error) && (
          <button
            onClick={() => navigate("/")}
            className="w-full py-3 rounded-lg font-display text-xs tracking-widest uppercase bg-muted text-muted-foreground hover:text-foreground transition-all active:scale-[0.98] mt-4"
          >
            Retornar à Página Inicial
          </button>
        )}
      </div>
    </div>
  );
};

export default JogoDoDia;
