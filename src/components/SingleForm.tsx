import { useCert } from "../hooks/certContext";
import { Field, Input, Select } from "./ui";
import { LANGS } from "../theme";

export default function SingleForm() {
  const { s, set } = useCert();
  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Prénom">
          <Input value={s.firstName} placeholder="Marie" onChange={(e) => set("firstName", e.target.value)} />
        </Field>
        <Field label="Nom">
          <Input value={s.lastName} placeholder="Dupont" onChange={(e) => set("lastName", e.target.value)} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Langue apprise">
          <Select value={s.language} onChange={(e) => set("language", e.target.value)}>
            {LANGS.map((l) => <option key={l} value={l}>{l}</option>)}
          </Select>
        </Field>
        <Field label="Date">
          <Input value={s.dateStr} onChange={(e) => set("dateStr", e.target.value)} />
        </Field>
      </div>
    </div>
  );
}
