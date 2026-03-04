// Conjuntos matemáticos da Lotofácil
const MOLDURA = new Set([1, 2, 3, 4, 5, 6, 10, 11, 15, 16, 20, 21, 22, 23, 24, 25]);
const PRIMOS = new Set([2, 3, 5, 7, 11, 13, 17, 19, 23]);
const FIBONACCI = new Set([1, 2, 3, 5, 8, 13, 21]);
const MULTIPLOS_3 = new Set([3, 6, 9, 12, 15, 18, 21, 24]);
const TOP_5 = [20, 10, 25, 11, 13];

export interface GameAttributes {
  soma: number;
  pares: number;
  moldura: number;
  primos: number;
  fibo: number;
  mult3: number;
  seqMax: number;
}

export interface GameResult {
  numbers: number[];
  attrs: GameAttributes;
  aprovado: boolean;
  motivo: string;
}

export interface SniperResult {
  g2: GameResult;
  g3: GameResult;
  diffSoma: number;
  naoSorteadas: number[];
}

function calcularSequenciaMaxima(jogo: number[]): number {
  if (jogo.length === 0) return 0;
  let maxSeq = 1, atual = 1;
  for (let i = 1; i < jogo.length; i++) {
    if (jogo[i] === jogo[i - 1] + 1) {
      atual++;
    } else {
      maxSeq = Math.max(maxSeq, atual);
      atual = 1;
    }
  }
  return Math.max(maxSeq, atual);
}

function extrairAtributos(jogo: number[]): GameAttributes {
  return {
    soma: jogo.reduce((a, b) => a + b, 0),
    pares: jogo.filter((x) => x % 2 === 0).length,
    moldura: jogo.filter((x) => MOLDURA.has(x)).length,
    primos: jogo.filter((x) => PRIMOS.has(x)).length,
    fibo: jogo.filter((x) => FIBONACCI.has(x)).length,
    mult3: jogo.filter((x) => MULTIPLOS_3.has(x)).length,
    seqMax: calcularSequenciaMaxima(jogo),
  };
}

