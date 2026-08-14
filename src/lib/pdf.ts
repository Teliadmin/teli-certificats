import { jsPDF } from "jspdf";
import type { CertData } from "../types";
import { cap, fillTpl, fullNameOf } from "./helpers";
import Logo from "../assets/Logo AML.png"

type RGB = [number, number, number];

function hexToRgb(h: string): RGB {
  let x = h.replace("#", "");
  if (x.length === 3) x = x.split("").map((c) => c + c).join("");
  return [parseInt(x.slice(0, 2), 16), parseInt(x.slice(2, 4), 16), parseInt(x.slice(4, 6), 16)];
}

function imgFmt(dataUrl: string): "PNG" | "JPEG" {
  return /^data:image\/png/i.test(dataUrl) ? "PNG" : "JPEG";
}

/** Ajoute une image avec des coins légèrement arrondis (via masque de découpe). */
function addRoundedImage(
  doc: jsPDF,
  img: string,
  fmt: "PNG" | "JPEG",
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  doc.saveGraphicsState();
  // style `null` => définit seulement le tracé, sans le peindre, pour servir de masque.
  (doc as unknown as { roundedRect: (...a: unknown[]) => void }).roundedRect(x, y, w, h, r, r, null);
  (doc as unknown as { clip: () => void }).clip();
  (doc as unknown as { discardPath: () => void }).discardPath();
  doc.addImage(img, fmt, x, y, w, h);
  doc.restoreGraphicsState();
}

/** Trois couleurs de marque utilisées pour les ornements décoratifs. */
const PALETTE: RGB[] = [
  [0x38, 0x72, 0xC0], // bleu
  [0xEA, 0x75, 0x38], // orange
  [0x00, 0x9E, 0xAD], // turquoise
];

/** Couleur de bordure fixe, identique pour tous les certificats (toutes langues). */
const BORDER: RGB = [0x38, 0x72, 0xC0];

/** Petit crochet d'angle décoratif (forme en L). */
function cornerMark(doc: jsPDF, x: number, y: number, sx: number, sy: number, len: number, color: RGB) {
  doc.setDrawColor(color[0], color[1], color[2]);
  doc.setLineWidth(1);
  doc.line(x, y, x + sx * len, y);
  doc.line(x, y, x, y + sy * len);
  doc.setFillColor(color[0], color[1], color[2]);
  doc.circle(x, y, 0.9, "F");
}

/** Bulles de couleur translucides en arrière-plan. */
function drawBubbles(doc: jsPDF) {
  const bubbles: [number, number, number, number][] = [
    [44, 56, 20, 0], [255, 62, 24, 1], [150, 36, 11, 2],
    [58, 152, 17, 2], [242, 150, 21, 0], [150, 182, 13, 1],
  ];
  const GS = (doc as unknown as { GState: new (o: { opacity: number }) => unknown }).GState;
  const setGS = (doc as unknown as { setGState: (g: unknown) => void }).setGState.bind(doc);
  setGS(new GS({ opacity: 0.1 }));
  for (const [x, y, r, ci] of bubbles) {
    const c = PALETTE[ci];
    doc.setFillColor(c[0], c[1], c[2]);
    doc.circle(x, y, r, "F");
  }
  setGS(new GS({ opacity: 1 }));
}

/** Petit soulignement tricolore centré sur `cx`. */
function tricolorRule(doc: jsPDF, cx: number, y: number, half: number) {
  doc.setLineWidth(0.9);
  const seg = (half * 2) / 3;
  doc.setDrawColor(PALETTE[0][0], PALETTE[0][1], PALETTE[0][2]); doc.line(cx - half, y, cx - half + seg, y);
  doc.setDrawColor(PALETTE[1][0], PALETTE[1][1], PALETTE[1][2]); doc.line(cx - half + seg, y, cx - half + 2 * seg, y);
  doc.setDrawColor(PALETTE[2][0], PALETTE[2][1], PALETTE[2][2]); doc.line(cx - half + 2 * seg, y, cx + half, y);
}

