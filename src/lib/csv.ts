import Papa from "papaparse";
import type { CsvRow } from "../types";

function normalizeRow(obj: Record<string, string>): CsvRow {
  const m: Record<string, string> = {};
  for (const k in obj) m[k.trim().toLowerCase()] = (obj[k] || "").toString().trim();
  const first = m.prenom || m["prénom"] || m.firstname || m["first name"] || m.first || "";
  const last = m.nom || m.lastname || m["last name"] || m.last || m.name || "";
  const language = m.langue || m.language || m.lang || "";
  return { first, last, language };
}

export function parseCsv(file: File): Promise<CsvRow[]> {
  return new Promise((resolve) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const rows = res.data.map(normalizeRow).filter((r) => r.first || r.last);
        resolve(rows);
      },
      error: () => resolve([]),
    });
  });
}

export function buildTemplateCsv(): string {
  return "prenom,nom,langue\nMarie,Dupont,Yoruba\nKofi,Mensah,Mina\nAïcha,Baldé,Fongbé\n";
}
