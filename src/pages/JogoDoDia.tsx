import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2, AlertCircle, Hash, Calendar, Clock, ArrowLeft, ExternalLink,
  Crosshair, Ban, Telescope, ShieldAlert, Lock, Play, Timer, TrendingUp,
  Copy, Check, Activity, Rocket
} from "lucide-react";
import { runSniperAlgorithm, SniperResult, GameResult } from "@/lib/sniper";
import { fetchLatestResult } from "@/lib/lotofacil-api";
import { getAllContests, addNewContest, ConcursoHistorico } from "@/lib/historico-service";
import { AdMob, RewardAdOptions, AdMobRewardItem } from "@capacitor-community/admob";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

function isBlockedTime(): boolean {
  const now = new Date();
  const utcHours = now.getUTCHours();
  const brasiliaHour = (utcHours - 3 + 24) % 24;
  return brasiliaHour >= 20 && brasiliaHour < 22;
}

const SAFETY_MESSAGES = [
  {
    icon: Crosshair,
    title: "Aviso do Prof. Eustáquio Salamanca: Recuar também é estratégia.",
    body: "Após analisar os padrões de hoje, o algoritmo identificou uma baixa probabilidade de acerto para as tendências atuais. Para um Sniper de elite, a vitória consiste em saber não apenas o que apostar, mas o momento exato de quando apostar. Poupe sua munição para o próximo sorteio favorável.",
  },
  {
    icon: Ban,
    title: "Análise de Hoje: Fora do Alvo.",
    body: "Segundo os cálculos estatísticos do Prof. Salamanca, as combinações de hoje não atingiram o nível de confiança necessário. Não geramos jogos hoje para proteger seu capital. Lembre-se: ser Sniper é ser seletivo para ser letal.",
  },
  {
    icon: Telescope,
    title: "Hoje não é dia de tiro, é dia de observação.",
    body: "O Professor Salamanca analisou os últimos 8 anos de resultados e concluiu que o cenário de hoje é instável. Nossa estratégia é clara: só sugerimos apostas quando a matemática está ao nosso favor. Aguarde o próximo sinal para um jogo com maior potencial de acerto.",
  },
];

const AD_IDS = [
  "ca-app-pub-3947057911901585/7268303549",
  "ca-app-pub-3947057911901585/2799114495",
];

const formatNumbers = (numbers: number[]) =>
  numbers.map((n) => String(n).padStart(2, "0")).join(" - ");

/* ─── Locked Game Card ─── */
const LockedGameCard = ({
  label,
  adId,
  onUnlock,
}: {
  label: string;
  adId: string;
  onUnlock: () => void;
}) => {
  const [phase, setPhase] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleWatch = async () => {
    setPhase("loading");
    setError(null);
    const options: RewardAdOptions = { adId, isTesting: false };
    try {
      await AdMob.prepareRewardVideoAd(options);
      const reward: AdMobRewardItem = await AdMob.showRewardVideoAd();
      if (reward) {
        onUnlock();
      } else {
        setError("O vídeo não foi concluído. Tente novamente.");
        setPhase("idle");
      }
    } catch {
      setError("Não foi possível carregar o anúncio. Tente novamente.");
      setPhase("idle");
    }
  };

  return (
    <div className="neon-card rounded-xl p-5 animate-fade-in-up border-primary/20 text-center">
      <div className="flex items-center justify-center gap-2 mb-3">
        <Lock className="w-5 h-5 text-primary" />
        <h3 className="font-display text-xs tracking-widest text-primary uppercase">
          {label} — Bloqueado
        </h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Assista a um anúncio para desbloquear este jogo.
      </p>
      {error && (
        <div className="flex items-center gap-2 text-destructive text-xs mb-3 justify-center">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </div>
      )}
      {phase === "loading" ? (
        <div className="flex items-center justify-center gap-2 py-3 text-warning">
          <Timer className="w-4 h-4 animate-pulse" />
          <span className="font-display text-xs tracking-widest uppercase">Carregando...</span>
        </div>
      ) : (
        <button
          onClick={handleWatch}
          className="w-full py-3 rounded-lg font-display text-xs tracking-widest uppercase bg-primary text-primary-foreground neon-border hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4" />
          Assistir Anúncio
        </button>
      )}
    </div>
  );
};

