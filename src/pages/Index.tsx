import { useState } from "react";
import { Crosshair, Shield } from "lucide-react";
import NumberInputGrid from "@/components/NumberInputGrid";
import ResultPanel from "@/components/ResultPanel";
import { runSniperAlgorithm, SniperResult } from "@/lib/sniper";

const Index = () => {
  const [result, setResult] = useState<SniperResult | null>(null);

  const handleSubmit = (numbers: number[]) => {
    setResult(runSniperAlgorithm(numbers));
  };

  return (
    <div className="min-h-screen bg-background tactical-grid relative overflow-hidden">
      {/* Scan line effect */}
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

        {/* Content */}
        {result ? (
          <ResultPanel result={result} onReset={() => setResult(null)} />
        ) : (
          <NumberInputGrid onSubmit={handleSubmit} />
        )}
      </div>
    </div>
  );
};

export default Index;
