import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BarChart3 } from "lucide-react";
import ContestSelector from "@/components/ContestSelector";
import ResultPanel from "@/components/ResultPanel";
import { runSniperAlgorithm, SniperResult } from "@/lib/sniper";
import { getAllContests, ConcursoHistorico } from "@/lib/historico-service";

const SimularConcurso = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState<SniperResult | null>(null);
  const [historico, setHistorico] = useState<ConcursoHistorico[]>([]);
  const [manualConcurso, setManualConcurso] = useState<number | null>(null);

  useEffect(() => {
    getAllContests().then(setHistorico).catch(() => {});
  }, []);

  const historicoNumbers = historico.map((c) => c.dezenas);

  const handleManualSubmit = (numbers: number[], concurso: number) => {
    setManualConcurso(concurso);
    setResult(runSniperAlgorithm(numbers, historicoNumbers));
  };

  const handleReset = () => {
    setResult(null);
    setManualConcurso(null);
  };

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
              <BarChart3 className="w-5 h-5" /> SIMULAR CONCURSO
            </h1>
            <p className="text-[10px] text-muted-foreground font-display tracking-wider">
              Escolha um concurso para simular
            </p>
          </div>
        </header>

        {/* Result or Selector */}
        {result ? (
          <ResultPanel result={result} onReset={handleReset} hideG2Ad hideStatus contestNumber={manualConcurso ?? undefined} />
        ) : (
          <ContestSelector onSubmit={handleManualSubmit} />
        )}

        {/* Botão voltar */}
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

export default SimularConcurso;
