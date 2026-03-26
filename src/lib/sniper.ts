// =============================================================================
// SNIPER LOTOFÁCIL — 4 Estratégias de Geração de Jogos
// =============================================================================

const MOLDURA = new Set([1, 2, 3, 4, 5, 6, 10, 11, 15, 16, 20, 21, 22, 23, 24, 25]);
const MOLDURA_ARR = [1, 2, 3, 4, 5, 6, 10, 11, 15, 16, 20, 21, 22, 23, 24, 25];
const MIOLO_TOTAL = [7, 8, 9, 12, 13, 14, 17, 18, 19];
const PRIMOS = new Set([2, 3, 5, 7, 11, 13, 17, 19, 23]);
const FIBONACCI = new Set([1, 2, 3, 5, 8, 13, 21]);
const QUADRADOS_PERFEITOS = new Set([1, 4, 9, 16, 25]);
const TOP_5 = [20, 10, 25, 11, 13];

export interface GameAttributes {
  soma: number;
  pares: number;
}

export interface GameResult {
  numbers: number[];
  attrs: GameAttributes;
  aprovado: boolean;
  motivo: string;
  tag: string;
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
  for (const d of jogo) {
    const [l, c] = obterLinhaColuna(d);
    if (!linhas.has(l)) linhas.set(l, []);
    if (!colunas.has(c)) colunas.set(c, []);
    linhas.get(l)!.push(d);
    colunas.get(c)!.push(d);
  }
  return [linhas, colunas];
}

function calibrarJogo(jogo: number[], grupoN: number[], grupoSReserva: number[]): number[] {
  let result = [...jogo];
  const [lDict, cDict] = analisarVolante(result);

  for (const [dictGeo, tipo] of [[lDict, 'L'], [cDict, 'C']] as [Map<number, number[]>, string][]) {
    const vazios = [];
    for (let k = 1; k <= 5; k++) {
      if (!dictGeo.has(k)) vazios.push(k);
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
        }
      }
    }
  }
  return result;
}

// =============================================================================
// 1. FRAME LEFT SHIFT (Jogo 01)
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
  const jogoG2 = baseDeslocada.filter(d => !grupo2Excluir.includes(d)).sort((a, b) => a - b);

  const soma = jogoG2.reduce((a, b) => a + b, 0);
  const repetidas = jogoG2.filter(x => ultimo.includes(x)).length;
  const dp = pstdev(jogoG2);

  let motivo = "";
  if (soma > 217) motivo = `Soma elevada (${soma})`;
  else if (repetidas < 7) motivo = `Poucas repetidas (${repetidas})`;
  else if (repetidas > 12) motivo = `Muitas repetidas (${repetidas})`;
  else if (dp < 8.17) motivo = `Desvio padrão baixo (${dp.toFixed(2)})`;

  return {
    numbers: jogoG2,
    attrs: calcAttrs(jogoG2),
    aprovado: motivo === "",
    motivo: motivo || "Aprovado",
    tag: "FLS",
  };
}

