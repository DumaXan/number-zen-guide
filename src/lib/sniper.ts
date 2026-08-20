// =============================================================================
// MOTOR DE GERAÇÃO DE JOGOS — SNIPER LOTOFÁCIL
// Port fiel do motor Python (simulação inteligente com filtros e resgate RMSE)
// =============================================================================

const MOLDURA_ARR = [1, 2, 3, 4, 5, 6, 10, 11, 15, 16, 20, 21, 22, 23, 24, 25];
const MIOLO_TOTAL = [7, 8, 9, 12, 13, 14, 17, 18, 19];
const TOP_5 = [20, 10, 25, 11, 13];

const MOLDURA = new Set(MOLDURA_ARR);
const PRIMOS = new Set([2, 3, 5, 7, 11, 13, 17, 19, 23]);
const FIBONACCI = new Set([1, 2, 3, 5, 8, 13, 21]);
const QUADRADOS_PERFEITOS = new Set([1, 4, 9, 16, 25]);
const TRIANGULARES = new Set([1, 3, 6, 10, 15, 21]);
const MULTIPLOS_3 = new Set([3, 6, 9, 12, 15, 18, 21, 24]);
const MULTIPLOS_5 = new Set([5, 10, 15, 20, 25]);
const CANTOS = new Set([1, 5, 21, 25]);
const EXTREMOS = new Set([1, 2, 24, 25]);

// =============================================================================
// MATRIZES DE VIÉS POSICIONAL E PRIORIDADE RMSE
// =============================================================================
const VIES_POSICIONAL_FLS: Record<number, number> = { 0: -0.5772, 1: -1.2228, 2: -1.8081, 3: -2.4797, 4: 0.9756, 5: 0.7154, 6: 0.2699, 7: 2.0504, 8: 1.387, 9: 3.7203, 10: 3.065, 11: 2.4407, 12: 1.8179, 13: 1.2098, 14: 0.5659 };
const VIES_POSICIONAL_J01: Record<number, number> = { 0: 4.56, 1: 4.27, 2: 4.02, 3: 3.64, 4: 3.1, 5: 2.8, 6: 2.45, 7: 1.93, 8: 1.39, 9: 0.98, 10: 0.6, 11: 0.23, 12: -0.13, 13: 0.03, 14: 0.57 };
const VIES_POSICIONAL_J04: Record<number, number> = { 0: -0.58, 1: -0.54, 2: -0.21, 3: -0.15, 4: -0.2, 5: -0.42, 6: -0.72, 7: -1.34, 8: -1.92, 9: 1.83, 10: 1.48, 11: 1.14, 12: 0.82, 13: 0.5, 14: 0.2 };
const VIES_POSICIONAL_LH: Record<number, number> = { 0: -0.58, 1: -1.22, 2: -1.81, 3: -2.44, 4: -3.0, 5: -3.51, 6: 0.25, 7: 0.14, 8: 0.06, 9: 0.02, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0 };

type BaseStrat = "FLS" | "J01" | "J04" | "LH";

const PRIORIDADE_RMSE: Record<number, { strat: BaseStrat; bias: number }[]> = {
  0: [{ strat: "FLS", bias: -0.5772 }, { strat: "J04", bias: -0.5772 }, { strat: "LH", bias: -0.5772 }, { strat: "J01", bias: 4.5593 }],
  1: [{ strat: "J04", bias: -0.535 }, { strat: "FLS", bias: -1.2228 }, { strat: "LH", bias: -1.2228 }, { strat: "J01", bias: 4.2748 }],
  2: [{ strat: "J04", bias: -0.213 }, { strat: "FLS", bias: -1.8081 }, { strat: "LH", bias: -1.8081 }, { strat: "J01", bias: 4.0179 }],
  3: [{ strat: "J04", bias: -0.1496 }, { strat: "LH", bias: -2.4407 }, { strat: "FLS", bias: -2.4797 }, { strat: "J01", bias: 3.6439 }],
  4: [{ strat: "J04", bias: -0.2033 }, { strat: "FLS", bias: 0.9756 }, { strat: "LH", bias: -2.9951 }, { strat: "J01", bias: 3.1008 }],
  5: [{ strat: "J04", bias: -0.4179 }, { strat: "FLS", bias: 0.7154 }, { strat: "J01", bias: 2.7984 }, { strat: "LH", bias: -3.5089 }],
  6: [{ strat: "J04", bias: -0.7236 }, { strat: "FLS", bias: 0.2699 }, { strat: "LH", bias: 0.2455 }, { strat: "J01", bias: 2.452 }],
  7: [{ strat: "J04", bias: -1.3431 }, { strat: "LH", bias: 0.1366 }, { strat: "J01", bias: 1.9317 }, { strat: "FLS", bias: 2.0504 }],
  8: [{ strat: "FLS", bias: 1.387 }, { strat: "J01", bias: 1.3886 }, { strat: "LH", bias: 0.0553 }, { strat: "J04", bias: -1.9171 }],
  9: [{ strat: "J01", bias: 0.9756 }, { strat: "LH", bias: 0.0211 }, { strat: "J04", bias: 1.8293 }, { strat: "FLS", bias: 3.7203 }],
  10: [{ strat: "J01", bias: 0.5984 }, { strat: "J04", bias: 1.4764 }, { strat: "LH", bias: 0.0049 }, { strat: "FLS", bias: 3.065 }],
  11: [{ strat: "J01", bias: 0.2341 }, { strat: "J04", bias: 1.1431 }, { strat: "LH", bias: -0.0016 }, { strat: "FLS", bias: 2.4407 }],
  12: [{ strat: "J01", bias: -0.1252 }, { strat: "J04", bias: 0.8195 }, { strat: "LH", bias: -0.0033 }, { strat: "FLS", bias: 1.8179 }],
  13: [{ strat: "J04", bias: 0.5041 }, { strat: "J01", bias: 0.0293 }, { strat: "FLS", bias: 1.2098 }, { strat: "LH", bias: 0.0016 }],
  14: [{ strat: "J04", bias: 0.2033 }, { strat: "FLS", bias: 0.5659 }, { strat: "J01", bias: 0.5659 }, { strat: "LH", bias: 0 }],
};

