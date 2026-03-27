import * as XLSX from "xlsx";

export interface ConcursoHistorico {
  concurso: number;
  dezenas: number[];
}

const STORAGE_KEY = "sniper-historico-extra";

/** Cache completo (base + extras + seeds), já mergeado e ordenado */
let mergedCache: ConcursoHistorico[] | null = null;

/** Recent contests to seed into the system */
const SEED_CONTESTS: ConcursoHistorico[] = [
  { concurso: 3630, dezenas: [2,3,4,5,6,7,8,11,12,14,15,17,19,23,24] },
  { concurso: 3631, dezenas: [4,7,8,9,12,13,14,15,16,17,19,20,21,23,25] },
  { concurso: 3632, dezenas: [1,2,3,5,6,9,10,15,17,19,20,21,22,23,25] },
  { concurso: 3633, dezenas: [1,5,6,7,10,11,13,17,18,20,21,22,23,24,25] },
  { concurso: 3634, dezenas: [3,4,5,6,7,8,10,11,13,14,16,18,19,21,25] },
  { concurso: 3635, dezenas: [1,2,3,5,11,12,14,15,16,19,20,22,23,24,25] },
];

/** Loads the base historical data from the Excel file */
async function loadBaseData(): Promise<ConcursoHistorico[]> {
  const response = await fetch("/data/lotofacil-historico.xlsx");
  const buffer = await response.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<{ Concurso: number; Resultado: string }>(sheet);

  return rows.map((row) => ({
    concurso: row.Concurso,
    dezenas: row.Resultado.split(" ").map((n) => parseInt(n, 10)).sort((a, b) => a - b),
  }));
}

/** Gets extra contests added after the base Excel (stored in localStorage) */
function getExtraContests(): ConcursoHistorico[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Saves a new contest to localStorage if it doesn't exist yet */
function saveExtraContest(contest: ConcursoHistorico): void {
  const extras = getExtraContests();
  if (extras.some((c) => c.concurso === contest.concurso)) return;
  extras.push(contest);
  extras.sort((a, b) => a.concurso - b.concurso);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(extras));
}

/** Returns all historical contests (base + extras), sorted by concurso — com cache otimizado */
export async function getAllContests(): Promise<ConcursoHistorico[]> {
  if (mergedCache) {
    return mergedCache;
  }

  const base = await loadBaseData();
  const extras = getExtraContests();
  const ids = new Set(base.map((c) => c.concurso));
  const merged = [...base];
  for (const e of [...SEED_CONTESTS, ...extras]) {
    if (!ids.has(e.concurso)) {
      merged.push(e);
      ids.add(e.concurso);
    }
  }
  merged.sort((a, b) => a.concurso - b.concurso);
  mergedCache = merged;
  return mergedCache;
}

/** Add a new contest from the API result to the local store */
export function addNewContest(concurso: number, dezenas: number[]): void {
  saveExtraContest({ concurso, dezenas: [...dezenas].sort((a, b) => a - b) });
  // Invalidate cache so next getAllContests picks it up
  cachedData = null;
}

/** Check if a set of 15 numbers matches any historical result */
export function isHistoricalMatch(numbers: number[], allContests: ConcursoHistorico[]): boolean {
  const key = [...numbers].sort((a, b) => a - b).join(",");
  return allContests.some((c) => c.dezenas.join(",") === key);
}