// =============================================================================
// 2. LAST HITS (Jogo 02)
// =============================================================================
function gerarLastHits(ultimo: number[]): GameResult {
  const dezenasFora = Array.from({ length: 25 }, (_, i) => i + 1).filter(n => !ultimo.includes(n));
  const base18 = [...ultimo, ...dezenasFora.slice(0, 3)].sort((a, b) => a - b);
  const grupoExcluir = base18.slice(6, 9);
  const jogo3 = base18.filter(n => !grupoExcluir.includes(n)).sort((a, b) => a - b);

  // Métricas
  const gaps = [];
  for (let i = 0; i < jogo3.length - 1; i++) gaps.push(jogo3[i + 1] - jogo3[i]);
  const gapMax = gaps.length > 0 ? Math.max(...gaps) : 0;
  const sd = somaDigitos(jogo3);
  const dp = pstdev(jogo3);
  const qtdMoldura = jogo3.filter(n => MOLDURA.has(n)).length;
  const linhas = [
    jogo3.filter(n => n >= 1 && n <= 5),
    jogo3.filter(n => n >= 6 && n <= 10),
    jogo3.filter(n => n >= 11 && n <= 15),
    jogo3.filter(n => n >= 16 && n <= 20),
    jogo3.filter(n => n >= 21 && n <= 25),
  ];
  const temLinhaVazia = linhas.some(l => l.length === 0);
  const mSeq = maxSequencia(jogo3);
  const repetidas = jogo3.filter(x => ultimo.includes(x)).length;

  let motivo = "";
  if (gapMax > 8) motivo = `Gap Max > 8 (${gapMax})`;
  else if (sd < 58 || sd > 77) motivo = `Soma Dígitos fora (${sd})`;
  else if (dp < 7.10 || dp > 8.61) motivo = `Desvio Padrão fora (${dp.toFixed(2)})`;
  else if (qtdMoldura < 10) motivo = `Moldura < 10 (${qtdMoldura})`;
  else if (temLinhaVazia) motivo = "Possui linha vazia";
  else if (mSeq < 5) motivo = `Máxima Sequência < 5 (${mSeq})`;
  else if (repetidas > 14) motivo = `Repetidas > 14 (${repetidas})`;

  return {
    numbers: jogo3,
    attrs: calcAttrs(jogo3),
    aprovado: motivo === "",
    motivo: motivo || "Aprovado",
    tag: "LH",
  };
}

// =============================================================================
// 3. NEW G3 PLUS 3G2 (Jogo 03 - J04)
// =============================================================================
function gerarFechamento18x6(base18: number[]): number[][] {
  const base = [...base18].sort((a, b) => a - b);
  const grupos = [];
  for (let i = 0; i < 18; i += 3) grupos.push(base.slice(i, i + 3));
  const jogos = [];
  for (let i = 0; i < 6; i++) {
    jogos.push(base.filter(d => !grupos[i].includes(d)).sort((a, b) => a - b));
  }
  return jogos;
}

function buildG2G3(ultimo: number[]): { jogo2: number[]; jogo3: number[]; naoSorteadas: number[] } {
  const allNums = Array.from({ length: 25 }, (_, i) => i + 1);
  const naoSorteadas = allNums.filter(x => !ultimo.includes(x)).sort((a, b) => a - b);

  // G3
  const fixasSG3 = [ultimo[0], ultimo[5], ultimo[12]];
  const fixasNG3 = [naoSorteadas[2], naoSorteadas[8]];
  const remAG3 = ultimo.filter(x => !fixasSG3.includes(x));
  const remBG3 = naoSorteadas.filter(x => !fixasNG3.includes(x));
  const jogo3 = [...new Set([...fixasSG3, ...remAG3.slice(6), ...fixasNG3, ...remBG3.slice(0, 4)])].sort((a, b) => a - b);

  // G2
  const fSG2 = TOP_5.filter(x => ultimo.includes(x)).slice(0, 3);
  const fNG2 = TOP_5.filter(x => naoSorteadas.includes(x)).slice(0, 2);
  if (fSG2.length < 3) {
    for (const p of [ultimo[0], ultimo[5]]) {
      if (!fSG2.includes(p) && fSG2.length < 3) fSG2.push(p);
    }
  }
  const remAG2 = ultimo.filter(x => !fSG2.includes(x));
  const remBG2 = naoSorteadas.filter(x => !fNG2.includes(x));
  let jogo2 = [...new Set([...fSG2, ...remAG2.slice(0, 6), ...fNG2, ...remBG2.slice(4)])].sort((a, b) => a - b);
  jogo2 = calibrarJogo(jogo2, remBG2.slice(4), remAG2.slice(6));

  return { jogo2, jogo3, naoSorteadas };
}