// =============================================================================
// TIPOS PÚBLICOS
// =============================================================================
export interface GameAttributes {
  soma: number;
  pares: number;
}

export type EssentialMetrics = Record<string, number>;

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

// =============================================================================
// EXTRATOR DE MÉTRICAS
// =============================================================================
function getLineCol(num: number): [number, number] {
  return [Math.floor((num - 1) / 5) + 1, ((num - 1) % 5) + 1];
}

function pstdev(arr: number[]): number {
  if (arr.length <= 1) return 0;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const variance = arr.reduce((s, x) => s + (x - mean) ** 2, 0) / arr.length;
  return Math.sqrt(variance);
}

function round2(v: number): number {
  return Math.round((v + Number.EPSILON) * 100) / 100;
}

function calcularMetricasCompletas(jogoIn: number[], ultimoSorteio: number[] = []): EssentialMetrics {
  const jogo = [...jogoIn].sort((a, b) => a - b);
  const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);

  const somaTotal = sum(jogo);
  const s5menores = sum(jogo.slice(0, 5));
  const s5meio = sum(jogo.slice(5, 10));
  const s5maiores = sum(jogo.slice(-5));

  const dp = round2(pstdev(jogo));
  const somaDigitos = jogo.reduce((s, n) => s + String(n).split("").reduce((a, d) => a + parseInt(d, 10), 0), 0);

  const linhas: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const colunas: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const d of jogo) {
    const [l, c] = getLineCol(d);
    linhas[l]++;
    colunas[c]++;
  }

  const count = (pred: (x: number) => boolean) => jogo.filter(pred).length;
  const pares = count((x) => x % 2 === 0);
  const mold = count((x) => MOLDURA.has(x));
  const rep = count((x) => ultimoSorteio.includes(x));

  let paresCons = 0;
  for (let i = 1; i < jogo.length; i++) if (jogo[i] === jogo[i - 1] + 1) paresCons++;

  let maxSeq = 1;
  let atual = 1;
  for (let i = 1; i < jogo.length; i++) {
    if (jogo[i] === jogo[i - 1] + 1) atual++;
    else {
      maxSeq = Math.max(maxSeq, atual);
      atual = 1;
    }
  }
  maxSeq = jogo.length ? Math.max(maxSeq, atual) : 0;

  const gaps: number[] = [];
  for (let i = 0; i < jogo.length - 1; i++) gaps.push(jogo[i + 1] - jogo[i]);

  const m: EssentialMetrics = {
    "Qtd Pares": pares,
    "Qtd Ímpares": 15 - pares,
    "Qtd Fibonacci": count((x) => FIBONACCI.has(x)),
    "Qtd Primos": count((x) => PRIMOS.has(x)),
    "Qtd Moldura": mold,
    "Qtd Miolo": 15 - mold,
    "Qtd Quadrados Perfeitos": count((x) => QUADRADOS_PERFEITOS.has(x)),
    "Qtd Triangulares": count((x) => TRIANGULARES.has(x)),
    "Qtd Múltiplos de 3": count((x) => MULTIPLOS_3.has(x)),
    "Qtd Múltiplos de 5": count((x) => MULTIPLOS_5.has(x)),
    "Soma Total": somaTotal,
    "Soma das 5 Menores": s5menores,
    "Soma das 5 do Meio": s5meio,
    "Soma das 5 Maiores": s5maiores,
    "Amplitude (Maior - Menor)": jogo.length ? jogo[jogo.length - 1] - jogo[0] : 0,
    "Desvio Padrão": dp,
    "Maior Sequência": maxSeq,
    "Qtd Pares Consecutivos": paresCons,
    "Gap Máximo": gaps.length ? Math.max(...gaps) : 0,
    "Gap Médio": gaps.length ? round2(sum(gaps) / gaps.length) : 0,
    "Faixa Baixa (1-8)": count((x) => x >= 1 && x <= 8),
    "Faixa Média (9-17)": count((x) => x >= 9 && x <= 17),
    "Faixa Alta (18-25)": count((x) => x >= 18 && x <= 25),
    L1: linhas[1], L2: linhas[2], L3: linhas[3], L4: linhas[4], L5: linhas[5],
    C1: colunas[1], C2: colunas[2], C3: colunas[3], C4: colunas[4], C5: colunas[5],
    "Cantos {1, 5, 21, 25}": count((x) => CANTOS.has(x)),
    "Extremos {1, 2, 24, 25}": count((x) => EXTREMOS.has(x)),
    "Ímpares (1-13)": count((x) => x <= 13 && x % 2 !== 0),
    "Ímpares (14-25)": count((x) => x >= 14 && x % 2 !== 0),
    "Soma de Todos os Dígitos": somaDigitos,
    "Dezenas iniciadas com 1 (10-19)": count((x) => x >= 10 && x <= 19),
    "Dezenas iniciadas com 2 (20-25)": count((x) => x >= 20 && x <= 25),
    "Repetidas do Último Sorteio": rep,
  };

  for (let i = 3; i <= 15; i++) {
    const p = String(i).padStart(2, "0");
    m[`Resto Divisão Soma Total por ${p}`] = somaTotal % i;
    m[`Resto Divisão Soma 5 Maiores por ${p}`] = s5maiores % i;
  }

  return m;
}

