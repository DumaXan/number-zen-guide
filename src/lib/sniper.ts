// =============================================================================
// SNIPER LOTOFÁCIL — Estratégias de Geração de Jogos
// Clássicas (J04, LH, J01, FLS) + Recombinação (RMSE, CRMSE_PLUS, MISSION)
// + Motor Relacional (filtros Intra/Inter) + Limitador de 4 jogos
// =============================================================================

const MOLDURA = new Set([1, 2, 3, 4, 5, 6, 10, 11, 15, 16, 20, 21, 22, 23, 24, 25]);
const MOLDURA_ARR = [1, 2, 3, 4, 5, 6, 10, 11, 15, 16, 20, 21, 22, 23, 24, 25];
const MIOLO_TOTAL = [7, 8, 9, 12, 13, 14, 17, 18, 19];
const PRIMOS = new Set([2, 3, 5, 7, 11, 13, 17, 19, 23]);
const FIBONACCI = new Set([1, 2, 3, 5, 8, 13, 21]);
const QUADRADOS_PERFEITOS = new Set([1, 4, 9, 16, 25]);
const TRIANGULARES = new Set([1, 3, 6, 10, 15, 21]);
const MULTIPLOS_3 = new Set([3, 6, 9, 12, 15, 18, 21, 24]);
const TOP_5 = [20, 10, 25, 11, 13];

interface Prio { strat: string; bias: number }

const PRIORIDADE_RMSE: Record<number, Prio[]> = {
    0: [{strat: "FLS", bias: -0.5772}, {strat: "J04", bias: -0.5772}, {strat: "LH", bias: -0.5772}, {strat: "J01", bias: 4.5593}],
    1: [{strat: "J04", bias: -0.535}, {strat: "FLS", bias: -1.2228}, {strat: "LH", bias: -1.2228}, {strat: "J01", bias: 4.2748}],
    2: [{strat: "J04", bias: -0.213}, {strat: "FLS", bias: -1.8081}, {strat: "LH", bias: -1.8081}, {strat: "J01", bias: 4.0179}],
    3: [{strat: "J04", bias: -0.1496}, {strat: "LH", bias: -2.4407}, {strat: "FLS", bias: -2.4797}, {strat: "J01", bias: 3.6439}],
    4: [{strat: "J04", bias: -0.2033}, {strat: "FLS", bias: 0.9756}, {strat: "LH", bias: -2.9951}, {strat: "J01", bias: 3.1008}],
    5: [{strat: "J04", bias: -0.4179}, {strat: "FLS", bias: 0.7154}, {strat: "J01", bias: 2.7984}, {strat: "LH", bias: -3.5089}],
    6: [{strat: "J04", bias: -0.7236}, {strat: "FLS", bias: 0.2699}, {strat: "LH", bias: 0.2455}, {strat: "J01", bias: 2.452}],
    7: [{strat: "J04", bias: -1.3431}, {strat: "LH", bias: 0.1366}, {strat: "J01", bias: 1.9317}, {strat: "FLS", bias: 2.0504}],
    8: [{strat: "FLS", bias: 1.387}, {strat: "J01", bias: 1.3886}, {strat: "LH", bias: 0.0553}, {strat: "J04", bias: -1.9171}],
    9: [{strat: "J01", bias: 0.9756}, {strat: "LH", bias: 0.0211}, {strat: "J04", bias: 1.8293}, {strat: "FLS", bias: 3.7203}],
    10: [{strat: "J01", bias: 0.5984}, {strat: "J04", bias: 1.4764}, {strat: "LH", bias: 0.0049}, {strat: "FLS", bias: 3.065}],
    11: [{strat: "J01", bias: 0.2341}, {strat: "J04", bias: 1.1431}, {strat: "LH", bias: -0.0016}, {strat: "FLS", bias: 2.4407}],
    12: [{strat: "J01", bias: -0.1252}, {strat: "J04", bias: 0.8195}, {strat: "LH", bias: -0.0033}, {strat: "FLS", bias: 1.8179}],
    13: [{strat: "J04", bias: 0.5041}, {strat: "J01", bias: 0.0293}, {strat: "FLS", bias: 1.2098}, {strat: "LH", bias: 0.0016}],
    14: [{strat: "J04", bias: 0.2033}, {strat: "FLS", bias: 0.5659}, {strat: "J01", bias: 0.5659}, {strat: "LH", bias: 0.0}]
};

// Ordem de efetividade para o limitador de saída (máx. 4 jogos)
const ORDEM_PRIORIDADE: Record<string, number> = {
  J01: 1, RMSE: 2, CRMSE_PLUS: 3, MISSION: 4, LH: 5, J04: 6, FLS: 7,
};

export interface GameAttributes {
  soma: number;
  pares: number;
}

export interface EssentialMetrics {
  soma_total: number; s5menores: number; s5meio: number; s5maiores: number;
  dp: number; soma_digitos: number; l1: number; l2: number; c1: number; c2: number; c3: number;
  qtd_fibonacci: number; qtd_mult_3: number; qtd_triangulares: number; qtd_miolo: number;
  qtd_pares: number; qtd_impares: number; iniciadas_2: number;
  faixa_media: number; faixa_baixa: number; faixa_alta: number;
  repetidas: number; pares_consec: number; maior_seq: number;
  gap_maximo: number; amplitude: number;
}