export function runSniperAlgorithm(ultimo: number[]): SniperResult {
  const sorted = [...ultimo].sort((a, b) => a - b);
  const allNums = new Set(Array.from({ length: 25 }, (_, i) => i + 1));
  const naoSorteadas = [...allNums].filter((x) => !sorted.includes(x)).sort((a, b) => a - b);

  // === G3 (Posições Fixas) ===
  const fixasSG3 = [sorted[0], sorted[5], sorted[12]];
  const fixasNG3 = [naoSorteadas[2], naoSorteadas[8]];

  const remAG3 = sorted.filter((x) => !fixasSG3.includes(x));
  const remBG3 = naoSorteadas.filter((x) => !fixasNG3.includes(x));

  const gS2G3 = remAG3.slice(6);
  const gN1G3 = remBG3.slice(0, 4);

  const jogo3 = [...new Set([...fixasSG3, ...gS2G3, ...fixasNG3, ...gN1G3])].sort((a, b) => a - b);

  // === G2 (Top 5) ===
  const topSorteadas = TOP_5.filter((x) => sorted.includes(x));
  const topNaoSorteadas = TOP_5.filter((x) => naoSorteadas.includes(x));

  const fixasSG2: number[] = topSorteadas.slice(0, 3);
  if (fixasSG2.length < 3) {
    for (const p of [sorted[0], sorted[5], sorted[12]]) {
      if (!fixasSG2.includes(p) && fixasSG2.length < 3) fixasSG2.push(p);
    }
  }

  const fixasNG2: number[] = topNaoSorteadas.slice(0, 2);
  if (fixasNG2.length < 2) {
    for (const p of [naoSorteadas[2], naoSorteadas[8]]) {
      if (!fixasNG2.includes(p) && fixasNG2.length < 2) fixasNG2.push(p);
    }
  }

  fixasSG2.sort((a, b) => a - b);
  fixasNG2.sort((a, b) => a - b);

  const remAG2 = sorted.filter((x) => !fixasSG2.includes(x));
  const remBG2 = naoSorteadas.filter((x) => !fixasNG2.includes(x));

  const gS1G2 = remAG2.slice(0, 6);
  const gN2G2 = remBG2.slice(4);

  const jogo2 = [...new Set([...fixasSG2, ...gS1G2, ...fixasNG2, ...gN2G2])].sort((a, b) => a - b);

  // === Atributos ===
  const attrG2 = extrairAtributos(jogo2);
  const attrG3 = extrairAtributos(jogo3);
  const diffSoma = attrG2.soma - attrG3.soma;

  // === Filtros G3 ===
  let jogarG3 = true;
  let motivoG3 = "";

  if (attrG3.soma > 215) { jogarG3 = false; motivoG3 = `Soma (${attrG3.soma}) > 215`; }
  else if (attrG3.soma < 192) { jogarG3 = false; motivoG3 = `Soma (${attrG3.soma}) < 192`; }
  else if (attrG3.pares === 3 || attrG3.pares === 12) { jogarG3 = false; motivoG3 = `Paridade Extrema (${attrG3.pares}P/${15 - attrG3.pares}I)`; }
  else if (diffSoma > 4) { jogarG3 = false; motivoG3 = `Diferença Soma G2-G3 (${diffSoma}) > 4`; }
  else if (diffSoma < -45) { jogarG3 = false; motivoG3 = `Diferença Soma G2-G3 (${diffSoma}) < -45`; }
  else if (attrG3.moldura > 13) { jogarG3 = false; motivoG3 = `Moldura (${attrG3.moldura}) > 13`; }
  else if (attrG3.primos > 7) { jogarG3 = false; motivoG3 = `Primos (${attrG3.primos}) > 7`; }
  else if (attrG3.fibo < 3 || attrG3.fibo > 6) { jogarG3 = false; motivoG3 = `Fibonacci (${attrG3.fibo}) fora do ideal [3-6]`; }
  else if (attrG3.mult3 > 7) { jogarG3 = false; motivoG3 = `Múltiplos de 3 (${attrG3.mult3}) > 7`; }
  else if (attrG3.seqMax > 10) { jogarG3 = false; motivoG3 = `Sequência Máxima (${attrG3.seqMax}) > 10`; }

  // === Filtros G2 ===
  let jogarG2 = true;
  let motivoG2 = "";

  if (attrG2.soma > 204) { jogarG2 = false; motivoG2 = `Soma (${attrG2.soma}) > 204`; }
  else if (attrG2.pares === 3 || attrG2.pares === 12) { jogarG2 = false; motivoG2 = `Paridade Extrema (${attrG2.pares}P/${15 - attrG2.pares}I)`; }
  else if (diffSoma > 4) { jogarG2 = false; motivoG2 = `Diferença Soma G2-G3 (${diffSoma}) > 4`; }
  else if (diffSoma < -64) { jogarG2 = false; motivoG2 = `Diferença Soma G2-G3 (${diffSoma}) < -64`; }
  else if (attrG2.moldura > 12) { jogarG2 = false; motivoG2 = `Moldura (${attrG2.moldura}) > 12`; }
  else if (attrG2.primos > 7) { jogarG2 = false; motivoG2 = `Primos (${attrG2.primos}) > 7`; }
  else if (attrG2.fibo < 3 || attrG2.fibo > 6) { jogarG2 = false; motivoG2 = `Fibonacci (${attrG2.fibo}) fora do ideal [3-6]`; }
  else if (attrG2.mult3 > 7) { jogarG2 = false; motivoG2 = `Múltiplos de 3 (${attrG2.mult3}) > 7`; }
  else if (attrG2.seqMax > 9) { jogarG2 = false; motivoG2 = `Sequência Máxima (${attrG2.seqMax}) > 9`; }

  return {
    g2: { numbers: jogo2, attrs: attrG2, aprovado: jogarG2, motivo: motivoG2 },
    g3: { numbers: jogo3, attrs: attrG3, aprovado: jogarG3, motivo: motivoG3 },
    diffSoma,
    naoSorteadas,
  };
}