// =============================================================================
// FUNÇÕES GEOMÉTRICAS E CONSTRUTORES BASE
// =============================================================================
function analisarVolante(jogo: number[]) {
  const linhas: Record<number, number[]> = { 1: [], 2: [], 3: [], 4: [], 5: [] };
  const colunas: Record<number, number[]> = { 1: [], 2: [], 3: [], 4: [], 5: [] };
  for (const d of jogo) {
    const [l, c] = getLineCol(d);
    linhas[l].push(d);
    colunas[c].push(d);
  }
  return { linhas, colunas };
}

function calibrarJogo(jogo: number[], grupoN: number[], grupoSReserva: number[]): number[] {
  const result = [...jogo];
  let { linhas, colunas } = analisarVolante(result);
  const pares: [Record<number, number[]>, "L" | "C"][] = [[linhas, "L"], [colunas, "C"]];
  for (const [dictGeoInit, tipo] of pares) {
    let dictGeo = dictGeoInit;
    const vazios = [1, 2, 3, 4, 5].filter((k) => dictGeo[k].length === 0);
    if (vazios.length && grupoSReserva.length) {
      let cheioId = 1;
      for (const k of [1, 2, 3, 4, 5]) if (dictGeo[k].length > dictGeo[cheioId].length) cheioId = k;
      const candidatosRem = (dictGeo[cheioId] || []).filter((d) => grupoN.includes(d));
      if (candidatosRem.length) {
        const dezRem = candidatosRem[0];
        const target = vazios[0];
        const candidatosAdd = grupoSReserva.filter((d) => (tipo === "L" ? getLineCol(d)[0] : getLineCol(d)[1]) === target);
        if (candidatosAdd.length) {
          result.splice(result.indexOf(dezRem), 1);
          result.push(candidatosAdd[0]);
          result.sort((a, b) => a - b);
          const re = analisarVolante(result);
          linhas = re.linhas;
          colunas = re.colunas;
          dictGeo = tipo === "L" ? linhas : colunas;
        }
      }
    }
  }
  return result;
}

function gerarFechamento18x6(base18: number[]): number[][] {
  const base = [...base18].sort((a, b) => a - b);
  const grupos: number[][] = [];
  for (let i = 0; i < 18; i += 3) grupos.push(base.slice(i, i + 3));
  return grupos.map((g) => base.filter((d) => !g.includes(d)).sort((a, b) => a - b));
}

function buildG2G3(ultimo: number[]) {
  const allNums = Array.from({ length: 25 }, (_, i) => i + 1);
  const naoSorteadas = allNums.filter((x) => !ultimo.includes(x)).sort((a, b) => a - b);

  const fixasSg3 = [ultimo[0], ultimo[5], ultimo[12]];
  const fixasNg3 = [naoSorteadas[2], naoSorteadas[8]].filter((x) => x !== undefined);
  const remAg3 = ultimo.filter((x) => !fixasSg3.includes(x));
  const remBg3 = naoSorteadas.filter((x) => !fixasNg3.includes(x));
  const jogo3 = Array.from(new Set([...fixasSg3, ...remAg3.slice(6), ...fixasNg3, ...remBg3.slice(0, 4)])).sort((a, b) => a - b);

  const fSg2 = TOP_5.filter((x) => ultimo.includes(x)).slice(0, 3);
  const fNg2 = TOP_5.filter((x) => naoSorteadas.includes(x)).slice(0, 2);
  if (fSg2.length < 3) {
    for (const p of [ultimo[0], ultimo[5]]) {
      if (!fSg2.includes(p) && fSg2.length < 3) fSg2.push(p);
    }
  }

  const remAg2 = ultimo.filter((x) => !fSg2.includes(x));
  const remBg2 = naoSorteadas.filter((x) => !fNg2.includes(x));
  let jogo2 = Array.from(new Set([...fSg2, ...remAg2.slice(0, 6), ...fNg2, ...remBg2.slice(4)])).sort((a, b) => a - b);
  jogo2 = calibrarJogo(jogo2, remBg2.slice(4), remAg2.slice(6));

  return { jogo2, jogo3, naoSorteadas };
}

// =============================================================================
// GERAÇÃO DE JOGOS ORIGINAIS E CORRIGIDOS
// =============================================================================
function gerarFrameLeftShift(ultimo: number[]): number[] {
  const mioloNoResultado = MIOLO_TOTAL.filter((d) => ultimo.includes(d));
  const mioloSelecionado =
    mioloNoResultado.length >= 2
      ? mioloNoResultado.slice(0, 2)
      : [...mioloNoResultado, ...MIOLO_TOTAL.filter((d) => !mioloNoResultado.includes(d))].slice(0, 2);
  const base18 = [...MOLDURA_ARR, ...mioloSelecionado].sort((a, b) => a - b);
  const baseDeslocada = [...base18.slice(1), base18[0]];
  const removidas = baseDeslocada.slice(3, 6);
  return baseDeslocada.filter((d) => !removidas.includes(d)).sort((a, b) => a - b);
}

function gerarLastHits(ultimo: number[]): number[] {
  const dezenasFora = Array.from({ length: 25 }, (_, i) => i + 1).filter((n) => !ultimo.includes(n));
  const base18 = [...ultimo, ...dezenasFora.slice(0, 3)].sort((a, b) => a - b);
  const removidas = base18.slice(6, 9);
  return base18.filter((n) => !removidas.includes(n)).sort((a, b) => a - b);
}