export interface GameResult {
  numbers: number[];
  attrs: GameAttributes;
  aprovado: boolean;
  motivo: string;
  tag: string;
  metricas?: EssentialMetrics;
}

export interface SniperResult {
  games: GameResult[];
  naoSorteadas: number[];
}

function calcAttrs(jogo: number[]): GameAttributes {
  return {
    soma: jogo.reduce((a, b) => a + b, 0),
    pares: jogo.filter((x) => x % 2 === 0).length,
  };
}

function pstdev(arr: number[]): number {
  if (arr.length <= 1) return 0;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const variance = arr.reduce((s, x) => s + (x - mean) ** 2, 0) / arr.length;
  return Math.sqrt(variance);
}

function somaDigitos(jogo: number[]): number {
  return jogo.reduce((s, n) => {
    let sum = 0;
    for (const d of String(n)) sum += parseInt(d);
    return s + sum;
  }, 0);
}

function maxSequencia(jogo: number[]): number {
  if (jogo.length === 0) return 0;
  const sorted = [...jogo].sort((a, b) => a - b);
  let maxSeq = 1, atual = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === sorted[i - 1] + 1) atual++;
    else { maxSeq = Math.max(maxSeq, atual); atual = 1; }
  }
  return Math.max(maxSeq, atual);
}

function contarParesConsecutivos(jogo: number[]): number {
  const sorted = [...jogo].sort((a, b) => a - b);
  let pares = 0;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === sorted[i - 1] + 1) pares++;
  }
  return pares;
}

function obterLinhaColuna(dezena: number): [number, number] {
  return [Math.floor((dezena - 1) / 5) + 1, ((dezena - 1) % 5) + 1];
}

function analisarVolante(jogo: number[]): [Map<number, number[]>, Map<number, number[]>] {
  const linhas = new Map<number, number[]>();
  const colunas = new Map<number, number[]>();
  for (let k = 1; k <= 5; k++) { linhas.set(k, []); colunas.set(k, []); }
  for (const d of jogo) {
    const [l, c] = obterLinhaColuna(d);
    linhas.get(l)!.push(d);
    colunas.get(c)!.push(d);
  }
  return [linhas, colunas];
}

function calibrarJogo(jogo: number[], grupoN: number[], grupoSReserva: number[]): number[] {
  let result = [...jogo];
  let [lDict, cDict] = analisarVolante(result);

  for (const tipo of ['L', 'C'] as const) {
    const dictGeo = tipo === 'L' ? lDict : cDict;
    const vazios: number[] = [];
    for (let k = 1; k <= 5; k++) {
      if ((dictGeo.get(k) || []).length === 0) vazios.push(k);
    }
    if (vazios.length > 0 && grupoSReserva.length > 0) {
      let cheioId = 1;
      let cheioLen = 0;
      for (const [k, v] of dictGeo) {
        if (v.length > cheioLen) { cheioLen = v.length; cheioId = k; }
      }
      const candidatosRem = (dictGeo.get(cheioId) || []).filter(d => grupoN.includes(d));
      if (candidatosRem.length > 0) {
        const dezRem = candidatosRem[0];
        const target = vazios[0];
        const candidatosAdd = grupoSReserva.filter(d => {
          const [l, c] = obterLinhaColuna(d);
          return tipo === 'L' ? l === target : c === target;
        });
        if (candidatosAdd.length > 0) {
          result = result.filter(x => x !== dezRem);
          result.push(candidatosAdd[0]);
          result.sort((a, b) => a - b);
          [lDict, cDict] = analisarVolante(result);
        }
      }
    }
  }
  return result;
}

function calcularMetricasEssenciais(jogoIn: number[], ultimo: number[]): EssentialMetrics {
  const jogo = [...jogoIn].sort((a, b) => a - b);
  const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
  const [linhas, colunas] = analisarVolante(jogo);
  const gaps: number[] = [];
  for (let i = 0; i < jogo.length - 1; i++) gaps.push(jogo[i + 1] - jogo[i]);
  const mold = jogo.filter(x => MOLDURA.has(x)).length;
  const pares = jogo.filter(x => x % 2 === 0).length;

  return {
    soma_total: sum(jogo),
    s5menores: sum(jogo.slice(0, 5)),
    s5meio: sum(jogo.slice(5, 10)),
    s5maiores: sum(jogo.slice(10)),
    dp: Math.round(pstdev(jogo) * 100) / 100,
    soma_digitos: somaDigitos(jogo),
    l1: linhas.get(1)!.length,
    l2: linhas.get(2)!.length,
    c1: colunas.get(1)!.length,
    c2: colunas.get(2)!.length,
    c3: colunas.get(3)!.length,
    qtd_fibonacci: jogo.filter(x => FIBONACCI.has(x)).length,
    qtd_mult_3: jogo.filter(x => MULTIPLOS_3.has(x)).length,
    qtd_triangulares: jogo.filter(x => TRIANGULARES.has(x)).length,
    qtd_miolo: jogo.length - mold,
    qtd_pares: pares,
    qtd_impares: jogo.length - pares,
    iniciadas_2: jogo.filter(x => x >= 20 && x <= 25).length,
    faixa_media: jogo.filter(x => x >= 9 && x <= 17).length,
    faixa_baixa: jogo.filter(x => x >= 1 && x <= 8).length,
    faixa_alta: jogo.filter(x => x >= 18 && x <= 25).length,
    repetidas: jogo.filter(x => ultimo.includes(x)).length,
    pares_consec: contarParesConsecutivos(jogo),
    maior_seq: maxSequencia(jogo),
    gap_maximo: gaps.length > 0 ? Math.max(...gaps) : 0,
    amplitude: jogo[jogo.length - 1] - jogo[0],
  };
}