function starPDF(doc: jsPDF, cx: number, cy: number, outer: number, inner: number, points: number, color: string) {
  const [r, g, b] = hexToRgb(color);
  doc.setFillColor(r, g, b);
  const verts: [number, number][] = [];
  for (let i = 0; i < points * 2; i++) {
    const rad = i % 2 === 0 ? outer : inner;
    const a = (Math.PI / points) * i - Math.PI / 2;
    verts.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]);
  }
  const rel: number[][] = [];
  for (let i = 1; i < verts.length; i++) rel.push([verts[i][0] - verts[i - 1][0], verts[i][1] - verts[i - 1][1]]);
  doc.lines(rel, verts[0][0], verts[0][1], [1, 1], "F", true);
}

/** Signature manuscrite vectorielle, tracée à la plume autour de (cx, by).
 *  Style : petit groupe de traits anguleux à gauche + long parafe filant vers la droite. */
function drawSignature(doc: jsPDF, cx: number, by: number) {
  doc.setDrawColor(33, 31, 45);
  doc.setLineWidth(0.5);
  doc.setLineCap("round");
  doc.setLineJoin("round");
  // Tracé principal : grappe d'initiales puis long swash montant vers la droite.
  const main: number[][] = [
    [-1, -3, 1, -6, 4, -5],
    [1, 3, 1, 2, 3, 1],
    [1, 2, 1, -3, 3, -2],
    [2, 2, 1, 9, -2, 8],
    [2, 0, 3, -4, 5, -5],
    [4, 0, 10, -2, 21, -4],
  ];
  doc.lines(main, cx - 16, by + 1, [1, 1], "S");
  // Seconde descente verticale (deuxième jambage de la grappe).
  doc.lines([[2, 2, 0, 8, -2, 7]], cx - 7, by - 4, [1, 1], "S");
  doc.setLineCap("butt");
  doc.setLineJoin("miter");
}

