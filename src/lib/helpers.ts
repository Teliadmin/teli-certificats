export function todayFR(): string {
  return new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export function slug(s: string): string {
  return (s || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase() || "x";
}

export function cap(s: string): string {
  return (s || "").charAt(0).toUpperCase() + (s || "").slice(1);
}

export function fullNameOf(first: string, last: string): string {
  return `${cap(first)} ${(last || "").toUpperCase()}`.trim();
}

export function fillTpl(tpl: string, d: { firstName: string; lastName: string; language: string }): string {
  return (tpl || "")
    .replace(/{prenom}/gi, d.firstName || "")
    .replace(/{nom}/gi, (d.lastName || "").toUpperCase())
    .replace(/{langue}/gi, d.language || "");
}

export function makeId(prefix: string): string {
  const y = new Date().getFullYear();
  const r = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix || "TELI"}-${y}-${r}`;
}

export function verifyUrl(id: string): string {
  return `https://learning.teli-app.com/verify/${id}`;
}

export function download(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/** Lit un fichier image en DataURL + ratio largeur/hauteur. */
export function readImage(file: File): Promise<{ url: string; ratio: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve({ url: reader.result as string, ratio: img.naturalWidth / img.naturalHeight });
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