// =============================================================================
// VALIDADORES DAS NOVAS ESTRATÉGIAS
// =============================================================================
type Validation = [boolean, string];

function validarRegrasRmse(m: EssentialMetrics): Validation {
  const dp = m.dp, soma = m.soma_total;
  if (m.s5maiores >= 111 && m.s5maiores <= 112) return [false, "111 <= S5Maiores <= 112"];
  if (dp >= 6.80 && dp <= 6.86) return [false, "6.80 <= DP <= 6.86"];
  if (dp >= 6.96 && dp <= 6.99) return [false, "6.96 <= DP <= 6.99"];
  if (m.soma_digitos >= 69 && m.soma_digitos <= 72) return [false, "69 <= Soma Dígitos <= 72"];
  if (dp >= 7.01 && dp <= 7.03) return [false, "7.01 <= DP <= 7.03"];
  if (dp >= 7.06 && dp <= 7.10) return [false, "7.06 <= DP <= 7.10"];
  if (dp >= 7.18 && dp <= 7.21) return [false, "7.18 <= DP <= 7.21"];
  if (dp >= 7.23 && dp <= 7.25) return [false, "7.23 <= DP <= 7.25"];
  if (dp >= 7.31 && dp <= 7.36) return [false, "7.31 <= DP <= 7.36"];
  if (dp === 7.39) return [false, "DP == 7.39"];
  if (dp >= 7.51 && dp <= 7.58) return [false, "7.51 <= DP <= 7.58"];
  if (dp >= 7.60 && dp <= 7.62) return [false, "7.60 <= DP <= 7.62"];
  if (dp >= 7.67 && dp <= 7.68) return [false, "7.67 <= DP <= 7.68"];
  if (dp === 7.72) return [false, "DP == 7.72"];
  if (dp >= 7.79 && dp <= 7.81) return [false, "7.79 <= DP <= 7.81"];
  if (dp >= 7.84 && dp <= 7.86) return [false, "7.84 <= DP <= 7.86"];
  if (dp >= 7.98 && dp <= 8.11) return [false, "7.98 <= DP <= 8.11"];
  if (m.c1 === 2) return [false, "C1 == 2"];
  if (m.qtd_fibonacci === 6) return [false, "Qtd Fibonacci == 6"];
  if (m.qtd_mult_3 === 7) return [false, "Qtd Múltiplos 3 == 7"];
  if (m.qtd_triangulares === 5) return [false, "Qtd Triangulares == 5"];
  if (soma % 5 === 2) return [false, "Resto Soma Total/5 == 2"];
  if (soma % 12 === 0) return [false, "Resto Soma Total/12 == 0"];
  if (soma % 13 === 10) return [false, "Resto Soma Total/13 == 10"];
  if (m.s5meio >= 69) return [false, "Soma 5 do Meio >= 69"];
  if (m.soma_digitos === 67) return [false, "Soma Dígitos == 67"];
  if (m.soma_digitos >= 85) return [false, "Soma Dígitos >= 85"];
  if (m.s5menores >= 17 && m.s5menores <= 18) return [false, "17 <= S5Menores <= 18"];
  if (m.s5menores === 30) return [false, "Soma 5 Menores == 30"];
  if (soma >= 185 && soma <= 187) return [false, "185 <= Soma Total <= 187"];
  if (soma === 205) return [false, "Soma Total == 205"];
  if (soma >= 209) return [false, "Soma Total >= 209"];
  return [true, "Aprovado"];
}

