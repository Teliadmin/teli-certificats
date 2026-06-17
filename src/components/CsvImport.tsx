import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileDown, FileSpreadsheet } from "lucide-react";
import { useCert } from "../hooks/certContext";
import { buildTemplateCsv } from "../lib/csv";
import { download } from "../lib/helpers";

export default function CsvImport() {
  const { s, importCsv } = useCert();
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const onFile = (file?: File | null) => { if (file) importCsv(file); };

  return (
    <div>
      <motion.div
        onClick={() => inputRef.current?.click()}
        onDragEnter={(e) => { e.preventDefault(); setDrag(true); }}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={(e) => { e.preventDefault(); setDrag(false); }}
        onDrop={(e) => { e.preventDefault(); setDrag(false); onFile(e.dataTransfer.files?.[0]); }}
        animate={{ scale: drag ? 1.02 : 1 }}
        className="border-2 border-dashed rounded-3xl p-7 text-center cursor-pointer transition-colors"
        style={{ borderColor: drag ? "var(--accent)" : "#ECE8E2", background: drag ? "rgba(0,0,0,.02)" : "transparent" }}
      >
        <div className="w-12 h-12 rounded-2xl bg-cream flex items-center justify-center mx-auto mb-2">
          <FileSpreadsheet size={22} className="text-coral" />
        </div>
        <div className="font-bold text-[14px]">Dépose ton fichier CSV ici</div>
        <div className="text-[12px] text-sub mt-0.5">ou clique pour parcourir · colonnes : prenom, nom, langue</div>
        <input ref={inputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
      </motion.div>

      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <button
          onClick={() => download(new Blob([buildTemplateCsv()], { type: "text/csv;charset=utf-8" }), "modele-certificats-teli.csv")}
          className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-ink bg-white border border-line rounded-xl px-3 py-2 hover:bg-cream transition-colors"
        >
          <FileDown size={14} /> Modèle CSV
        </button>
        <span className="text-[12px] text-sub">Langue par défaut si vide : <b>{s.language}</b></span>
      </div>

      <AnimatePresence>
        {s.csvRows.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="mt-4 overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[12px] font-bold text-coral bg-coral-soft px-2.5 py-1 rounded-full">{s.csvRows.length}</span>
              <span className="text-[12px] text-sub">apprenant(s) prêt(s)</span>
            </div>
            <div className="max-h-[220px] overflow-auto border border-line rounded-2xl">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wide text-sub">
                    <th className="text-left px-3 py-2 sticky top-0 bg-[#fbfaf8]">#</th>
                    <th className="text-left px-3 py-2 sticky top-0 bg-[#fbfaf8]">Prénom</th>
                    <th className="text-left px-3 py-2 sticky top-0 bg-[#fbfaf8]">Nom</th>
                    <th className="text-left px-3 py-2 sticky top-0 bg-[#fbfaf8]">Langue</th>
                  </tr>
                </thead>
                <tbody>
                  {s.csvRows.slice(0, 200).map((r, i) => (
                    <tr key={i} className="border-t border-line">
                      <td className="px-3 py-2 text-sub">{i + 1}</td>
                      <td className="px-3 py-2">{r.first}</td>
                      <td className="px-3 py-2">{r.last}</td>
                      <td className="px-3 py-2">{r.language || s.language}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