function gerarJ01(ultimo: number[]): number[] {
  const allNums = Array.from({ length: 25 }, (_, i) => i + 1);
  const { jogo2, jogo3 } = buildG2G3(ultimo);
  const intersecao = jogo2.filter((x) => jogo3.includes(x)).sort((a, b) => a - b);
  const exclG2 = jogo2.filter((x) => !jogo3.includes(x)).sort((a, b) => a - b);
  const exclG3 = jogo3.filter((x) => !jogo2.includes(x)).sort((a, b) => a - b);

  const m = Math.floor(exclG3.length / 2);
  const selecaoG3 = exclG3.length >= 3 ? exclG3.slice(m - 1, m + 2) : [...exclG3];
  let baseElite = Array.from(new Set([...intersecao, ...exclG2, ...selecaoG3])).sort((a, b) => a - b);

  if (baseElite.length < 18) {
    const sobras = [...exclG3, ...allNums].filter((d) => !baseElite.includes(d));
    baseElite = [...baseElite, ...sobras.slice(0, 18 - baseElite.length)].sort((a, b) => a - b);
  }

  const top18 = baseElite.slice(0, 18);
  const grupo0 = top18.slice(0, 3);
  return top18.filter((d) => !grupo0.includes(d)).sort((a, b) => a - b);
}

function gerarJ04(ultimo: number[]): number[] {
  const allNums = Array.from({ length: 25 }, (_, i) => i + 1);
  const { jogo2, jogo3 } = buildG2G3(ultimo);
  const intersecao = jogo2.filter((x) => jogo3.includes(x)).sort((a, b) => a - b);
  const exclG2 = jogo2.filter((x) => !jogo3.includes(x)).sort((a, b) => a - b);
  const exclG3 = jogo3.filter((x) => !jogo2.includes(x)).sort((a, b) => a - b);

  const m = Math.floor(exclG2.length / 2);
  const selecaoG2 = exclG2.length >= 3 ? exclG2.slice(m - 1, m + 2) : [...exclG2];
  let baseElite = Array.from(new Set([...intersecao, ...exclG3, ...selecaoG2])).sort((a, b) => a - b);

  if (baseElite.length < 18) {
    const sobras = [...exclG2, ...allNums].filter((d) => !baseElite.includes(d));
    baseElite = [...baseElite, ...sobras.slice(0, 18 - baseElite.length)].sort((a, b) => a - b);
  }

  return gerarFechamento18x6(baseElite.slice(0, 18))[3];
}

function pyRound(v: number): number {
  // Python round() usa banker's rounding
  const floor = Math.floor(v);
  const diff = v - floor;
  if (Math.abs(diff - 0.5) < 1e-9) return floor % 2 === 0 ? floor : floor + 1;
  return Math.round(v);
}

function aplicarCorrecao(jogoBase: number[], vies: Record<number, number>, operacao: "+" | "-"): number[] {
  const jogoCorrigido: number[] = [];
  jogoBase.forEach((dezenaBruta, i) => {
    const bias = vies[i] ?? 0;
    let dezena = pyRound(operacao === "+" ? dezenaBruta + bias : dezenaBruta - bias);
    dezena = Math.max(1, Math.min(25, dezena));
    while (jogoCorrigido.includes(dezena) && dezena < 25) dezena++;
    jogoCorrigido.push(dezena);
  });

  const unicos = Array.from(new Set(jogoCorrigido)).sort((a, b) => a - b);
  while (unicos.length < 15) {
    for (let d = 1; d <= 25; d++) {
      if (!unicos.includes(d)) {
        unicos.push(d);
        break;
      }
    }
  }
  return unicos.slice(0, 15).sort((a, b) => a - b);
}

const GERADORES: Record<string, (u: number[]) => number[]> = {
  "FLS Original": gerarFrameLeftShift,
  "FLS Corrigido": (u) => aplicarCorrecao(gerarFrameLeftShift(u), VIES_POSICIONAL_FLS, "+"),
  "J01 Original": gerarJ01,
  "J01 Corrigido": (u) => aplicarCorrecao(gerarJ01(u), VIES_POSICIONAL_J01, "-"),
  "J04 Original": gerarJ04,
  "J04 Corrigido": (u) => aplicarCorrecao(gerarJ04(u), VIES_POSICIONAL_J04, "-"),
  "LH Original": gerarLastHits,
  "LH Corrigido": (u) => aplicarCorrecao(gerarLastHits(u), VIES_POSICIONAL_LH, "-"),
};

// =============================================================================
// GATILHO DE RESGATE (RMSE CORRIGIDO)
// =============================================================================
function gerarEstrategiaRmse(dictJogos: Record<BaseStrat, number[]>, corrigirTrajetoria = true): number[] {
  const novoJogo: number[] = [];
  for (let i = 0; i < 15; i++) {
    let adicionado = false;
    for (const op of PRIORIDADE_RMSE[i]) {
      let dezena = dictJogos[op.strat][i];
      if (dezena === undefined) continue;
      if (corrigirTrajetoria) {
        dezena = pyRound(dezena - op.bias);
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
        if (!novoJogo.includes(d)) {
          novoJogo.push(d);
          break;
        }
      }
    }
  }
  return novoJogo.sort((a, b) => a - b);
}

// =============================================================================
// MOTOR DE FILTROS (ZONAS MORTAS E CRUZADAS)
// =============================================================================
interface Regra {
  key: string;
  min: number;
  max: number;
}
interface RegraCruzada extends Regra {
  strat: string;
}

const r = (key: string, min: number, max?: number): Regra => ({ key, min, max: max ?? min });
const x = (strat: string, key: string, min: number, max?: number): RegraCruzada => ({ strat, key, min, max: max ?? min });