function validarRegrasCrmsePlus(m: EssentialMetrics): Validation {
  const dp = m.dp, soma = m.soma_total;
  if (dp >= 6.29 && dp <= 6.37) return [false, "6.29 <= DP <= 6.37"];
  if (m.soma_digitos === 71) return [false, "Soma Dígitos == 71"];
  if (dp === 6.90) return [false, "DP == 6.90"];
  if (dp === 7.06) return [false, "DP == 7.06"];
  if (m.iniciadas_2 === 5) return [false, "Iniciadas com 2 (20-25) == 5"];
  if (soma >= 210) return [false, "Soma Total >= 210"];
  if (m.soma_digitos >= 68 && m.soma_digitos <= 69) return [false, "68 <= Soma Dígitos <= 69"];
  if (dp >= 7.02 && dp <= 7.03) return [false, "7.02 <= DP <= 7.03"];
  if (m.l2 === 5) return [false, "L2 == 5"];
  if (m.qtd_miolo === 3) return [false, "Qtd Miolo == 3"];
  if (m.qtd_triangulares <= 1) return [false, "Qtd Triangulares <= 1"];
  if ((m.s5maiores % 14) >= 2 && (m.s5maiores % 14) <= 3) return [false, "2 <= Resto S5Maiores/14 <= 3"];
  if (dp >= 6.44 && dp <= 6.45) return [false, "6.44 <= DP <= 6.45"];
  if (m.soma_digitos >= 86) return [false, "Soma Dígitos >= 86"];
  if (m.c1 === 0) return [false, "C1 == 0"];
  if (dp === 7.08) return [false, "DP == 7.08"];
  if (dp >= 6.49 && dp <= 6.56) return [false, "6.49 <= DP <= 6.56"];
  if (m.faixa_media === 4) return [false, "Faixa Média == 4"];
  if (soma % 14 === 6) return [false, "Resto Soma Total/14 == 6"];
  if (m.s5meio >= 68) return [false, "Soma 5 do Meio >= 68"];
  if (m.qtd_mult_3 <= 3) return [false, "Qtd Múltiplos 3 <= 3"];
  if (m.repetidas <= 6) return [false, "Repetidas <= 6"];
  if (dp >= 6.93 && dp <= 6.97) return [false, "6.93 <= DP <= 6.97"];
  if (m.pares_consec === 9) return [false, "Qtd Pares Consecutivos == 9"];
  if (soma % 12 === 10) return [false, "Resto Soma Total/12 == 10"];
  if (dp >= 6.66 && dp <= 6.68) return [false, "6.66 <= DP <= 6.68"];
  if (dp >= 7.51 && dp <= 7.57) return [false, "7.51 <= DP <= 7.57"];
  if (dp >= 6.72 && dp <= 6.73) return [false, "6.72 <= DP <= 6.73"];
  if (dp >= 7.14 && dp <= 7.23) return [false, "7.14 <= DP <= 7.23"];
  if (dp >= 7.36 && dp <= 7.47) return [false, "7.36 <= DP <= 7.47"];
  if (soma % 15 === 10) return [false, "Resto Soma Total/15 == 10"];
  if (dp >= 6.59 && dp <= 6.61) return [false, "6.59 <= DP <= 6.61"];
  if (soma >= 204 && soma <= 205) return [false, "204 <= Soma Total <= 205"];
  return [true, "Aprovado"];
}

function validarRegrasMission(m: EssentialMetrics): Validation {
  const dp = m.dp, soma = m.soma_total;
  if (dp >= 7.20 && dp <= 7.26) return [false, "7.20 <= DP <= 7.26"];
  if (dp >= 7.28 && dp <= 7.30) return [false, "7.28 <= DP <= 7.30"];
  if (soma === 171) return [false, "Soma Total == 171"];
  if (soma >= 204 && soma <= 205) return [false, "204 <= Soma Total <= 205"];
  if (m.s5meio === 69) return [false, "Soma 5 do Meio == 69"];
  if (m.soma_digitos === 60) return [false, "Soma Dígitos == 60"];
  if (m.soma_digitos === 74) return [false, "Soma Dígitos == 74"];
  if (m.l2 === 0) return [false, "L2 == 0"];
  if (m.c2 === 0) return [false, "C2 == 0"];
  if (dp >= 7.70 && dp <= 7.71) return [false, "7.70 <= DP <= 7.71"];
  if (dp >= 7.96 && dp <= 7.98) return [false, "7.96 <= DP <= 7.98"];
  if (soma >= 163 && soma <= 165) return [false, "163 <= Soma Total <= 165"];
  if (m.s5maiores >= 97 && m.s5maiores <= 98) return [false, "97 <= S5Maiores <= 98"];
  if (dp >= 6.63 && dp <= 7.17) return [false, "6.63 <= DP <= 7.17"];
  if (dp >= 7.47 && dp <= 7.49) return [false, "7.47 <= DP <= 7.49"];
  if (dp >= 7.91 && dp <= 7.92) return [false, "7.91 <= DP <= 7.92"];
  if (dp >= 8.09 && dp <= 8.29) return [false, "8.09 <= DP <= 8.29"];
  if (dp >= 8.41 && dp <= 8.44) return [false, "8.41 <= DP <= 8.44"];
  if (dp >= 8.50 && dp <= 8.66) return [false, "8.50 <= DP <= 8.66"];
  if (soma <= 155) return [false, "Soma Total <= 155"];
  if (soma >= 157 && soma <= 159) return [false, "157 <= Soma Total <= 159"];
  if (soma >= 210 && soma <= 214) return [false, "210 <= Soma Total <= 214"];
  if (m.s5menores >= 27 && m.s5menores <= 35) return [false, "27 <= S5Menores <= 35"];
  if (m.s5meio >= 43 && m.s5meio <= 44) return [false, "43 <= S5Meio <= 44"];
  if (m.s5meio === 72) return [false, "Soma 5 do Meio == 72"];
  if (m.l1 === 2) return [false, "L1 == 2"];
  if (m.c3 === 0) return [false, "C3 == 0"];
  if (m.pares_consec <= 6) return [false, "Qtd Pares Consecutivos <= 6"];
  if (m.maior_seq >= 10) return [false, "Maior Sequência >= 10"];
  if (m.qtd_pares === 10) return [false, "Qtd Pares == 10"];
  return [true, "Aprovado"];
}

