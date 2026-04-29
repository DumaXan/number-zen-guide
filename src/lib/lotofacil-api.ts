import { z } from "zod";

export interface LotofacilResult {
  concurso: number;
  data: string;
  dezenas: number[];
}

const LotofacilApiSchema = z.object({
  concurso: z.number().int().positive(),
  data: z.string().optional().default(""),
  dezenas: z
    .array(z.union([z.string(), z.number()]))
    .min(15)
    .max(15),
});

function parseResult(raw: unknown): LotofacilResult {
  const parsed = LotofacilApiSchema.parse(raw);
  const dezenas = parsed.dezenas
    .map((d) => (typeof d === "number" ? d : parseInt(d, 10)))
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= 25)
    .sort((a, b) => a - b);

  if (dezenas.length !== 15) {
    throw new Error("Resposta inválida da API: dezenas malformadas");
  }

  return {
    concurso: parsed.concurso,
    data: parsed.data ?? "",
    dezenas,
  };
}

export async function fetchLatestResult(): Promise<LotofacilResult> {
  const res = await fetch("https://loteriascaixa-api.herokuapp.com/api/lotofacil/latest");

  if (!res.ok) {
    throw new Error("Falha ao buscar resultado da Lotofácil");
  }

  const data = await res.json();
  return parseResult(data);
}

export async function fetchContestByNumber(num: number): Promise<LotofacilResult | null> {
  try {
    const res = await fetch(`https://loteriascaixa-api.herokuapp.com/api/lotofacil/${num}`);
    if (!res.ok) return null;
    const data = await res.json();
    return parseResult(data);
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
