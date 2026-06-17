import { jsPDF } from "jspdf";
import type { CertData } from "../types";
import { cap, fillTpl, fullNameOf } from "./helpers";

type RGB = [number, number, number];

function hexToRgb(h: string): RGB {
  let x = h.replace("#", "");
  if (x.length === 3) x = x.split("").map((c) => c + c).join("");
  return [parseInt(x.slice(0, 2), 16), parseInt(x.slice(2, 4), 16), parseInt(x.slice(4, 6), 16)];
}

function imgFmt(dataUrl: string): "PNG" | "JPEG" {
  return /^data:image\/png/i.test(dataUrl) ? "PNG" : "JPEG";
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
    doc.setFillColor(ar, ag, ab); doc.rect(0, 0, W, 6, "F");
    doc.setFillColor(ar, ag, ab); doc.rect(0, 0, 12, H, "F");
    const LX = 26;
    if (d.logo) { const w = 16 * d.logoRatio; doc.addImage(d.logo, imgFmt(d.logo), LX, 20, w, 16); }
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
  doc.setDrawColor(ar, ag, ab); doc.setLineWidth(1.6); doc.roundedRect(10, 10, W - 20, H - 20, 3, 3, "S");
  doc.setDrawColor(224, 161, 0); doc.setLineWidth(0.4); doc.roundedRect(14, 14, W - 28, H - 28, 2, 2, "S");

  if (d.logo) { const w = 16 * d.logoRatio; doc.addImage(d.logo, imgFmt(d.logo), W / 2 - w / 2, 24, w, 16); }
  else {
    doc.setFillColor(ar, ag, ab); doc.roundedRect(W / 2 - 22, 26, 11, 11, 3, 3, "F");
    doc.setFont("helvetica", "bold"); doc.setTextColor(255, 255, 255); doc.setFontSize(12); doc.text("T", W / 2 - 16.5, 33.5, { align: "center" });
    doc.setTextColor(26, 23, 20); doc.setFontSize(15); doc.text("TELI", W / 2 - 8, 31);
    doc.setFont("helvetica", "normal"); doc.setTextColor(138, 129, 120); doc.setFontSize(6.5); doc.text("LEARN AFRICAN LANGUAGES", W / 2 - 8, 35.5);
  }

  doc.setFont("times", "bold"); doc.setTextColor(26, 23, 20); doc.setFontSize(30); doc.text(d.title, W / 2, 66, { align: "center" });
  doc.setDrawColor(224, 161, 0); doc.setLineWidth(0.7); doc.line(W / 2 - 14, 71, W / 2 + 14, 71);

  doc.setFont("helvetica", "normal"); doc.setTextColor(138, 129, 120); doc.setFontSize(11); doc.text("Ce certificat est fièrement décerné à", W / 2, 84, { align: "center" });

  doc.setFont("times", "bold"); doc.setTextColor(ar, ag, ab); doc.setFontSize(42); doc.text(full, W / 2, 104, { align: "center" });
  doc.setDrawColor(236, 232, 226); doc.setLineWidth(0.3); doc.line(W / 2 - 70, 110, W / 2 + 70, 110);

  doc.setFont("helvetica", "normal"); doc.setTextColor(64, 58, 52); doc.setFontSize(12.5);
  doc.text(doc.splitTextToSize(body, 200), W / 2, 124, { align: "center", lineHeightFactor: 1.55 });

  const footY = 176;
  if (d.sign) { const w = 10 * d.signRatio; doc.addImage(d.sign, imgFmt(d.sign), 70 - w / 2, footY - 18, w, 10); }
  doc.setDrawColor(205, 199, 189); doc.setLineWidth(0.3); doc.line(45, footY - 4, 95, footY - 4);
  doc.setFont("times", "normal"); doc.setTextColor(26, 23, 20); doc.setFontSize(12); doc.text(d.signName, 70, footY, { align: "center" });
  doc.setFont("helvetica", "normal"); doc.setTextColor(138, 129, 120); doc.setFontSize(8); doc.text(d.signRole.toUpperCase(), 70, footY + 4.5, { align: "center" });

  sealPDF(doc, W / 2, footY - 8, 17, accent, d.language);

  doc.setDrawColor(205, 199, 189); doc.setLineWidth(0.3); doc.line(W - 95, footY - 4, W - 45, footY - 4);
  doc.setFont("times", "normal"); doc.setTextColor(26, 23, 20); doc.setFontSize(12); doc.text(d.dateStr, W - 70, footY, { align: "center" });
  doc.setFont("helvetica", "normal"); doc.setTextColor(138, 129, 120); doc.setFontSize(8); doc.text(d.location.toUpperCase(), W - 70, footY + 4.5, { align: "center" });

  if (qrData) {
    doc.addImage(qrData, "PNG", W - 34, 164, 15, 15);
    doc.setFont("helvetica", "normal"); doc.setFontSize(5.5); doc.setTextColor(150, 143, 134); doc.text("Scanner pour vérifier", W - 26.5, 182, { align: "center" });
  }
  doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(150, 143, 134);
  doc.text(`Certificat N° ${d.id} · Vérifiable sur learning.teli-app.com`, W / 2, 192, { align: "center" });
}