// =============================================================================
// 1. FRAME LEFT SHIFT (FLS)
// =============================================================================
function gerarFrameLeftShift(ultimo: number[]): GameResult {
  const mioloNoResultado = MIOLO_TOTAL.filter(d => ultimo.includes(d));
  let mioloSelecionado: number[];
  if (mioloNoResultado.length < 2) {
    const sobras = MIOLO_TOTAL.filter(d => !mioloNoResultado.includes(d));
    mioloSelecionado = [...mioloNoResultado, ...sobras].slice(0, 2);
  } else {
    mioloSelecionado = mioloNoResultado.slice(0, 2);
  }

  const base18 = [...MOLDURA_ARR, ...mioloSelecionado].sort((a, b) => a - b);
  const baseDeslocada = [...base18.slice(1), base18[0]];
  const grupo2Excluir = baseDeslocada.slice(3, 6);
  const jogo = baseDeslocada.filter(d => !grupo2Excluir.includes(d)).sort((a, b) => a - b);

  const soma = jogo.reduce((a, b) => a + b, 0);
  const repetidas = jogo.filter(x => ultimo.includes(x)).length;
  const dp = pstdev(jogo);

  let motivo = "";
  if (soma > 217) motivo = `Soma elevada (${soma})`;
  else if (repetidas < 7) motivo = `Poucas repetidas (${repetidas})`;
  else if (repetidas > 12) motivo = `Muitas repetidas (${repetidas})`;
  else if (dp < 8.17) motivo = `Desvio padrão baixo (${dp.toFixed(2)})`;

  return { numbers: jogo, attrs: calcAttrs(jogo), aprovado: motivo === "", motivo: motivo || "Aprovado", tag: "FLS" };
}

// =============================================================================
// 2. LAST HITS (LH)
// =============================================================================
function gerarLastHits(ultimo: number[]): GameResult {
  const dezenasFora = Array.from({ length: 25 }, (_, i) => i + 1).filter(n => !ultimo.includes(n));
  const base18 = [...ultimo, ...dezenasFora.slice(0, 3)].sort((a, b) => a - b);
  const grupoExcluir = base18.slice(6, 9);
  const jogo = base18.filter(n => !grupoExcluir.includes(n)).sort((a, b) => a - b);

  const gaps: number[] = [];
  for (let i = 0; i < jogo.length - 1; i++) gaps.push(jogo[i + 1] - jogo[i]);
  const gapMax = gaps.length > 0 ? Math.max(...gaps) : 0;
  const sd = somaDigitos(jogo);
  const dp = pstdev(jogo);
  const qtdMoldura = jogo.filter(n => MOLDURA.has(n)).length;
  const linhas = [
    jogo.filter(n => n >= 1 && n <= 5),
    jogo.filter(n => n >= 6 && n <= 10),
    jogo.filter(n => n >= 11 && n <= 15),
    jogo.filter(n => n >= 16 && n <= 20),
    jogo.filter(n => n >= 21 && n <= 25),
  ];
  const temLinhaVazia = linhas.some(l => l.length === 0);
  const mSeq = maxSequencia(jogo);
  const repetidas = jogo.filter(x => ultimo.includes(x)).length;

  let motivo = "";
  if (gapMax > 8) motivo = `Gap Max > 8 (${gapMax})`;
  else if (sd < 58 || sd > 77) motivo = `Soma Dígitos fora (${sd})`;
  else if (dp < 7.10 || dp > 8.61) motivo = `Desvio Padrão fora (${dp.toFixed(2)})`;
  else if (qtdMoldura < 10) motivo = `Moldura < 10 (${qtdMoldura})`;
  else if (temLinhaVazia) motivo = "Possui linha vazia";
  else if (mSeq < 5) motivo = `Máxima Sequência < 5 (${mSeq})`;
  else if (repetidas > 14) motivo = `Repetidas > 14 (${repetidas})`;

  return { numbers: jogo, attrs: calcAttrs(jogo), aprovado: motivo === "", motivo: motivo || "Aprovado", tag: "LH" };
}

// =============================================================================
// BASES G2 / G3
// =============================================================================
function gerarFechamento18x6(base18: number[]): number[][] {
  const base = [...base18].sort((a, b) => a - b);
  const grupos: number[][] = [];
  for (let i = 0; i < 18; i += 3) grupos.push(base.slice(i, i + 3));
  const jogos: number[][] = [];
  for (let i = 0; i < 6; i++) {
    jogos.push(base.filter(d => !grupos[i].includes(d)).sort((a, b) => a - b));
  }
  return jogos;
}

function buildG2G3(ultimo: number[]): { jogo2: number[]; jogo3: number[]; naoSorteadas: number[] } {
  const allNums = Array.from({ length: 25 }, (_, i) => i + 1);
  const naoSorteadas = allNums.filter(x => !ultimo.includes(x)).sort((a, b) => a - b);

  const fixasSG3 = [ultimo[0], ultimo[5], ultimo[12]];
  const fixasNG3 = [naoSorteadas[2], naoSorteadas[8]];
  const remAG3 = ultimo.filter(x => !fixasSG3.includes(x));
  const remBG3 = naoSorteadas.filter(x => !fixasNG3.includes(x));
  const jogo3 = [...new Set([...fixasSG3, ...remAG3.slice(6), ...fixasNG3, ...remBG3.slice(0, 4)])]
    .filter(x => x !== undefined)
    .sort((a, b) => a - b);

  const fSG2 = TOP_5.filter(x => ultimo.includes(x)).slice(0, 3);
  const fNG2 = TOP_5.filter(x => naoSorteadas.includes(x)).slice(0, 2);
  if (fSG2.length < 3) {
    for (const p of [ultimo[0], ultimo[5]]) {
      if (!fSG2.includes(p) && fSG2.length < 3) fSG2.push(p);
    }
  }
  const remAG2 = ultimo.filter(x => !fSG2.includes(x));
  const remBG2 = naoSorteadas.filter(x => !fNG2.includes(x));
  let jogo2 = [...new Set([...fSG2, ...remAG2.slice(0, 6), ...fNG2, ...remBG2.slice(4)])]
    .filter(x => x !== undefined)
    .sort((a, b) => a - b);
  jogo2 = calibrarJogo(jogo2, remBG2.slice(4), remAG2.slice(6));

  return { jogo2, jogo3, naoSorteadas };
}