/* ─── Unlocked Game Card ─── */
const UnlockedGameCard = ({ label, tag, game }: { label: string; tag: string; game: GameResult }) => (
  <div className="neon-card rounded-xl p-4 animate-fade-in-up">
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-display text-xs tracking-widest text-neon-cyan uppercase">{label}</h3>
      <div className="flex gap-3 text-xs text-muted-foreground">
        <span className="text-[10px] opacity-50">{tag}</span>
        <span className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3" /> {game.attrs.soma}
        </span>
        <span className="flex items-center gap-1">
          <Hash className="w-3 h-3" /> {game.attrs.pares}P/{15 - game.attrs.pares}I
        </span>
      </div>
    </div>
    <div className="grid grid-cols-5 gap-1.5">
      {game.numbers.map((n) => (
        <div
          key={n}
          className="aspect-square rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center font-display text-xl font-bold text-primary"
        >
          {String(n).padStart(2, "0")}
        </div>
      ))}
    </div>
  </div>
);

/* ─── Main Page ─── */
const JogoDoDia = () => {
  const navigate = useNavigate();
  const [blocked, setBlocked] = useState(isBlockedTime());
  const [historico, setHistorico] = useState<ConcursoHistorico[]>([]);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [unlockedGames, setUnlockedGames] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

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
  const autoResult: SniperResult | null = latest
    ? runSniperAlgorithm(latest.dezenas, historicoNumbers)
    : null;

  // Build approved games list
  const approvedGames = useMemo(() => {
    if (!autoResult) return [];
    const games: { key: string; tag: string; game: GameResult }[] = [];
    if (autoResult.g3.aprovado) games.push({ key: "g3", tag: "G3", game: autoResult.g3 });
    if (autoResult.g2.aprovado) games.push({ key: "g2", tag: "G2", game: autoResult.g2 });
    return games;
  }, [autoResult]);

  const bothRejected = autoResult ? !autoResult.g2.aprovado && !autoResult.g3.aprovado : false;

  const safetyMessage = useMemo(
    () => SAFETY_MESSAGES[Math.floor(Math.random() * SAFETY_MESSAGES.length)],
    []
  );

  const unlockGame = (key: string) => {
    setUnlockedGames((prev) => new Set(prev).add(key));
  };

  const allUnlocked = approvedGames.every((g) => unlockedGames.has(g.key));

  const handleCopy = async () => {
    let text = "🎯 *SNIPER - Lotofácil*\n\n";
    approvedGames.forEach((g, i) => {
      if (unlockedGames.has(g.key)) {
        text += `📋 *Jogo ${String(i + 1).padStart(2, "0")}:* (${g.tag})\n${formatNumbers(g.game.numbers)}\n`;
        text += `Soma: ${g.game.attrs.soma} | ${g.game.attrs.pares}P/${15 - g.game.attrs.pares}I\n\n`;
      }
    });
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

        {/* Main content when latest is loaded and not blocked */}
        {latest && !blocked && (
          <div className="space-y-4">
            {/* Último Concurso */}
            <div className="neon-card rounded-xl p-5 animate-fade-in-up">
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

            {/* Games found count */}
            {autoResult && !bothRejected && (
              <div className="neon-card rounded-xl p-4 animate-fade-in-up text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Rocket className="w-5 h-5 text-primary animate-pulse-neon" />
                  <h3 className="font-display text-sm tracking-wider text-primary neon-text uppercase">
                    {approvedGames.length === 2 ? "Sincronia Total" : "Jogo Parcial"}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  {approvedGames.length === 1
                    ? "1 jogo encontrado para o próximo concurso."
                    : `${approvedGames.length} jogos encontrados para o próximo concurso.`}
                </p>
              </div>
            )}

            {/* Both rejected */}
            {autoResult && bothRejected && (
              <>
                <div className="neon-card rounded-xl p-5 text-center animate-fade-in-up border-destructive/30">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <ShieldAlert className="w-6 h-6 text-destructive" />
                    <h2 className="font-display text-lg tracking-wider text-destructive">
                      OPERAÇÃO CANCELADA
                    </h2>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Filtros de segurança ativados. Economize para o próximo concurso.
                  </p>
                </div>

                <div className="neon-card rounded-xl p-6 animate-fade-in-up border-warning/20">
                  <div className="flex justify-center mb-4">
                    <safetyMessage.icon className="w-10 h-10 text-warning" />
                  </div>
                  <h3 className="font-display text-sm tracking-wider text-warning text-center mb-3">
                    {safetyMessage.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed text-justify">
                    {safetyMessage.body}
                  </p>
                  <div className="mt-4 pt-4 border-t border-border/30 space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-3.5 h-3.5 text-warning" />
                      <span className="font-display text-[10px] tracking-widest text-warning uppercase">
                        Motivos do Descarte
                      </span>
                    </div>
                    <p className="text-[11px] text-warning/70"><span className="text-warning">→</span> G2: {autoResult.g2.motivo}</p>
                    <p className="text-[11px] text-warning/70"><span className="text-warning">→</span> G3: {autoResult.g3.motivo}</p>
                  </div>
                </div>
              </>
            )}

            {/* Individual game cards */}
            {approvedGames.map((g, i) => (
              <div key={g.key}>
                {unlockedGames.has(g.key) ? (
                  <UnlockedGameCard
                    label={`Jogo ${String(i + 1).padStart(2, "0")}`}
                    tag={g.tag}
                    game={g.game}
                  />
                ) : (
                  <LockedGameCard
                    label={`Jogo ${String(i + 1).padStart(2, "0")}`}
                    adId={AD_IDS[i] || AD_IDS[0]}
                    onUnlock={() => unlockGame(g.key)}
                  />
                )}
              </div>
            ))}

            {/* Copy button - only when at least one unlocked */}
            {unlockedGames.size > 0 && !bothRejected && (
              <button
                onClick={handleCopy}
                className="w-full py-3.5 rounded-lg font-display text-xs tracking-widest uppercase bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all active:scale-[0.98] flex items-center justify-center gap-2 animate-fade-in-up"
              >
                {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copiado!" : "Copiar"}
              </button>
            )}
          </div>
        )}

        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          className="w-full mt-6 py-3 rounded-xl neon-card font-display text-xs tracking-widest uppercase text-primary hover:bg-primary/10 transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para a Página Inicial
        </button>
      </div>

      <AlertDialog open={showDisclaimer} onOpenChange={setShowDisclaimer}>
        <AlertDialogContent className="border-primary/30 bg-white max-w-sm mx-4 rounded-xl shadow-[0_0_40px_rgba(139,92,246,0.3)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-sm tracking-widest uppercase text-primary neon-text text-center">
              Aviso Importante
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs leading-relaxed text-center" style={{ color: "#000" }}>
              O Sniper Lotofácil não possui integração ou vínculo com as Loterias da CAIXA. Nosso sistema gera estratégias e sugestões de dezenas. Para efetivar o seu jogo, você deve anotar as dezenas geradas e realizar a aposta manualmente pelo aplicativo oficial Loterias CAIXA ou em uma Casa Lotérica.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col items-center gap-3 sm:flex-col w-full">
            <AlertDialogAction
              onClick={() => setShowDisclaimer(false)}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-display text-xs tracking-widest uppercase hover:bg-primary/90 transition-all shadow-md"
            >
              OK
            </AlertDialogAction>
            <a
              href="https://play.google.com/store/apps/details?id=br.gov.caixa.loterias.apostas"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-xl bg-secondary text-secondary-foreground font-display text-[10px] tracking-widest uppercase hover:bg-secondary/80 transition-all flex flex-col items-center justify-center gap-1 shadow-md text-center"
            >
              <span className="flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />
                Baixar o aplicativo
              </span>
              <span>de Loterias da CAIXA</span>
            </a>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default JogoDoDia;
