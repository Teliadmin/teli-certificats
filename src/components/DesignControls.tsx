import { Palette } from "lucide-react";
import { useCert } from "../hooks/certContext";
import { Field, SectionTitle, Segmented, Button } from "./ui";
import type { Template } from "../types";

export default function DesignControls() {
  const { s, set, accent } = useCert();

  return (
    <>
      <SectionTitle><Palette size={16} /> Modèle &amp; couleur</SectionTitle>
      <Field label="Modèle">
        <Segmented<Template>
          layoutId="tpl"
          value={s.template}
          onChange={(v) => set("template", v)}
          options={[{ value: "classique", label: "Classique" }, { value: "moderne", label: "Moderne" }]}
        />
      </Field>
      <Field label="Couleur d'accent">
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-xl border border-line" style={{ background: accent }} />
          <input
            type="color"
            value={accent}
            onChange={(e) => set("accentOverride", e.target.value)}
            className="w-11 h-10 rounded-xl border border-line cursor-pointer"
          />
          <Button variant="ghost" className="!py-2 !px-3 !text-[12.5px]" onClick={() => set("accentOverride", null)}>
            Auto (langue)
          </Button>
        </div>
      </Field>
    </>
  );
}
