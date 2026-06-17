export const C = {
  coral: "#F0502E", coralDeep: "#D63E1E", coralSoft: "#FDEAE3",
  teal: "#0E9F8E", gold: "#E0A100", ink: "#1A1714", sub: "#8A8178",
  line: "#ECE8E2", cream: "#F6F4F0",
} as const;

export const LANG_COLORS: Record<string, string> = {
  Yoruba: "#F0502E",
  Mina: "#0E9F8E",
  Fongbé: "#6D45C9",
  Goun: "#C58A00",
  Adja: "#2563EB",
  Bariba: "#BE123C",
  Autre: "#F0502E",
};

export const LANGS = Object.keys(LANG_COLORS);

export const accentFor = (lang: string, override: string | null): string =>
  override || LANG_COLORS[lang] || C.coral;