function gerarNewG3Plus3G2(ultimo: number[]): GameResult {
  const allNums = new Set(Array.from({ length: 25 }, (_, i) => i + 1));
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

  const jogosFinais = gerarFechamento18x6(baseElite);
  const jogo04 = jogosFinais[3];

  // Validação J04
  const [lDict, cDict] = analisarVolante(jogo04);
  for (let i = 1; i <= 5; i++) {
    if (!lDict.has(i)) return { numbers: jogo04, attrs: calcAttrs(jogo04), aprovado: false, motivo: `Linha ${i} vazia`, tag: "J04" };
    if (!cDict.has(i)) return { numbers: jogo04, attrs: calcAttrs(jogo04), aprovado: false, motivo: `Coluna ${i} vazia`, tag: "J04" };
  }

  const qtdPrimos = jogo04.filter(x => PRIMOS.has(x)).length;
  if (qtdPrimos > 7) return { numbers: jogo04, attrs: calcAttrs(jogo04), aprovado: false, motivo: `Primos (${qtdPrimos}) > 7`, tag: "J04" };
  if (qtdPrimos < 4) return { numbers: jogo04, attrs: calcAttrs(jogo04), aprovado: false, motivo: `Primos (${qtdPrimos}) < 4`, tag: "J04" };

  const soma = jogo04.reduce((a, b) => a + b, 0);
  if (soma < 182) return { numbers: jogo04, attrs: calcAttrs(jogo04), aprovado: false, motivo: `Soma (${soma}) < 182`, tag: "J04" };
  if (soma > 205) return { numbers: jogo04, attrs: calcAttrs(jogo04), aprovado: false, motivo: `Soma (${soma}) > 205`, tag: "J04" };

  const soma5Maiores = jogo04.slice(-5).reduce((a, b) => a + b, 0);
  if (soma5Maiores > 114) return { numbers: jogo04, attrs: calcAttrs(jogo04), aprovado: false, motivo: `Soma 5 Maiores (${soma5Maiores}) > 114`, tag: "J04" };

  const qtdImpares = jogo04.filter(x => x % 2 !== 0).length;
  if (qtdImpares > 10) return { numbers: jogo04, attrs: calcAttrs(jogo04), aprovado: false, motivo: `Ímpares (${qtdImpares}) > 10`, tag: "J04" };

  const repetidos = jogo04.filter(x => ultimo.includes(x)).length;
  if (repetidos > 10) return { numbers: jogo04, attrs: calcAttrs(jogo04), aprovado: false, motivo: `Repetidos (${repetidos}) > 10`, tag: "J04" };

  const dp = pstdev(jogo04);
  if (dp > 8.36) return { numbers: jogo04, attrs: calcAttrs(jogo04), aprovado: false, motivo: `Desvio Padrão (${dp.toFixed(2)}) > 8.36`, tag: "J04" };

  const qtdFibo = jogo04.filter(x => FIBONACCI.has(x)).length;
  if (qtdFibo < 3) return { numbers: jogo04, attrs: calcAttrs(jogo04), aprovado: false, motivo: `Fibonacci (${qtdFibo}) < 3`, tag: "J04" };

  const sd = somaDigitos(jogo04);
  if (sd > 80) return { numbers: jogo04, attrs: calcAttrs(jogo04), aprovado: false, motivo: `Soma Dígitos (${sd}) > 80`, tag: "J04" };

  return { numbers: jogo04, attrs: calcAttrs(jogo04), aprovado: true, motivo: "Aprovado", tag: "J04" };
}

