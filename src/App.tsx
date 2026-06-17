import { motion, AnimatePresence } from "framer-motion";
import { Eye } from "lucide-react";
import { CertProvider, useCert } from "./hooks/certContext";
import { C } from "./theme";
import Topbar from "./components/Topbar";
import { Card, SectionTitle } from "./components/ui";
import DesignControls from "./components/DesignControls";
import SingleForm from "./components/SingleForm";
import CsvImport from "./components/CsvImport";
import Customization from "./components/Customization";
import CertificatePreview from "./components/CertificatePreview";
import Actions from "./components/Actions";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as const } }),
};

function Tabs() {
  const { s, set } = useCert();
  const tabs: { id: "single" | "bulk"; label: string }[] = [
    { id: "single", label: "Individuel" },
    { id: "bulk", label: "Import CSV (masse)" },
  ];
  return (
    <div className="flex gap-1.5 p-1.5 rounded-2xl bg-cream mb-5">
      {tabs.map((t) => {
        const active = s.mode === t.id;
        return (
          <button key={t.id} onClick={() => set("mode", t.id)} className="relative flex-1 py-2.5 rounded-xl text-[13.5px] font-bold transition-colors"
            style={{ color: active ? C.coral : C.sub }}>
            {active && <motion.span layoutId="tab" className="absolute inset-0 rounded-xl bg-white shadow-soft" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
            <span className="relative z-10">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function Workspace() {
  const { s, accent, toast } = useCert();
  return (
    <div className="min-h-screen bg-cream" style={{ ["--accent" as string]: accent }}>
      <Topbar />
      <main className="max-w-[1280px] mx-auto p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-[minmax(0,430px)_minmax(0,1fr)] gap-6 items-start">
        {/* Colonne contrôles */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show">
          <Card className="p-5">
            <Tabs />
            <DesignControls />
            <div className="my-4 h-px bg-line" />
            <AnimatePresence mode="wait">
              {s.mode === "single" ? (
                <motion.div key="single" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.25 }}>
                  <SingleForm />
                </motion.div>
              ) : (
                <motion.div key="bulk" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.25 }}>
                  <CsvImport />
                </motion.div>
              )}
            </AnimatePresence>
            <Customization />
          </Card>
        </motion.div>

        {/* Colonne aperçu */}
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="show" className="lg:sticky lg:top-[88px]">
          <Card className="p-5">
            <SectionTitle><Eye size={16} /> Aperçu en direct</SectionTitle>
            <CertificatePreview />
            <Actions />
            <div className="mt-4 text-[12.5px] text-sub bg-cream rounded-2xl p-3.5 leading-relaxed">
              💡 Change le modèle, la couleur, le texte, importe ton logo et ta signature. Pour coller exactement à ton design pré-défini, partage-moi tes couleurs / le visuel et je l'ajuste au pixel.
            </div>
          </Card>
        </motion.div>
      </main>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-ink text-white text-[13.5px] font-semibold px-5 py-3 rounded-2xl shadow-lift z-50"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <CertProvider>
      <Workspace />
    </CertProvider>
  );
}