// =============================================================================
// 3. NEW G3 PLUS 3G2 (J04)
// =============================================================================
function gerarNewG3Plus3G2(ultimo: number[]): GameResult {
  const allNums = Array.from({ length: 25 }, (_, i) => i + 1);
  const { jogo2, jogo3 } = buildG2G3(ultimo);

  const set2 = new Set(jogo2);
  const set3 = new Set(jogo3);
  const intersecao = [...set2].filter(x => set3.has(x)).sort((a, b) => a - b);
  const exclG2 = [...set2].filter(x => !set3.has(x)).sort((a, b) => a - b);
  const exclG3 = [...set3].filter(x => !set2.has(x)).sort((a, b) => a - b);

  const m = Math.floor(exclG2.length / 2);
  const selecaoG2 = exclG2.length >= 3 ? exclG2.slice(m - 1, m + 2) : [...exclG2];
  let baseElite = [...new Set([...intersecao, ...exclG3, ...selecaoG2])].sort((a, b) => a - b);

  if (baseElite.length < 18) {
    const sobras = [...exclG2, ...allNums].filter(d => !baseElite.includes(d));
    baseElite = [...baseElite, ...sobras.slice(0, 18 - baseElite.length)].sort((a, b) => a - b);
  } else {
    baseElite = baseElite.slice(0, 18);
  }

  const jogo = gerarFechamento18x6(baseElite)[3];
  const reject = (motivo: string): GameResult => ({ numbers: jogo, attrs: calcAttrs(jogo), aprovado: false, motivo, tag: "J04" });

  const [lDict, cDict] = analisarVolante(jogo);
  for (let i = 1; i <= 5; i++) {
    if (lDict.get(i)!.length === 0) return reject(`Linha ${i} vazia`);
    if (cDict.get(i)!.length === 0) return reject(`Coluna ${i} vazia`);
  }

  const qtdPrimos = jogo.filter(x => PRIMOS.has(x)).length;
  if (qtdPrimos > 7 || qtdPrimos < 4) return reject(`Primos fora da margem (${qtdPrimos})`);

  const soma = jogo.reduce((a, b) => a + b, 0);
  if (soma < 182 || soma > 205) return reject(`Soma fora (${soma})`);

  const qtdImpares = jogo.filter(x => x % 2 !== 0).length;
  if (qtdImpares > 10) return reject(`Ímpares > 10 (${qtdImpares})`);

  const dp = pstdev(jogo);
  if (dp > 8.36) return reject(`Desvio Padrão > 8.36 (${dp.toFixed(2)})`);

  const qtdFibo = jogo.filter(x => FIBONACCI.has(x)).length;
  if (qtdFibo < 3) return reject(`Fibonacci < 3 (${qtdFibo})`);

  const sd = somaDigitos(jogo);
  if (sd > 80) return reject(`Soma Dígitos > 80 (${sd})`);

  return { numbers: jogo, attrs: calcAttrs(jogo), aprovado: true, motivo: "Aprovado", tag: "J04" };
}

// =============================================================================
// 4. NEW G2 PLUS 3G3 (J01)
// =============================================================================
function gerarNewG2Plus3G3(ultimo: number[]): GameResult {
  const allNums = Array.from({ length: 25 }, (_, i) => i + 1);
  const { jogo2, jogo3 } = buildG2G3(ultimo);

  const set2 = new Set(jogo2);
  const set3 = new Set(jogo3);
  const intersecao = [...set2].filter(x => set3.has(x)).sort((a, b) => a - b);
  const exclG2 = [...set2].filter(x => !set3.has(x)).sort((a, b) => a - b);
  const exclG3 = [...set3].filter(x => !set2.has(x)).sort((a, b) => a - b);

  const m = Math.floor(exclG3.length / 2);
  const selecaoG3 = exclG3.length >= 3 ? exclG3.slice(m - 1, m + 2) : [...exclG3];
  let baseElite = [...new Set([...intersecao, ...exclG2, ...selecaoG3])].sort((a, b) => a - b);

  if (baseElite.length < 18) {
    const sobras = [...exclG3, ...allNums].filter(d => !baseElite.includes(d));
    baseElite = [...baseElite, ...sobras.slice(0, 18 - baseElite.length)].sort((a, b) => a - b);
  } else {
    baseElite = baseElite.slice(0, 18);
  }

  const grupos: number[][] = [];
  for (let i = 0; i < 18; i += 3) grupos.push(baseElite.slice(i, i + 3));
  const jogo = baseElite.filter(d => !grupos[0].includes(d)).sort((a, b) => a - b);
  const reject = (motivo: string): GameResult => ({ numbers: jogo, attrs: calcAttrs(jogo), aprovado: false, motivo, tag: "J01" });

  if (contarParesConsecutivos(jogo) > 12) return reject("Mais de 12 pares consecutivos");

  const dp = pstdev(jogo);
  if (dp < 4.88) return reject(`Desvio padrão baixo (${dp.toFixed(2)})`);

  const qtdFib = jogo.filter(x => FIBONACCI.has(x)).length;
  if (qtdFib < 1 || qtdFib > 3) return reject(`Fibonacci fora (${qtdFib})`);

  const qtdPrimos = jogo.filter(x => PRIMOS.has(x)).length;
  if (qtdPrimos < 3) return reject(`Poucos primos (${qtdPrimos})`);

  const qtdQuad = jogo.filter(x => QUADRADOS_PERFEITOS.has(x)).length;
  if (qtdQuad < 2) return reject(`Poucos quadrados (${qtdQuad})`);

  const qtdMoldura = jogo.filter(x => MOLDURA.has(x)).length;
  if (qtdMoldura > 11) return reject(`Excesso moldura (${qtdMoldura})`);

  const repetidas = jogo.filter(x => ultimo.includes(x)).length;
  if (repetidas < 8 || repetidas > 11) return reject(`Repetidas fora (${repetidas})`);

  const soma = jogo.reduce((a, b) => a + b, 0);
  if (soma < 209) return reject(`Soma baixa (${soma})`);

  const soma5Maiores = jogo.slice(-5).reduce((a, b) => a + b, 0);
  if (soma5Maiores > 114) return reject(`Soma 5 maiores alta (${soma5Maiores})`);

  const imparesAlta = jogo.filter(x => x >= 14 && x % 2 !== 0).length;
  if (imparesAlta < 3 || imparesAlta > 5) return reject(`Ímpares alta fora (${imparesAlta})`);

  return { numbers: jogo, attrs: calcAttrs(jogo), aprovado: true, motivo: "Aprovado", tag: "J01" };
}

