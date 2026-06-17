import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Package, FileText } from "lucide-react";
import { useCert } from "../hooks/certContext";
import { Button } from "./ui";

export default function Actions() {
  const { s, progress, generateSingle, generateBulk } = useCert();
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<void>) => { setBusy(true); try { await fn(); } finally { setBusy(false); } };

  return (
    <div className="mt-4">
      <AnimatePresence mode="wait">
        {s.mode === "single" ? (
          <motion.div key="single" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Button className="w-full" icon={Download} disabled={busy} onClick={() => run(generateSingle)}>
              Télécharger le certificat (PDF)
            </Button>
          </motion.div>
        ) : (
          <motion.div key="bulk" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-2.5">
            <Button className="flex-1" icon={Package} disabled={progress.running} onClick={() => generateBulk("zip")}>
              Générer le ZIP
            </Button>
            <Button variant="ghost" className="flex-1" icon={FileText} disabled={progress.running} onClick={() => generateBulk("merged")}>
              PDF unique
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {progress.running && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-3 overflow-hidden">
            <div className="h-2 rounded-full bg-line overflow-hidden">
              <motion.div className="h-full rounded-full" style={{ background: "var(--accent)" }} animate={{ width: `${progress.value * 100}%` }} transition={{ duration: 0.2 }} />
            </div>
            <div className="text-[12.5px] text-sub mt-1.5">{progress.label}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