const DP = "Desvio Padrão";
const ST = "Soma Total";
const SD = "Soma de Todos os Dígitos";
const S5MA = "Soma das 5 Maiores";
const S5ME = "Soma das 5 do Meio";
const S5MN = "Soma das 5 Menores";
const rst = (n: number) => `Resto Divisão Soma Total por ${String(n).padStart(2, "0")}`;
const rs5 = (n: number) => `Resto Divisão Soma 5 Maiores por ${String(n).padStart(2, "0")}`;

const REGRAS_ELIMINACAO: Record<string, Regra[]> = {
  "LH Original": [
    r(DP, 7.85, 7.98), r(rs5(15), 10), r(DP, 7.83, 7.95), r(DP, 6.21, 7.09),
    r(rs5(10), 6), r(rs5(13), 2), r(DP, 6.58, 7.11), r("Faixa Alta (18-25)", 7, 8),
    r(rs5(14), 8), r(S5ME, 72, 76), r(rs5(15), 1), r(DP, 8.64, 8.87),
    r(S5MA, 99, 100), r(ST, 204, 221), r(DP, 7.51, 7.58), r(DP, 7.3, 7.41),
    r(ST, 167, 168), r("Qtd Moldura", 8, 9), r(ST, 163, 165), r(SD, 81, 87),
    r(ST, 180), r(DP, 8.44, 8.5), r("Maior Sequência", 3, 4), r(S5MN, 17, 18),
    r(DP, 7.22, 7.28), r("Qtd Múltiplos de 5", 1), r(DP, 7.43, 7.46), r(DP, 8.33, 8.37),
    r("Faixa Baixa (1-8)", 5), r(DP, 8.02, 8.03), r(DP, 8.14, 8.16), r(SD, 52, 57),
    r(DP, 7.65, 7.67), r(ST, 198), r("Qtd Triangulares", 2), r(ST, 201, 202),
    r(DP, 8.4, 8.42), r(DP, 8.53, 8.56), r("Maior Sequência", 8, 9), r(DP, 8.0),
    r(DP, 8.3, 8.31),
  ],
  "LH Corrigido": [
    r(S5MA, 113, 115), r(ST, 210, 222), r(S5ME, 75, 84), r(rs5(14), 1, 2),
    r(ST, 192, 194), r(S5MA, 87, 95), r(rs5(13), 9), r(DP, 5.5, 6.24),
    r(DP, 5.98, 6.37), r(DP, 6.5, 6.68), r(SD, 66, 67), r(DP, 7.66, 7.76),
    r(DP, 7.38, 7.42), r(S5ME, 71), r(DP, 6.8, 6.88), r(SD, 83, 86),
    r(ST, 186), r("Qtd Pares Consecutivos", 10), r(DP, 7.56, 7.6), r(SD, 60, 64),
    r(DP, 6.7, 6.73), r(DP, 7.03, 7.05), r(DP, 7.15, 7.16), r(DP, 6.92, 6.94),
    r(DP, 7.07, 7.08), r(DP, 7.45, 7.46), r("Maior Sequência", 9), r(DP, 6.9),
    r(DP, 7.2), r(DP, 7.36), r("Maior Sequência", 2),
  ],
  "FLS Original": [
    r(ST, 213, 216), r(rst(6), 3, 4), r(ST, 218, 219),
    r("Repetidas do Último Sorteio", 13, 14), r(rst(5), 3),
  ],
  "FLS Corrigido": [
    r("Repetidas do Último Sorteio", 5, 6), r("Repetidas do Último Sorteio", 12, 13),
  ],
  "J01 Original": [
    r(rs5(9), 0), r(DP, 5.79, 5.94), r(rst(12), 4), r(SD, 78),
    r(DP, 5.7, 5.75), r(DP, 6.04, 6.1), r(DP, 5.39, 5.42), r(DP, 5.63, 5.66),
    r("Faixa Baixa (1-8)", 4), r(ST, 214, 216), r(S5MN, 36), r(DP, 5.59, 5.61),
    r(ST, 197, 211), r(S5MN, 38), r(DP, 4.78, 4.84), r(DP, 5.0, 5.03),
    r("Qtd Múltiplos de 3", 1, 2), r(S5MN, 47), r(DP, 4.92, 4.98), r(DP, 5.23, 5.28),
    r(DP, 6.47, 6.53), r("Qtd Pares", 5), r(DP, 5.97, 5.99), r(DP, 6.2, 6.24),
    r(ST, 234), r(DP, 5.52, 5.54), r(DP, 6.12, 6.16), r(DP, 6.57, 6.73),
    r("Faixa Alta (18-25)", 7), r(DP, 5.09), r(DP, 5.18, 5.2), r(DP, 5.31, 5.32),
    r(DP, 5.48, 5.5), r(DP, 6.26, 6.29),
  ],
  "J01 Corrigido": [
    r(DP, 7.23, 7.27), r(ST, 183, 186), r(DP, 7.47, 7.53), r(DP, 6.71, 6.76),
    r(DP, 7.07, 7.09), r(DP, 7.96, 8.27), r(DP, 6.3, 6.37), r(DP, 7.71, 7.75),
    r(DP, 6.51, 6.53), r(DP, 7.62, 7.69), r(SD, 64, 66), r("Qtd Triangulares", 1),
    r("Qtd Pares", 4, 5), r(DP, 6.88, 6.89), r(SD, 68), r(rs5(14), 2),
    r(DP, 7.3, 7.31), r(DP, 7.81, 7.87), r("Qtd Primos", 2), r("Qtd Múltiplos de 3", 2, 3),
    r(DP, 7.34, 7.36), r(SD, 85, 87), r(DP, 6.81, 6.82), r(DP, 6.91, 6.93),
    r(DP, 7.38, 7.4), r("Ímpares (1-13)", 6), r(S5MN, 19), r(DP, 7.42, 7.45),
  ],
  "J04 Original": [
    r(rs5(7), 1), r(S5MA, 104, 106), r(rs5(8), 1),
    r(rs5(9), 5), r(DP, 7.09, 7.24), r(rst(12), 8),
    r(DP, 7.28, 7.33), r(DP, 8.09, 8.14), r(DP, 7.52, 7.57), r(ST, 205, 209),
    r(DP, 7.78, 7.81), r(DP, 8.49, 8.68), r(DP, 6.64, 6.81), r(DP, 8.35, 8.47),
    r(SD, 79), r(DP, 6.84, 6.9), r("Qtd Múltiplos de 3", 7), r(DP, 6.93, 6.96),
    r(DP, 7.83, 7.84), r(DP, 7.44, 7.46), r(DP, 8.22), r("Qtd Pares", 4),
    r(DP, 7.35), r(DP, 8.16), r("C4", 0),
  ],
  "J04 Corrigido": [
    r(ST, 204, 209), r(rst(12), 11), r(SD, 83, 85), r(S5MA, 104),
    r("C4", 5), r(rst(13), 9), r(DP, 6.4, 6.55), r(rst(14), 9),
    r(SD, 80), r(rst(15), 11), r(DP, 6.71, 6.78), r(DP, 7.32, 7.36),
    r(ST, 182, 188), r(SD, 68, 69), r("Qtd Triangulares", 1), r(DP, 7.53, 7.57),
    r(DP, 6.17, 6.31), r(DP, 6.89, 6.92), r(DP, 7.71, 7.79), r(DP, 7.83, 7.92),
    r(DP, 7.07, 7.09), r(DP, 7.15, 7.18), r(DP, 7.59, 7.66), r(DP, 6.59, 6.61),
    r(DP, 7.2, 7.21), r("C2", 1, 2), r(DP, 5.77, 6.04), r(DP, 6.66, 6.69),
    r(DP, 7.46, 7.48), r("Qtd Múltiplos de 5", 1), r(DP, 7.01, 7.03), r(DP, 6.37, 6.38),
    r(DP, 6.63, 6.64), r(DP, 6.82),
  ],
  "RMSE Corrigido": [
    r("Qtd Múltiplos de 3", 2, 3), r(DP, 7.16, 7.21), r(DP, 6.49, 6.56), r(DP, 7.36, 7.39),
    r(DP, 7.51, 7.59), r(DP, 6.66, 6.68), r(DP, 6.93, 6.94), r(DP, 7.08),
    r(ST, 205), r(SD, 86, 90), r(DP, 6.72, 6.73), r(DP, 6.59, 6.61),
    r(rs5(14), 2, 3), r("Qtd Triangulares", 0, 1), r("L2", 5), r("C1", 0),
    r(SD, 68, 69), r(DP, 7.14), r("Dezenas iniciadas com 2 (20-25)", 5), r(DP, 6.44, 6.45),
    r(DP, 6.81, 6.82), r(DP, 6.97), r(DP, 7.42, 7.46), r(S5ME, 69, 70),
    r(DP, 7.02, 7.03), r(DP, 7.06), r(ST, 210, 215), r(DP, 6.7),
    r(DP, 6.9), r(DP, 7.61, 7.65),
  ],
};

