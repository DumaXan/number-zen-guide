export interface LotofacilResult {
  concurso: number;
  data: string;
  dezenas: number[];
}

export async function fetchLatestResult(): Promise<LotofacilResult> {
  const res = await fetch("https://loteriascaixa-api.herokuapp.com/api/lotofacil/latest");

  if (!res.ok) {
    throw new Error("Falha ao buscar resultado da Lotofácil");
  }

  const data = await res.json();

  return {
    concurso: data.concurso,
    data: data.data,
    dezenas: data.dezenas.map((d: string) => parseInt(d, 10)).sort((a: number, b: number) => a - b),
  };
}