// =============================================================================
// NOVAS ESTRATÉGIAS DE RECOMBINAÇÃO
// =============================================================================
function gerarEstrategiaRmse(jogosGerados: Record<string, number[]>, corrigirTrajetoria: boolean): number[] {
  const novoJogo: number[] = [];
  for (let i = 0; i < 15; i++) {
    let adicionado = false;
    for (const op of PRIORIDADE_RMSE[i]) {
      let dezena = jogosGerados[op.strat][i];
      if (dezena === undefined) continue;
      if (corrigirTrajetoria) {
        dezena = Math.round(dezena - op.bias);
        dezena = Math.max(1, Math.min(25, dezena));
      }
      if (!novoJogo.includes(dezena)) {
        novoJogo.push(dezena);
        adicionado = true;
        break;
      }
    }
    if (!adicionado) {
      for (let d = 1; d <= 25; d++) {
        if (!novoJogo.includes(d)) { novoJogo.push(d); break; }
      }
    }
  }
  return novoJogo.sort((a, b) => a - b);
}

function gerarSuperEstrategia(dictJogos: Record<string, number[]>): number[] {
  const votos = new Map<number, number>();
  const matrizPosicional = new Map<number, { strat: string; pos: number }[]>();
  for (let n = 1; n <= 25; n++) { votos.set(n, 0); matrizPosicional.set(n, []); }

  for (const [strat, jogo] of Object.entries(dictJogos)) {
    jogo.forEach((num, i) => {
      votos.set(num, (votos.get(num) || 0) + 1);
      matrizPosicional.get(num)!.push({ strat, pos: i });
    });
  }

  const unanimidade = [...votos.entries()].filter(([, v]) => v >= 3).map(([n]) => n);
  const omissas = [...votos.entries()].filter(([, v]) => v === 0).map(([n]) => n);
  let base = [...new Set([...unanimidade, ...omissas])].sort((a, b) => a - b);

  if (base.length > 15) {
    const scores = base.map(d => {
      const ocorrencias = matrizPosicional.get(d) || [];
      let peso = 0;
      if (ocorrencias.length === 0) peso = -100;
      else {
        for (const oc of ocorrencias) {
          const rankIdx = PRIORIDADE_RMSE[oc.pos].findIndex(v => v.strat === oc.strat);
          peso += rankIdx;
        }
      }
      return { num: d, peso };
    });
    scores.sort((a, b) => a.peso - b.peso);
    base = scores.slice(0, 15).map(s => s.num).sort((a, b) => a - b);
  } else if (base.length < 15) {
    const jogoRmsePuro: number[] = [];
    for (let i = 0; i < 15; i++) {
      for (const op of PRIORIDADE_RMSE[i]) {
        const dezena = dictJogos[op.strat][i];
        if (dezena !== undefined && !base.includes(dezena) && !jogoRmsePuro.includes(dezena)) {
          jogoRmsePuro.push(dezena);
          break;
        }
      }
    }
    for (const d of jogoRmsePuro) {
      if (!base.includes(d)) {
        base.push(d);
        if (base.length === 15) break;
      }
    }
  }

  return base.sort((a, b) => a - b);
}

