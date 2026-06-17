import { useRef } from "react";
import { ChevronDown, Image as ImageIcon, PenLine, X } from "lucide-react";
import { motion } from "framer-motion";
import { useCert } from "../hooks/certContext";
import { Field, Input, Textarea, Toggle } from "./ui";
import { readImage } from "../lib/helpers";

function FileRow({ label, icon, name, onPick, onClear }: {
  label: string; icon: React.ReactNode; name: string | null; onPick: (f: File) => void; onClear: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="flex items-center gap-2.5 border border-dashed border-line rounded-xl px-3 py-2.5 text-[13px]">
      <span>{icon}</span>
      <button onClick={() => ref.current?.click()} className="font-bold text-ink">{label}</button>
      {name && (
        <span className="inline-flex items-center gap-1.5 bg-cream rounded-full px-2.5 py-1 text-[12px]">
          {name}
          <button onClick={onClear} className="text-sub"><X size={13} /></button>
        </span>
      )}
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onPick(f); }} />
    </div>
  );
}

export default function Customization() {
  const { s, set } = useCert();

  const pickLogo = async (f: File) => { const { url, ratio } = await readImage(f); set("logo", url); set("logoRatio", ratio); };
  const pickSign = async (f: File) => { const { url, ratio } = await readImage(f); set("sign", url); set("signRatio", ratio); };

  return (
    <details className="border border-line rounded-2xl mt-2 group">
      <summary className="cursor-pointer px-4 py-3 font-bold text-[13.5px] flex items-center justify-between list-none">
        Personnalisation (texte, logo, signature)
        <ChevronDown size={16} className="text-sub transition-transform group-open:rotate-180" />
      </summary>
      <motion.div className="px-4 pb-4">
        <Field label="Titre du certificat">
          <Input value={s.title} onChange={(e) => set("title", e.target.value)} />
        </Field>
        <Field label="Texte (variables : {prenom} {nom} {langue})">
          <Textarea rows={3} value={s.bodyTpl} onChange={(e) => set("bodyTpl", e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Signataire"><Input value={s.signName} onChange={(e) => set("signName", e.target.value)} /></Field>
          <Field label="Fonction"><Input value={s.signRole} onChange={(e) => set("signRole", e.target.value)} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Lieu"><Input value={s.location} onChange={(e) => set("location", e.target.value)} /></Field>
          <Field label="Préfixe N°"><Input value={s.idPrefix} onChange={(e) => set("idPrefix", e.target.value)} /></Field>
        </div>
        <Field label="Logo (PNG/JPG)">
          <FileRow label="Choisir un logo" icon={<ImageIcon size={15} className="text-sub" />} name={s.logo ? "logo importé" : null} onPick={pickLogo} onClear={() => set("logo", null)} />
        </Field>
        <Field label="Signature manuscrite (PNG)">
          <FileRow label="Choisir une signature" icon={<PenLine size={15} className="text-sub" />} name={s.sign ? "signature importée" : null} onPick={pickSign} onClear={() => set("sign", null)} />
        </Field>
        <div className="mt-2">
          <Toggle checked={s.qr} onChange={(v) => set("qr", v)} label="Ajouter un QR code de vérification" />
        </div>
      </motion.div>
    </details>
  );
}
