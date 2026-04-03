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

export async function fetchContestByNumber(num: number): Promise<LotofacilResult | null> {
  try {
    const res = await fetch(`https://loteriascaixa-api.herokuapp.com/api/lotofacil/${num}`);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      concurso: data.concurso,
      data: data.data ?? "",
      dezenas: data.dezenas.map((d: string) => parseInt(d, 10)).sort((a: number, b: number) => a - b),
    };
  } catch {
    return null;
  }
}

/** Fetch multiple contests sequentially, filling gaps in local history */
export async function fetchContestRange(from: number, to: number): Promise<LotofacilResult[]> {
  const results: LotofacilResult[] = [];
  for (let n = from; n <= to; n++) {
    const r = await fetchContestByNumber(n);
    if (r) results.push(r);
  }
  return results;
}