const REGRAS_CRUZADAS: Record<string, RegraCruzada[]> = {
  "FLS Original": [
    x("J01 Corrigido", ST, 199, 200), x("J04 Corrigido", S5ME, 64), x("J01 Original", SD, 67, 77),
    x("LH Original", DP, 7.6, 7.75), x("LH Original", rst(12), 8), x("LH Corrigido", ST, 201, 202),
    x("LH Corrigido", DP, 6.84, 6.98), x("J01 Original", rst(12), 2), x("LH Original", ST, 188, 189),
    x("J01 Original", DP, 6.3, 6.95), x("J01 Corrigido", rst(10), 4), x("J04 Original", SD, 75, 76),
    x("LH Corrigido", DP, 7.33, 7.41), x("J01 Corrigido", rst(12), 7), x("J04 Original", S5ME, 62),
    x("J04 Corrigido", SD, 84, 86), x("LH Corrigido", DP, 6.8, 6.94), x("J04 Corrigido", S5MN, 32),
    x("J01 Original", rst(15), 5), x("J01 Corrigido", rst(15), 4),
  ],
  "FLS Corrigido": [
    x("J04 Original", rst(9), 1), x("J04 Original", S5MN, 15, 16), x("J01 Corrigido", DP, 7.07, 7.19),
    x("J04 Original", SD, 73, 74), x("LH Original", DP, 8.02, 8.1), x("J01 Original", DP, 5.8, 5.93),
    x("LH Original", DP, 7.9, 7.98), x("J04 Original", S5MA, 105, 106), x("J04 Original", rst(12), 7),
    x("LH Original", DP, 8.01, 8.09), x("J01 Corrigido", DP, 6.81, 6.91), x("J04 Original", DP, 6.82, 7.02),
    x("J04 Original", rst(11), 1), x("J01 Corrigido", DP, 6.8, 6.89), x("J01 Corrigido", DP, 7.27, 7.33),
    x("J04 Corrigido", S5MA, 101, 102), x("LH Original", SD, 72), x("LH Corrigido", DP, 5.8, 6.31),
    x("J04 Original", rst(15), 10), x("LH Original", ST, 174, 176),
  ],
  "J01 Original": [
    x("J04 Corrigido", DP, 7.22, 7.31), x("J04 Corrigido", rst(12), 10), x("LH Corrigido", rst(13), 0),
    x("LH Corrigido", DP, 6.7, 6.88), x("J01 Corrigido", rst(9), 4), x("J04 Corrigido", ST, 202, 203),
    x("LH Original", ST, 192, 195), x("LH Corrigido", ST, 205, 208), x("LH Original", SD, 75, 77),
    x("J04 Original", DP, 7.52, 7.62), x("J04 Original", DP, 7.66, 7.77), x("J04 Original", rst(12), 11),
    x("LH Original", S5MA, 102, 103), x("LH Corrigido", S5MA, 102, 103), x("LH Corrigido", rst(12), 2),
    x("J01 Corrigido", rs5(9), 7), x("LH Original", rst(12), 1), x("J04 Corrigido", DP, 7.33, 7.44),
    x("LH Original", rst(11), 5), x("LH Original", ST, 169, 172),
  ],
  "J01 Corrigido": [
    x("J04 Original", ST, 202, 208), x("J04 Corrigido", ST, 204, 209), x("J04 Original", SD, 78, 85),
    x("J04 Original", "Qtd Fibonacci", 2, 3), x("J04 Original", SD, 75, 76), x("LH Corrigido", rst(13), 2),
    x("J04 Corrigido", "C1", 4), x("J01 Original", DP, 6.36, 6.95), x("J01 Original", "L1", 2),
    x("FLS Original", "Qtd Moldura", 13), x("FLS Corrigido", S5ME, 46, 48), x("J01 Original", DP, 5.13, 5.27),
    x("J01 Original", ST, 213, 217), x("LH Corrigido", S5ME, 67), x("J04 Corrigido", S5MN, 30, 31),
    x("J04 Corrigido", DP, 6.48, 6.55), x("LH Original", DP, 7.66, 7.72), x("J04 Original", DP, 7.01, 7.08),
    x("J04 Corrigido", "Qtd Primos", 3), x("LH Original", S5ME, 54),
  ],
  "J04 Original": [
    x("LH Corrigido", DP, 5.89, 6.61), x("LH Original", DP, 6.69, 7.4), x("J04 Corrigido", rs5(8), 6),
    x("J01 Corrigido", DP, 6.63, 6.82), x("J04 Corrigido", rs5(9), 2), x("LH Original", SD, 63, 64),
    x("LH Corrigido", ST, 178, 183), x("J01 Corrigido", ST, 190, 191), x("LH Corrigido", DP, 6.86, 6.98),
    x("LH Original", "Faixa Alta (18-25)", 7, 8), x("J04 Corrigido", S5MA, 101, 102), x("J01 Corrigido", rst(12), 11),
    x("LH Original", ST, 171, 173), x("J01 Corrigido", DP, 7.75, 7.99), x("LH Original", rst(15), 1),
    x("J01 Corrigido", rs5(10), 4), x("J01 Original", DP, 6.01, 6.08), x("J04 Corrigido", DP, 6.69, 6.75),
    x("J04 Corrigido", DP, 6.89, 6.93), x("J04 Corrigido", SD, 82),
  ],
  "J04 Corrigido": [
    x("LH Original", DP, 6.79, 7.61), x("LH Corrigido", S5MA, 94, 102), x("LH Original", S5MA, 94, 102),
    x("J01 Corrigido", DP, 6.7, 6.96), x("LH Corrigido", DP, 6.17, 6.73), x("LH Corrigido", ST, 178, 186),
    x("LH Original", DP, 6.77, 7.44), x("LH Original", S5MA, 93, 100), x("LH Original", DP, 6.76, 7.4),
    x("LH Corrigido", DP, 6.05, 6.65), x("J01 Corrigido", DP, 6.69, 6.89), x("LH Corrigido", DP, 7.58, 7.86),
    x("LH Original", ST, 161, 169), x("LH Original", DP, 8.43, 8.68), x("LH Original", DP, 8.45, 8.71),
    x("LH Original", rs5(15), 8, 9), x("LH Corrigido", rs5(15), 8, 9), x("J01 Original", rst(10), 3),
    x("J01 Original", DP, 5.19, 5.36), x("J01 Corrigido", SD, 66, 69),
  ],
  "LH Original": [
    x("J04 Original", rs5(10), 5, 7), x("J04 Corrigido", rs5(9), 4), x("LH Corrigido", DP, 7.04, 7.17),
    x("LH Corrigido", rs5(15), 10), x("LH Corrigido", DP, 7.03, 7.16), x("J04 Original", rs5(15), 10, 12),
    x("J04 Corrigido", rs5(15), 7, 8), x("J04 Corrigido", rs5(5), 3), x("LH Corrigido", DP, 5.5, 6.33),
    x("LH Corrigido", S5ME, 76, 84), x("J01 Corrigido", DP, 6.51, 6.61), x("J04 Corrigido", DP, 5.84, 6.39),
    x("LH Corrigido", rs5(11), 7), x("J04 Corrigido", DP, 7.59, 7.92), x("LH Corrigido", rs5(12), 10),
    x("LH Corrigido", ST, 213, 222), x("LH Corrigido", rs5(13), 2), x("LH Corrigido", S5MA, 87, 95),
    x("J04 Original", DP, 7.26, 7.35), x("J01 Original", DP, 5.12, 5.28),
  ],
  "LH Corrigido": [
    x("LH Original", S5MA, 113, 115), x("J01 Original", DP, 5.01, 5.26), x("J01 Corrigido", DP, 6.51, 6.66),
    x("J04 Corrigido", rst(9), 0), x("LH Original", S5ME, 71, 76), x("J04 Corrigido", rst(12), 6),
    x("J04 Corrigido", rst(11), 0), x("LH Original", ST, 197, 202), x("J01 Original", rs5(12), 5, 6),
    x("J01 Corrigido", rs5(13), 8, 9), x("LH Original", rst(12), 7), x("J01 Original", rs5(14), 1, 2),
    x("J01 Corrigido", rs5(15), 7, 8), x("J04 Corrigido", rst(14), 2), x("J01 Corrigido", "Qtd Pares Consecutivos", 5),
    x("LH Original", DP, 7.24, 7.46), x("LH Original", DP, 7.9, 7.99), x("J04 Corrigido", DP, 7.05, 7.14),
    x("LH Original", DP, 6.21, 7.04), x("J04 Corrigido", DP, 7.12, 7.2),
  ],
};

