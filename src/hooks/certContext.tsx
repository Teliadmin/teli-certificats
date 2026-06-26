import { createContext, useContext, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import JSZip from "jszip";
import type { CertData, CertState, Progress } from "../types";
import { accentFor } from "../theme";
import { newDoc, drawCertificate } from "../lib/pdf";
import { makeQR } from "../lib/qr";
import { parseCsv } from "../lib/csv";
import { download, makeId, slug, todayFR, verifyUrl } from "../lib/helpers";

const INITIAL: CertState = {
  mode: "single",
  template: "classique",
  firstName: "",
  lastName: "",
  language: "Yoruba",
  dateStr: todayFR(),
  title: "Certificat de Réussite",
  bodyTpl: "Pour avoir suivi et complété avec succès la formation de langue {langue} dispensée par la plateforme TELI.",
  signName: "Teli",
  signRole: "Administrateur, TELI",
  location: "Cotonou, Bénin",
  idPrefix: "TELI",
  accentOverride: null,
  logo: null, logoRatio: 1,
  sign: null, signRatio: 1,
  qr: true,
  csvRows: [],
};

interface CertContextValue {
  s: CertState;
  set: <K extends keyof CertState>(key: K, value: CertState[K]) => void;
  accent: string;
  active: CertData;
  progress: Progress;
  toast: string | null;
  importCsv: (file: File) => Promise<void>;
  generateSingle: () => Promise<void>;
  generateBulk: (kind: "zip" | "merged") => Promise<void>;
}

const Ctx = createContext<CertContextValue | null>(null);

export function useCert(): CertContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCert must be used within CertProvider");
  return v;
}

export function CertProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<CertState>(INITIAL);
  const [progress, setProgress] = useState<Progress>({ running: false, value: 0, label: "" });
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  const set = <K extends keyof CertState>(key: K, value: CertState[K]) => {
    setS((p) => ({ ...p, [key]: value }));
  };

  const accent = accentFor(s.language, s.accentOverride);

  const flash = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  };

  const dataFor = (first: string, last: string, language: string): CertData => ({
    template: s.template,
    firstName: first,
    lastName: last,
    language: language || s.language,
    accent: accentFor(language || s.language, s.accentOverride),
    dateStr: s.dateStr,
    title: s.title,
    bodyTpl: s.bodyTpl,
    signName: s.signName,
    signRole: s.signRole,
    location: s.location,
    logo: s.logo, logoRatio: s.logoRatio,
    sign: s.sign, signRatio: s.signRatio,
    qr: s.qr,
    id: makeId(s.idPrefix),
  });

  // Données affichées dans l'aperçu (1re ligne du CSV en mode masse).
  const active: CertData = useMemo(() => {
    let first = s.firstName || "Prénom";
    let last = s.lastName || "Nom";
    let language = s.language;
    if (s.mode === "bulk" && s.csvRows.length) {
      first = s.csvRows[0].first || "Prénom";
      last = s.csvRows[0].last || "Nom";
      language = s.csvRows[0].language || s.language;
    }
    return {
      template: s.template, firstName: first, lastName: last, language,
      accent: accentFor(language, s.accentOverride),
      dateStr: s.dateStr, title: s.title, bodyTpl: s.bodyTpl,
      signName: s.signName, signRole: s.signRole, location: s.location,
      logo: s.logo, logoRatio: s.logoRatio, sign: s.sign, signRatio: s.signRatio,
      qr: s.qr, id: "—",
    };
  }, [s]);

  const importCsv = async (file: File) => {
    const rows = await parseCsv(file);
    set("csvRows", rows);
    flash(rows.length ? `${rows.length} apprenant(s) chargé(s).` : "Aucune ligne valide trouvée.");
  };

  const generateSingle = async () => {
    const d = dataFor(s.firstName || "Prénom", s.lastName || "Nom", s.language);
    const doc = newDoc();
    const qr = s.qr ? await makeQR(verifyUrl(d.id)) : null;
    drawCertificate(doc, d, qr);
    doc.save(`certificat-${slug(d.firstName)}-${slug(d.lastName)}.pdf`);
    flash("✅ Certificat téléchargé.");
  };

  const generateBulk = async (kind: "zip" | "merged") => {
    const rows = s.csvRows;
    if (!rows.length) { flash("Importe d'abord un fichier CSV."); return; }
    setProgress({ running: true, value: 0, label: "Préparation…" });

    try {
      if (kind === "merged") {
        const doc = newDoc();
        for (let i = 0; i < rows.length; i++) {
          if (i > 0) doc.addPage("a4", "landscape");
          const d = dataFor(rows[i].first, rows[i].last, rows[i].language);
          const qr = s.qr ? await makeQR(verifyUrl(d.id)) : null;
          drawCertificate(doc, d, qr);
          setProgress({ running: true, value: (i + 1) / rows.length, label: `Génération ${i + 1}/${rows.length}…` });
          if (i % 5 === 0) await new Promise((r) => setTimeout(r));
        }
        doc.save("certificats-teli.pdf");
        flash(`✅ ${rows.length} certificats dans un seul PDF.`);
      } else {
        const zip = new JSZip();
        for (let i = 0; i < rows.length; i++) {
          const d = dataFor(rows[i].first, rows[i].last, rows[i].language);
          const doc = newDoc();
          const qr = s.qr ? await makeQR(verifyUrl(d.id)) : null;
          drawCertificate(doc, d, qr);
          zip.file(`certificat-${slug(d.firstName)}-${slug(d.lastName)}.pdf`, doc.output("arraybuffer"));
          setProgress({ running: true, value: (i + 1) / rows.length, label: `Génération ${i + 1}/${rows.length}…` });
          if (i % 4 === 0) await new Promise((r) => setTimeout(r));
        }
        setProgress({ running: true, value: 1, label: "Compression du ZIP…" });
        const blob = await zip.generateAsync({ type: "blob" });
        download(blob, "certificats-teli.zip");
        flash(`✅ ${rows.length} certificats générés (ZIP).`);
      }
    } catch (e) {
      flash("⚠️ Erreur : " + (e as Error).message);
    } finally {
      setProgress({ running: false, value: 0, label: "" });
    }
  };

  const value: CertContextValue = { s, set, accent, active, progress, toast, importCsv, generateSingle, generateBulk };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
