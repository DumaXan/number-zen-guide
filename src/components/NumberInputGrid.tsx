import { useState } from "react";
import { Crosshair, Target } from "lucide-react";

interface NumberInputGridProps {
  onSubmit: (numbers: number[]) => void;
}

const NumberInputGrid = ({ onSubmit }: NumberInputGridProps) => {
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const toggle = (n: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(n)) {
        next.delete(n);
      } else if (next.size < 15) {
        next.add(n);
      }
      return next;
    });
  };

  const handleSubmit = () => {
    if (selected.size === 15) {
      onSubmit(Array.from(selected));
    }
  };

  const clear = () => setSelected(new Set());

  return (
    <div className="neon-card rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-primary" />
        <h2 className="font-display text-sm tracking-widest text-primary uppercase">
          Último Concurso
        </h2>
      </div>
      <p className="text-muted-foreground text-sm mb-4">
        Selecione as <span className="text-primary font-semibold">15 dezenas</span> sorteadas
      </p>

      <div className="grid grid-cols-5 gap-2 mb-5">
        {Array.from({ length: 25 }, (_, i) => i + 1).map((n) => {
          const isSelected = selected.has(n);
          return (
            <button
              key={n}
              onClick={() => toggle(n)}
              className={`
                relative aspect-square rounded-lg font-display text-sm font-bold
                transition-all duration-200 active:scale-95
                ${
                  isSelected
                    ? "bg-primary text-primary-foreground neon-border"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }
              `}
            >
              {String(n).padStart(2, "0")}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-muted-foreground font-display tracking-wider">
          {selected.size}/15 SELECIONADAS
        </span>
        <button
          onClick={clear}
          className="text-xs text-destructive hover:text-destructive/80 font-medium transition-colors"
        >
          Limpar
        </button>
      </div>

      <button
        onClick={handleSubmit}
        disabled={selected.size !== 15}
        className={`
          w-full py-3.5 rounded-lg font-display text-sm tracking-widest uppercase
          transition-all duration-300 flex items-center justify-center gap-2
          ${
            selected.size === 15
              ? "bg-primary text-primary-foreground neon-border hover:brightness-110 active:scale-[0.98]"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }
        `}
      >
        <Crosshair className="w-4 h-4" />
        Executar Protocolo
      </button>
    </div>
  );
};

export default NumberInputGrid;