function descreverRegra(reg: Regra): string {
  return reg.min === reg.max ? `${reg.key} = ${reg.min}` : `${reg.key} entre ${reg.min} e ${reg.max}`;
}

function avaliarJogoSeguro(
  metricas: EssentialMetrics,
  nomeEstrategia: string,
  todasMetricas: Record<string, EssentialMetrics>
): [boolean, string] {
  for (const reg of REGRAS_ELIMINACAO[nomeEstrategia] ?? []) {
    const v = metricas[reg.key];
    if (v !== undefined && v >= reg.min && v <= reg.max) {
      return [false, `Zona morta: ${descreverRegra(reg)}`];
    }
  }
  for (const reg of REGRAS_CRUZADAS[nomeEstrategia] ?? []) {
    const alvo = todasMetricas[reg.strat];
    if (!alvo) continue;
    const v = alvo[reg.key];
    if (v !== undefined && v >= reg.min && v <= reg.max) {
      return [false, `Gatilho cruzado (${reg.strat.replace(/ (Original|Corrigido)$/, "")}): ${descreverRegra(reg)}`];
    }
  }
  return [true, "Aprovado nos filtros"];
}

// =============================================================================
// EXECUTOR PRINCIPAL
// =============================================================================
function calcAttrs(jogo: number[]): GameAttributes {
  return {
    soma: jogo.reduce((a, b) => a + b, 0),
    pares: jogo.filter((n) => n % 2 === 0).length,
  };
}

