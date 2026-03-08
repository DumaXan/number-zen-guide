import { useState, useEffect, useMemo } from "react";
import { Crosshair, Search, ChevronDown } from "lucide-react";
import { ConcursoHistorico, getAllContests } from "@/lib/historico-service";

interface ContestSelectorProps {
  onSubmit: (numbers: number[], concurso: number) => void;
}

const ContestSelector = ({ onSubmit }: ContestSelectorProps) => {
  const [contests, setContests] = useState<ConcursoHistorico[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConcurso, setSelectedConcurso] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getAllContests()
      .then((data) => {
        setContests(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Descending order
  const sortedContests = useMemo(() => {
    const sorted = [...contests].sort((a, b) => b.concurso - a.concurso);
    // Remove the 2 most recent contests
    return sorted.slice(2);
  }, [contests]);

  const filteredContests = useMemo(() => {
    if (!searchTerm) return sortedContests;
    return sortedContests.filter((c) =>
      String(c.concurso).includes(searchTerm)
    );
  }, [sortedContests, searchTerm]);

  const selectedContest = contests.find((c) => c.concurso === selectedConcurso);

  const handleSubmit = () => {
    if (selectedContest) {
      onSubmit(selectedContest.dezenas, selectedContest.concurso);
    }
  };

  if (loading) {
    return (
      <div className="neon-card rounded-xl p-5 text-center">
        <p className="text-xs text-muted-foreground font-display tracking-wider">
          Carregando histórico...
        </p>
      </div>
    );
  }

  return (
    <div className="neon-card rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Search className="w-4 h-4 text-primary" />
        <h2 className="font-display text-sm tracking-widest text-primary uppercase">
          Selecionar Concurso
        </h2>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <input
          type="text"
          placeholder="Buscar por número do concurso..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 font-display tracking-wider"
        />
      </div>

      {/* Dropdown list */}
      <div className="max-h-48 overflow-y-auto rounded-lg border border-border bg-muted/30 mb-4 scrollbar-thin">
        {filteredContests.length === 0 ? (
          <p className="text-xs text-muted-foreground p-3 text-center">
            Nenhum concurso encontrado
          </p>
        ) : (
          filteredContests.map((c) => (
            <button
              key={c.concurso}
              onClick={() => setSelectedConcurso(c.concurso)}
              className={`w-full text-left px-3 py-2.5 transition-colors border-b border-border/30 last:border-b-0 ${
                selectedConcurso === c.concurso
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <span className="font-display text-sm font-bold tracking-wider">#{c.concurso}</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {c.dezenas.map((n) => (
                  <span key={n} className="text-[10px] opacity-60 font-display">
                    {String(n).padStart(2, "0")}
                  </span>
                ))}
              </div>
            </button>
          ))
        )}
      </div>

      {/* Selected preview */}
      {selectedContest && (
        <div className="mb-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-xs text-muted-foreground font-display tracking-wider mb-2">
            Concurso <span className="text-primary font-bold">#{selectedContest.concurso}</span>
          </p>
          <div className="grid grid-cols-5 gap-1.5">
            {selectedContest.dezenas.map((n) => (
              <div
                key={n}
                className="aspect-square rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center font-display text-lg font-bold text-primary"
              >
                {String(n).padStart(2, "0")}
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!selectedContest}
        className={`w-full py-3.5 rounded-lg font-display text-sm tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 ${
          selectedContest
            ? "bg-primary text-primary-foreground neon-border hover:brightness-110 active:scale-[0.98]"
            : "bg-muted text-muted-foreground cursor-not-allowed"
        }`}
      >
        <Crosshair className="w-4 h-4" />
        Executar Protocolo
      </button>
    </div>
  );
};

export default ContestSelector;
