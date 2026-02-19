import { useState } from "react";
import { Crosshair, Shield, Loader2, AlertCircle, Calendar, Hash, ChevronDown, ChevronUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import NumberInputGrid from "@/components/NumberInputGrid";
import ResultPanel from "@/components/ResultPanel";
import AdGate from "@/components/AdGate";
import { runSniperAlgorithm, SniperResult } from "@/lib/sniper";
import { fetchLatestResult } from "@/lib/lotofacil-api";

const Index = () => {
  const [result, setResult] = useState<SniperResult | null>(null);
  const [adCompleted, setAdCompleted] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [mode, setMode] = useState<"auto" | "manual">("auto");

  const { data: latest, isLoading, error } = useQuery({
    queryKey: ["lotofacil-latest"],
    queryFn: fetchLatestResult,
    staleTime: 1000 * 60 * 30, // 30 min
  });

  const autoResult = latest ? runSniperAlgorithm(latest.dezenas) : null;

  const handleManualSubmit = (numbers: number[]) => {
    setMode("manual");
    setResult(runSniperAlgorithm(numbers));
  };

  const handleReset = () => {
    setResult(null);
    setAdCompleted(false);
    setMode("auto");
    setShowManual(false);
  };

  return (
    <div className="min-h-screen bg-background tactical-grid relative overflow-hidden">
      <div className="scan-line absolute inset-0 pointer-events-none z-0 h-[200%]" />

      <div className="relative z-10 max-w-md mx-auto px-4 py-8 pb-16">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Crosshair className="w-7 h-7 text-primary animate-pulse-neon" />
            <h1 className="font-display text-2xl font-bold tracking-wider text-primary neon-text">
              SNIPER
            </h1>
          </div>
          <p className="font-display text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
            Protocolo Tudo ou Nada
          </p>
          <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-muted-foreground font-display tracking-wider">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3" /> Paridade
            </span>
            <span>Piso G2</span>
            <span>Teto G3</span>
            <span>Inversão</span>
          </div>
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
            <p className="text-xs text-muted-foreground">Use a simulação manual abaixo.</p>
          </div>
        )}

        {/* Latest contest info */}
        {latest && !result && (
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
            <div className="grid grid-cols-5 gap-1.5">
              {latest.dezenas.map((n) => (
                <div
                  key={n}
                  className="aspect-square rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center font-display text-xs font-bold text-primary"
                >
                  {String(n).padStart(2, "0")}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main flow: auto mode */}
        {mode === "auto" && latest && !result && (
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

        {/* Manual mode result */}
        {mode === "manual" && result && (
          <ResultPanel result={result} onReset={handleReset} />
        )}

        {/* Manual simulation toggle */}
        {!result && (
          <div className="mt-6">
            <button
              onClick={() => setShowManual(!showManual)}
              className="w-full py-3 rounded-lg font-display text-[11px] tracking-widest uppercase bg-muted/50 text-muted-foreground hover:text-foreground transition-all flex items-center justify-center gap-2"
            >
              {showManual ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              Simular Outro Concurso
            </button>
            {showManual && (
              <div className="mt-4 animate-fade-in-up">
                <NumberInputGrid onSubmit={handleManualSubmit} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
