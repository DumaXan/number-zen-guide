export interface SniperResult {
  fixasS: number[];
  fixasN: number[];
  g2: number[];
  g3: number[];
  somaG2: number;
  somaG3: number;
  paresG2: number;
  paresG3: number;
  alertas: string[];
  aprovado: boolean;
  naoSorteadas: number[];
}

export function runSniperAlgorithm(ultimo: number[]): SniperResult {
  const sorted = [...ultimo].sort((a, b) => a - b);
  const allNums = new Set(Array.from({ length: 25 }, (_, i) => i + 1));
  const naoSorteadas = [...allNums].filter((x) => !sorted.includes(x)).sort((a, b) => a - b);

  // Fixas
  const fixasS = [sorted[0], sorted[8], sorted[14]];
  const fixasN = [naoSorteadas[4], naoSorteadas[5]];

  // Grupos de apoio
  const remA = sorted.filter((x) => !fixasS.includes(x));
  const remB = naoSorteadas.filter((x) => !fixasN.includes(x));

  const gS1 = remA.slice(0, 6);
  const gS2 = remA.slice(6);
  const gN1 = remB.slice(0, 4);
  const gN2 = remB.slice(4);

  // Jogos híbridos
  const g2 = [...new Set([...fixasS, ...gS1, ...fixasN, ...gN2])].sort((a, b) => a - b);
  const g3 = [...new Set([...fixasS, ...gS2, ...fixasN, ...gN1])].sort((a, b) => a - b);

  const somaG2 = g2.reduce((a, b) => a + b, 0);
  const somaG3 = g3.reduce((a, b) => a + b, 0);
  const paresG2 = g2.filter((x) => x % 2 === 0).length;
  const paresG3 = g3.filter((x) => x % 2 === 0).length;

  const alertas: string[] = [];

  if (paresG2 === 4 || paresG2 === 11) alertas.push(`G2: Paridade instável (${paresG2}P)`);
  if (somaG2 < 180) alertas.push(`G2: Soma abaixo do Piso (${somaG2})`);
  if (paresG3 === 4 || paresG3 === 11) alertas.push(`G3: Paridade instável (${paresG3}P)`);
  if (somaG3 > 210) alertas.push(`G3: Soma acima do Teto (${somaG3})`);
  if (somaG3 < somaG2) alertas.push(`Sincronia: Soma G3 (${somaG3}) menor que G2 (${somaG2})`);

  return {
    fixasS,
    fixasN,
    g2,
    g3,
    somaG2,
    somaG3,
    paresG2,
    paresG3,
    alertas,
    aprovado: alertas.length === 0,
    naoSorteadas,
  };
}