function sealPDF(doc: jsPDF, cx: number, cy: number, R: number, accent: string, lang: string) {
  const [ar, ag, ab] = hexToRgb(accent);
  doc.setFillColor(ar, ag, ab);
  doc.circle(cx, cy, R, "F");
  doc.setFillColor(255, 255, 255);
  doc.circle(cx, cy, R - 1.4, "F");
  doc.setDrawColor(224, 161, 0);
  doc.setLineWidth(0.4);
  doc.circle(cx, cy, R - 1.4, "S");
  starPDF(doc, cx, cy - 0.6, R * 0.42, R * 0.17, 5, accent);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.setTextColor(ar, ag, ab);
  doc.text("TELI", cx, cy + R * 0.5, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(3.6);
  doc.setTextColor(138, 129, 120);
  doc.text((lang || "").toUpperCase(), cx, cy + R * 0.78, { align: "center" });
}

export function newDoc(): jsPDF {
  return new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
}

/** Dessine un certificat complet sur la page courante de `doc`. */
export function drawCertificate(doc: jsPDF, d: CertData, qrData: string | null): void {
  const W = 297, H = 210;
  const accent = d.accent;
  const [ar, ag, ab] = hexToRgb(accent);
  const full = fullNameOf(d.firstName, d.lastName);
  const body = fillTpl(d.bodyTpl, d);

  if (d.template === "moderne") {
    doc.setFillColor(255, 255, 255); doc.rect(0, 0, W, H, "F");
    doc.setFillColor(BORDER[0], BORDER[1], BORDER[2]); doc.rect(0, 0, W, 6, "F");
    doc.setFillColor(BORDER[0], BORDER[1], BORDER[2]); doc.rect(0, 0, 12, H, "F");
    const LX = 26;
    if (d.logo) { const w = 16 * d.logoRatio; addRoundedImage(doc, d.logo, imgFmt(d.logo), LX, 20, w, 16, 2); }
    else {
      doc.setFillColor(ar, ag, ab); doc.roundedRect(LX, 20, 12, 12, 3, 3, "F");
      doc.setFont("helvetica", "bold"); doc.setTextColor(255, 255, 255); doc.setFontSize(13); doc.text("T", LX + 6, 28.5, { align: "center" });
      doc.setTextColor(26, 23, 20); doc.text("TELI", LX + 16, 26);
      doc.setFont("helvetica", "normal"); doc.setTextColor(138, 129, 120); doc.setFontSize(7); doc.text("LEARN AFRICAN LANGUAGES", LX + 16, 31);
    }
    doc.setFont("times", "bold"); doc.setTextColor(26, 23, 20); doc.setFontSize(30); doc.text(d.title.toUpperCase(), LX, 60);
    doc.setDrawColor(224, 161, 0); doc.setLineWidth(0.8); doc.line(LX, 66, LX + 40, 66);
    doc.setFont("helvetica", "normal"); doc.setTextColor(138, 129, 120); doc.setFontSize(11); doc.text("Ce certificat est fièrement décerné à", LX, 82);
    doc.setFont("times", "bold"); doc.setTextColor(ar, ag, ab); doc.setFontSize(40); doc.text(full, LX, 100);
    doc.setDrawColor(236, 232, 226); doc.setLineWidth(0.3); doc.line(LX, 106, LX + 150, 106);
    doc.setFont("helvetica", "normal"); doc.setTextColor(64, 58, 52); doc.setFontSize(12.5);
    doc.text(doc.splitTextToSize(body, 210), LX, 120, { lineHeightFactor: 1.5 });
    if (d.sign) { const w = 10 * d.signRatio; doc.addImage(d.sign, imgFmt(d.sign), LX, 156, w, 10); }
    doc.setDrawColor(205, 199, 189); doc.setLineWidth(0.3); doc.line(LX, 170, LX + 60, 170);
    doc.setFont("times", "normal"); doc.setTextColor(26, 23, 20); doc.setFontSize(12); doc.text(d.signName, LX, 176);
    doc.setFont("helvetica", "normal"); doc.setTextColor(138, 129, 120); doc.setFontSize(8); doc.text(d.signRole.toUpperCase(), LX, 181);
    doc.setFont("times", "normal"); doc.setTextColor(26, 23, 20); doc.setFontSize(12); doc.text(d.dateStr, LX + 90, 176);
    doc.setFont("helvetica", "normal"); doc.setTextColor(138, 129, 120); doc.setFontSize(8); doc.text(d.location.toUpperCase(), LX + 90, 181);
    sealPDF(doc, 262, 38, 18, accent, d.language);
    if (qrData) {
      doc.addImage(qrData, "PNG", 258, 158, 22, 22);
      doc.setFontSize(6); doc.setTextColor(138, 129, 120); doc.text("Scanner pour vérifier", 269, 184, { align: "center" });
    }
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(150, 143, 134);
    doc.text(`Certificat N° ${d.id} · learning.teli-app.com`, LX, 200);
    return;
  }

  /* ----- Modèle CLASSIQUE ----- */
  doc.setFillColor(252, 250, 245); doc.rect(0, 0, W, H, "F");
  drawBubbles(doc);
  doc.setDrawColor(BORDER[0], BORDER[1], BORDER[2]); doc.setLineWidth(1.6); doc.roundedRect(10, 10, W - 20, H - 20, 3, 3, "S");
  doc.setDrawColor(224, 161, 0); doc.setLineWidth(0.4); doc.roundedRect(14, 14, W - 28, H - 28, 2, 2, "S");

  // Crochets d'angle tricolores pour égayer le cadre.
  cornerMark(doc, 19, 19, 1, 1, 8, PALETTE[0]);
  cornerMark(doc, W - 19, 19, -1, 1, 8, PALETTE[1]);
  cornerMark(doc, 19, H - 19, 1, -1, 8, PALETTE[2]);
  cornerMark(doc, W - 19, H - 19, -1, -1, 8, PALETTE[0]);

  if (d.logo) { const w = 16 * d.logoRatio; addRoundedImage(doc, d.logo, imgFmt(d.logo), W / 2 - w / 2, 24, w, 16, 2); }
  else {
    addRoundedImage(doc, Logo, "PNG", W / 2 - 22, 26, 11, 11, 1.6);
    doc.setFont("helvetica", "bold"); doc.setTextColor(26, 23, 20); doc.setFontSize(15); doc.text("TELI", W / 2 - 8, 33.5);
    // doc.setFont("helvetica", "normal"); doc.setTextColor(138, 129, 120); doc.setFontSize(6.5); doc.text("LEARN AFRICAN LANGUAGES", W / 2 - 8, 35.5);
  }

  doc.setFont("times", "bold"); doc.setTextColor(26, 23, 20); doc.setFontSize(30); doc.text(d.title, W / 2, 66, { align: "center" });
  tricolorRule(doc, W / 2, 71, 16);

  doc.setFont("helvetica", "normal"); doc.setTextColor(138, 129, 120); doc.setFontSize(11); doc.text("Ce certificat est fièrement décerné à", W / 2, 84, { align: "center" });

  doc.setFont("times", "bold"); doc.setTextColor(ar, ag, ab); doc.setFontSize(42); doc.text(full, W / 2, 104, { align: "center" });
  doc.setDrawColor(236, 232, 226); doc.setLineWidth(0.3); doc.line(W / 2 - 70, 110, W / 2 + 70, 110);
  doc.setFillColor(PALETTE[0][0], PALETTE[0][1], PALETTE[0][2]); doc.circle(W / 2 - 70, 110, 1, "F");
  doc.setFillColor(PALETTE[2][0], PALETTE[2][1], PALETTE[2][2]); doc.circle(W / 2 + 70, 110, 1, "F");

  doc.setFont("helvetica", "normal"); doc.setTextColor(64, 58, 52); doc.setFontSize(12.5);
  doc.text(doc.splitTextToSize(body, 200), W / 2, 124, { align: "center", lineHeightFactor: 1.55 });

  const footY = 176;
  if (d.sign) { const w = 10 * d.signRatio; doc.addImage(d.sign, imgFmt(d.sign), 70 - w / 2, footY - 18, w, 10); }
  doc.setFont("times", "normal"); doc.setTextColor(26, 23, 20); doc.setFontSize(12); doc.text(d.signName, 70, footY, { align: "center" });
  doc.setDrawColor(205, 199, 189); doc.setLineWidth(0.3); doc.line(45, footY + 3, 95, footY + 3);
  if (!d.sign) drawSignature(doc, 70, footY + 11);

  sealPDF(doc, W / 2, footY - 8, 17, accent, d.language);

  
  doc.setFont("times", "normal"); doc.setTextColor(26, 23, 20); doc.setFontSize(12); doc.text(d.dateStr, W - 70, footY, { align: "center" });
  doc.setDrawColor(205, 199, 189); doc.setLineWidth(0.3); doc.line(W - 95, footY + 3, W - 45, footY + 3);
  // doc.setFont("helvetica", "normal"); doc.setTextColor(138, 129, 120); doc.setFontSize(8); doc.text(d.location.toUpperCase(), W - 70, footY + 4.5, { align: "center" });

  // if (qrData) {
  //   doc.addImage(qrData, "PNG", W - 34, 164, 15, 15);
  //   doc.setFont("helvetica", "normal"); doc.setFontSize(5.5); doc.setTextColor(150, 143, 134); doc.text("Scanner pour vérifier", W - 26.5, 182, { align: "center" });
  // }
  doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(150, 143, 134);
  // doc.text(`Certificat N° ${d.id} · Vérifiable sur learning.teli-app.com`, W / 2, 192, { align: "center" });
}