// =============================================================================
// EXECUTOR PRINCIPAL
// =============================================================================
export function runSniperAlgorithm(
  ultimo: number[],
  historicalResults?: number[][],
  historicoAnterior?: Record<string, EssentialMetrics>,
): SniperResult {
  const sorted = [...ultimo].sort((a, b) => a - b);
  const allNums = Array.from({ length: 25 }, (_, i) => i + 1);
  const naoSorteadas = allNums.filter(x => !sorted.includes(x)).sort((a, b) => a - b);

  // 1. Geração bruta (estratégias clássicas)
  const jogoJ04 = gerarNewG3Plus3G2(sorted);
  const jogoLH = gerarLastHits(sorted);
  const jogoJ01 = gerarNewG2Plus3G3(sorted);
  const jogoFLS = gerarFrameLeftShift(sorted);

  const jogosBrutos: Record<string, number[]> = {
    J04: jogoJ04.numbers,
    LH: jogoLH.numbers,
    J01: jogoJ01.numbers,
    FLS: jogoFLS.numbers,
  };

  // 2. Estratégias de recombinação
  const numsRmse = gerarEstrategiaRmse(jogosBrutos, false);
  const numsCrmsePlus = gerarEstrategiaRmse(jogosBrutos, true);
  const numsMission = gerarSuperEstrategia(jogosBrutos);

  const metricasRmse = calcularMetricasEssenciais(numsRmse, sorted);
  const [aprovRmse, motRmse] = validarRegrasRmse(metricasRmse);
  const jogoRmse: GameResult = { numbers: numsRmse, attrs: calcAttrs(numsRmse), aprovado: aprovRmse, motivo: motRmse, tag: "RMSE", metricas: metricasRmse };

  const metricasCrmse = calcularMetricasEssenciais(numsCrmsePlus, sorted);
  const [aprovCrmse, motCrmse] = validarRegrasCrmsePlus(metricasCrmse);
  const jogoCrmse: GameResult = { numbers: numsCrmsePlus, attrs: calcAttrs(numsCrmsePlus), aprovado: aprovCrmse, motivo: motCrmse, tag: "CRMSE_PLUS", metricas: metricasCrmse };

  const metricasMission = calcularMetricasEssenciais(numsMission, sorted);
  const [aprovMission, motMission] = validarRegrasMission(metricasMission);
  const jogoMission: GameResult = { numbers: numsMission, attrs: calcAttrs(numsMission), aprovado: aprovMission, motivo: motMission, tag: "MISSION", metricas: metricasMission };

  for (const j of [jogoJ04, jogoLH, jogoJ01, jogoFLS]) {
    j.metricas = calcularMetricasEssenciais(j.numbers, sorted);
  }

  const games: GameResult[] = [jogoJ04, jogoLH, jogoJ01, jogoFLS, jogoRmse, jogoCrmse, jogoMission];

  // 3. Filtro global: duplicatas históricas
  if (historicalResults && historicalResults.length > 0) {
    for (const game of games) {
      if (!game.aprovado) continue;
      const key = [...game.numbers].sort((a, b) => a - b).join(",");
      for (const hist of historicalResults) {
        if ([...hist].sort((a, b) => a - b).join(",") === key) {
          game.aprovado = false;
          game.motivo = "Jogo idêntico a resultado passado (duplicata histórica)";
          break;
        }
      }
    }
  }

  // 4. Filtro global: motor relacional (Intra & Inter)
  const lista = games.map(g => g.metricas!);
  const media = (sel: (m: EssentialMetrics) => number) => lista.reduce((s, m) => s + sel(m), 0) / lista.length;
  const meanImpares = media(m => m.qtd_impares);
  const meanS5maiores = media(m => m.s5maiores);
  const meanParesCons = media(m => m.pares_consec);
  const meanGapMax = media(m => m.gap_maximo);
  const meanS5menores = media(m => m.s5menores);

  for (const j of games) {
    if (!j.aprovado) continue;
    const m = j.metricas!;

    if (meanImpares > 0 && m.qtd_impares / meanImpares <= 0.79) {
      j.aprovado = false; j.motivo = "Intra: Qtd Ímpares <= 0.79 da Média"; continue;
    }
    if (meanS5maiores > 0 && m.s5maiores / meanS5maiores <= 0.91) {
      j.aprovado = false; j.motivo = "Intra: S5Maiores <= 0.91 da Média"; continue;
    }
    if (m.pares_consec - meanParesCons >= 2.71) {
      j.aprovado = false; j.motivo = "Intra: Pares Consecutivos >= 2.71 sobre a Média"; continue;
    }
    if (m.gap_maximo - meanGapMax >= 3.14) {
      j.aprovado = false; j.motivo = "Intra: Gap Máximo >= 3.14 sobre a Média"; continue;
    }
    if (m.s5menores - meanS5menores >= 28.14) {
      j.aprovado = false; j.motivo = "Intra: S5Menores >= 28.14 sobre a Média"; continue;
    }

    const prev = historicoAnterior?.[j.tag];
    if (prev) {
      if (m.maior_seq - prev.maior_seq >= 6) {
        j.aprovado = false; j.motivo = "Inter: Maior Sequência saltou >= 6"; continue;
      }
      if (m.amplitude - prev.amplitude <= -4) {
        j.aprovado = false; j.motivo = "Inter: Amplitude encolheu <= -4"; continue;
      }
    }
  }

  // 5. Limitador de saída: no máximo 4 jogos, por ordem de efetividade
  const aprovados = games
    .filter(g => g.aprovado)
    .sort((a, b) => (ORDEM_PRIORIDADE[a.tag] ?? 99) - (ORDEM_PRIORIDADE[b.tag] ?? 99));
  for (const extra of aprovados.slice(4)) {
    extra.aprovado = false;
    extra.motivo = "Limitador de saída: máximo de 4 jogos por concurso";
  }

  // Ordena a saída pela efetividade das estratégias
  games.sort((a, b) => (ORDEM_PRIORIDADE[a.tag] ?? 99) - (ORDEM_PRIORIDADE[b.tag] ?? 99));

  return { games, naoSorteadas };
}
