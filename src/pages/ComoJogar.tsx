import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ComoJogar = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background tactical-grid relative overflow-hidden">
      <div className="scan-line absolute inset-0 pointer-events-none z-0 h-[200%]" />

      <div className="relative z-10 max-w-md mx-auto px-4 py-8 pb-16">
        <header className="text-center mb-6">
          <h1 className="font-display text-xl font-bold tracking-wider text-primary neon-text">
            COMO JOGAR
          </h1>
        </header>

        <div className="neon-card rounded-xl p-5 space-y-6 text-sm text-foreground leading-relaxed">
          {/* Intro */}
          <div>
            <h2 className="font-display text-base font-bold text-primary mb-2 tracking-wide">
              Como Funciona a Lotofácil
            </h2>
            <p className="text-muted-foreground text-xs text-justify">
              A Lotofácil é, como o próprio nome diz, uma das modalidades mais simples de apostar e ganhar na loteria brasileira. Diferente de outros jogos, aqui as chances de premiação são muito mais frequentes, o que a torna a favorita de quem busca consistência.
            </p>
          </div>

          {/* O Básico */}
          <div>
            <h3 className="font-display text-sm font-bold text-primary mb-2">📍 O Básico do Jogo</h3>
            <p className="text-muted-foreground text-xs text-justify">
              O volante da Lotofácil contém 25 números (de 01 a 25).
            </p>
            <p className="text-muted-foreground text-xs text-justify mt-1">
              Para jogar, você deve marcar entre 15 e 20 números. Em cada sorteio, são extraídas 15 dezenas vencedoras.
            </p>
          </div>

          {/* Faixas de Premiação */}
          <div>
            <h3 className="font-display text-sm font-bold text-primary mb-2">🏆 Faixas de Premiação</h3>
            <p className="text-muted-foreground text-xs mb-2">Você ganha prêmios se acertar:</p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li><span className="text-primary font-semibold">11 números:</span> Prêmio fixo.</li>
              <li><span className="text-primary font-semibold">12 números:</span> Prêmio fixo.</li>
              <li><span className="text-primary font-semibold">13 números:</span> Prêmio fixo.</li>
              <li><span className="text-primary font-semibold">14 números:</span> Grande prêmio (valor variável, dividido entre os acertadores).</li>
              <li><span className="text-primary font-semibold">15 números:</span> O Prêmio Máximo.</li>
            </ul>
          </div>

          {/* Tabela de Valores */}
          <div>
            <h3 className="font-display text-sm font-bold text-primary mb-3">💰 Valores e Probabilidades (Apostas Simples)</h3>
            <div className="rounded-lg overflow-hidden border border-primary/20">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-primary/20">
                    <th className="py-2 px-3 text-left font-display tracking-wider text-primary">Quantidade de números</th>
                    <th className="py-2 px-3 text-right font-display tracking-wider text-primary">Valor da aposta</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { qty: 15, value: "R$ 3,50" },
                    { qty: 16, value: "R$ 56,00" },
                    { qty: 17, value: "R$ 476,00" },
                    { qty: 18, value: "R$ 2.856,00" },
                    { qty: 19, value: "R$ 13.566,00" },
                    { qty: 20, value: "R$ 54.264,00" },
                  ].map((row, i) => (
                    <tr key={row.qty} className={i % 2 === 0 ? "bg-muted/30" : "bg-muted/10"}>
                      <td className="py-2 px-3 text-muted-foreground">{row.qty}</td>
                      <td className="py-2 px-3 text-right font-semibold text-foreground">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 italic">
              Nota: Os valores podem ser alterados pela Caixa Econômica Federal. Consulte sempre o valor atualizado na casa lotérica.
            </p>
          </div>

          {/* Diferenciais */}
          <div>
            <h3 className="font-display text-sm font-bold text-primary mb-2">🚀 Diferenciais para o Apostador</h3>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li><span className="text-primary font-semibold">Surpresinha:</span> Deixe o sistema da Caixa escolher os números para você.</li>
              <li><span className="text-primary font-semibold">Teimosinha:</span> Insista com o mesmo jogo por 3, 6, 12, 18 ou 24 concursos consecutivos.</li>
            </ul>
          </div>

          {/* Visão do Professor */}
          <div>
            <h3 className="font-display text-sm font-bold text-primary mb-2">💡 A Visão do Professor Salamanca</h3>
            <p className="text-muted-foreground text-xs text-justify">
              A Lotofácil não é apenas sorte, é estatística aplicada. Enquanto o apostador comum joga de forma aleatória, o Sniper Lotofácil analisa tendências, ciclos de dezenas e padrões de frequência para que você pare de dar tiros no escuro e comece a focar nos alvos com maior probabilidade de aparição.
            </p>
          </div>

          {/* Dica de Segurança */}
          <div>
            <h3 className="font-display text-sm font-bold text-primary mb-2">🛡️ Dica de Segurança</h3>
            <p className="text-muted-foreground text-xs text-justify">
              Os sorteios da Lotofácil acontecem de segunda a sábado, sempre às 20h. Lembre-se: o Sniper é uma ferramenta de estratégia, mas o jogo deve ser sempre uma forma de entretenimento.
            </p>
          </div>

          {/* Warning */}
          <div className="text-center pt-2">
            <p className="text-xs text-warning font-display tracking-widest uppercase font-semibold">
              ⚠️ Jogue com responsabilidade
            </p>
          </div>
        </div>

        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          className="w-full mt-6 py-3 rounded-xl neon-card font-display text-xs tracking-widest uppercase text-primary hover:bg-primary/10 transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para a Página Inicial
        </button>
      </div>
    </div>
  );
};

export default ComoJogar;
