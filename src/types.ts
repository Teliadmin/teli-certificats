export type Mode = "single" | "bulk";
export type Template = "classique" | "moderne";

export interface CertState {
  mode: Mode;
  template: Template;
  firstName: string;
  lastName: string;
  language: string;
  dateStr: string;
  title: string;
  bodyTpl: string;
  signName: string;
  signRole: string;
  location: string;
  idPrefix: string;
  accentOverride: string | null;
  logo: string | null;
  logoRatio: number;
  sign: string | null;
  signRatio: number;
  qr: boolean;
  csvRows: CsvRow[];
}

export interface CsvRow {
  first: string;
  last: string;
  language: string;
}

/** Données prêtes à dessiner sur un certificat. */
export interface CertData {
  template: Template;
  firstName: string;
  lastName: string;
  language: string;
  accent: string;
  dateStr: string;
  title: string;
  bodyTpl: string;
  signName: string;
  signRole: string;
  location: string;
  logo: string | null;
  logoRatio: number;
  sign: string | null;
  signRatio: number;
  qr: boolean;
  id: string;
}

export interface Progress {
  running: boolean;
  value: number;
  label: string;
}
