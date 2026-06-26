export const C = {
  coral: "#EA7538", coralDeep: "#D63E1E", coralSoft: "#FDEAE3",
  teal: "#0E9F8E", gold: "#E0A100", ink: "#1A1714", sub: "#8A8178",
  line: "#ECE8E2", cream: "#F6F4F0",
} as const;

export const LANG_COLORS: Record<string, string> = {
  Fongbé: "#3872C0",
  Yoruba: "#3872C0",
  Mina: "#009EAD",
};

export const LANGS = Object.keys(LANG_COLORS);

export const accentFor = (lang: string, override: string | null): string =>
  override || LANG_COLORS[lang] || C.coral;