// =============================================================================
// 4. NEW G2 PLUS 3G3 (Jogo 04 - J01)
// =============================================================================
function gerarNewG2Plus3G3(ultimo: number[]): GameResult {
  const allNums = new Set(Array.from({ length: 25 }, (_, i) => i + 1));
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

  const grupos = [];
  for (let i = 0; i < 18; i += 3) grupos.push(baseElite.slice(i, i + 3));
  const jogo01 = baseElite.filter(d => !grupos[0].includes(d)).sort((a, b) => a - b);

  // Validação J01
  if (contarParesConsecutivos(jogo01) > 12)
    return { numbers: jogo01, attrs: calcAttrs(jogo01), aprovado: false, motivo: "Mais de 12 pares consecutivos", tag: "J01" };

  const dp = pstdev(jogo01);
  if (dp < 4.88)
    return { numbers: jogo01, attrs: calcAttrs(jogo01), aprovado: false, motivo: `Desvio padrão baixo (${dp.toFixed(2)})`, tag: "J01" };

  const qtdFib = jogo01.filter(x => FIBONACCI.has(x)).length;
  if (qtdFib < 1 || qtdFib > 3)
    return { numbers: jogo01, attrs: calcAttrs(jogo01), aprovado: false, motivo: `Fibonacci fora do intervalo (${qtdFib})`, tag: "J01" };

  const qtdPrimos = jogo01.filter(x => PRIMOS.has(x)).length;
  if (qtdPrimos < 3)
    return { numbers: jogo01, attrs: calcAttrs(jogo01), aprovado: false, motivo: `Poucos primos (${qtdPrimos})`, tag: "J01" };

  const qtdQuad = jogo01.filter(x => QUADRADOS_PERFEITOS.has(x)).length;
  if (qtdQuad < 2)
    return { numbers: jogo01, attrs: calcAttrs(jogo01), aprovado: false, motivo: `Poucos quadrados perfeitos (${qtdQuad})`, tag: "J01" };

  const qtdMoldura = jogo01.filter(x => MOLDURA.has(x)).length;
  if (qtdMoldura > 11)
    return { numbers: jogo01, attrs: calcAttrs(jogo01), aprovado: false, motivo: `Excesso moldura (${qtdMoldura})`, tag: "J01" };

  const repetidas = jogo01.filter(x => ultimo.includes(x)).length;
  if (repetidas < 8 || repetidas > 11)
    return { numbers: jogo01, attrs: calcAttrs(jogo01), aprovado: false, motivo: `Repetidas fora do intervalo (${repetidas})`, tag: "J01" };

  const soma = jogo01.reduce((a, b) => a + b, 0);
  if (soma < 209)
    return { numbers: jogo01, attrs: calcAttrs(jogo01), aprovado: false, motivo: `Soma total baixa (${soma})`, tag: "J01" };

  const soma5Maiores = jogo01.slice(-5).reduce((a, b) => a + b, 0);
  if (soma5Maiores > 114)
    return { numbers: jogo01, attrs: calcAttrs(jogo01), aprovado: false, motivo: `Soma 5 maiores alta (${soma5Maiores})`, tag: "J01" };

  const imparesAlta = jogo01.filter(x => x >= 14 && x % 2 !== 0).length;
  if (imparesAlta < 3 || imparesAlta > 5)
    return { numbers: jogo01, attrs: calcAttrs(jogo01), aprovado: false, motivo: `Ímpares faixa alta fora (${imparesAlta})`, tag: "J01" };

  return { numbers: jogo01, attrs: calcAttrs(jogo01), aprovado: true, motivo: "Aprovado", tag: "J01" };
}

// =============================================================================
// EXECUTOR PRINCIPAL
// =============================================================================
export function runSniperAlgorithm(ultimo: number[], historicalResults?: number[][]): SniperResult {
  const sorted = [...ultimo].sort((a, b) => a - b);
  const allNums = Array.from({ length: 25 }, (_, i) => i + 1);
  const naoSorteadas = allNums.filter(x => !sorted.includes(x)).sort((a, b) => a - b);

  const games: GameResult[] = [
    gerarFrameLeftShift(sorted),
    gerarLastHits(sorted),
    gerarNewG3Plus3G2(sorted),
    gerarNewG2Plus3G3(sorted),
  ];

  // Filtro de duplicata histórica
  if (historicalResults && historicalResults.length > 0) {
    for (const game of games) {
      if (!game.aprovado) continue;
      const key = game.numbers.join(",");
      for (const hist of historicalResults) {
        if ([...hist].sort((a, b) => a - b).join(",") === key) {
          game.aprovado = false;
          game.motivo = "Jogo idêntico a resultado passado (duplicata histórica)";
          break;
        }
      }
    }
  }

  return { games, naoSorteadas };
}