const ESTRATEGIAS_BASE: BaseStrat[] = ["FLS", "J01", "J04", "LH"];

export function runSniperAlgorithm(ultimo: number[], _historicalResults?: number[][]): SniperResult {
  const sorted = [...ultimo].sort((a, b) => a - b);
  const naoSorteadas = Array.from({ length: 25 }, (_, i) => i + 1).filter((n) => !sorted.includes(n));

  // 1. Geração e extração de métricas
  const jogosGerados: Record<string, number[]> = {};
  const metGlobais: Record<string, EssentialMetrics> = {};
  for (const [nome, gerador] of Object.entries(GERADORES)) {
    const jogo = gerador(sorted);
    jogosGerados[nome] = jogo;
    metGlobais[nome] = calcularMetricasCompletas(jogo, sorted);
  }

  // 2. Avaliação das estratégias base (Original → Corrigido)
  const games: GameResult[] = [];
  let qtdAprovados = 0;

  for (const base of ESTRATEGIAS_BASE) {
    const nomeOrig = `${base} Original`;
    const nomeCorr = `${base} Corrigido`;

    const [aprovOrig, motOrig] = avaliarJogoSeguro(metGlobais[nomeOrig], nomeOrig, metGlobais);

    let tag = nomeOrig;
    let aprovado = false;
    let motivo = motOrig;
    let jogoFinal = jogosGerados[nomeOrig];
    let metFinal = metGlobais[nomeOrig];

    if (aprovOrig) {
      aprovado = true;
      qtdAprovados++;
    } else {
      const [aprovCorr, motCorr] = avaliarJogoSeguro(metGlobais[nomeCorr], nomeCorr, metGlobais);
      if (aprovCorr) {
        tag = nomeCorr;
        aprovado = true;
        motivo = motCorr;
        jogoFinal = jogosGerados[nomeCorr];
        metFinal = metGlobais[nomeCorr];
        qtdAprovados++;
      } else {
        motivo = motOrig;
      }
    }

    games.push({
      numbers: jogoFinal,
      attrs: calcAttrs(jogoFinal),
      aprovado,
      motivo,
      tag: tag.replace(/ (Original|Corrigido)$/, ""),
      metricas: metFinal,
    });
  }

  // 3. Gatilho de resgate (RMSE Corrigido) quando no máximo 1 base foi aprovada
  if (qtdAprovados <= 1) {
    const dictOriginais: Record<BaseStrat, number[]> = {
      FLS: jogosGerados["FLS Original"],
      J01: jogosGerados["J01 Original"],
      J04: jogosGerados["J04 Original"],
      LH: jogosGerados["LH Original"],
    };
    const jogoRmse = gerarEstrategiaRmse(dictOriginais, true);
    const metRmse = calcularMetricasCompletas(jogoRmse, sorted);

    let aprovadoResgate = true;
    let motivoResgate = "Aprovado (Resgate)";
    for (const reg of REGRAS_ELIMINACAO["RMSE Corrigido"]) {
      const v = metRmse[reg.key];
      if (v !== undefined && v >= reg.min && v <= reg.max) {
        aprovadoResgate = false;
        motivoResgate = `Zona morta: ${descreverRegra(reg)}`;
        break;
      }
    }

    games.push({
      numbers: jogoRmse,
      attrs: calcAttrs(jogoRmse),
      aprovado: aprovadoResgate,
      motivo: motivoResgate,
      tag: "RMSE",
      metricas: metRmse,
    });
  }

  return { games, naoSorteadas };
}
