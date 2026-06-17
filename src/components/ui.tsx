import type { ReactNode, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ButtonHTMLAttributes } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

type MotionButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onAnimationStart" | "onAnimationEnd" | "onDrag" | "onDragStart" | "onDragEnd"
>;

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`bg-white rounded-4xl border border-line shadow-soft ${className}`}>{children}</div>;
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-[15px] font-extrabold mb-4 flex items-center gap-2">{children}</h2>;
}

export function Field({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <label className="block mb-3.5">
      <span className="text-[11px] font-bold uppercase tracking-wide text-sub block mb-1.5">{label}</span>
      {children}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2.5 rounded-xl border border-line text-[14px] text-ink outline-none focus:border-coral transition-colors ${props.className || ""}`}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full px-3 py-2.5 rounded-xl border border-line text-[14px] text-ink outline-none focus:border-coral transition-colors leading-relaxed ${props.className || ""}`}
    />
  );
}

export function Select({ children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="w-full px-3 py-2.5 rounded-xl border border-line text-[14px] text-ink outline-none focus:border-coral bg-white transition-colors"
    >
      {children}
    </select>
  );
}

interface BtnProps extends MotionButtonProps {
  variant?: "primary" | "ghost";
  icon?: LucideIcon;
  children?: ReactNode;
}

export function Button({ variant = "primary", icon: Icon, children, className = "", style, ...rest }: BtnProps) {
  const base = "inline-flex items-center justify-center gap-2 font-extrabold text-[14px] px-4 py-3 rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "text-white",
    ghost: "bg-white border border-line text-ink hover:bg-cream",
  };
  const variantStyle = variant === "primary" ? { background: "var(--accent)" } : undefined;
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      className={`${base} ${variants[variant]} ${className}`}
      style={{ ...variantStyle, ...style }}
      {...rest}
    >
      {Icon && <Icon size={17} />}
      {children}
    </motion.button>
  );
}

/** Contrôle segmenté avec surbrillance animée (layoutId). */
export function Segmented<T extends string>({
  options, value, onChange, layoutId,
}: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void; layoutId: string }) {
  return (
    <div className="flex gap-1.5 p-1 rounded-2xl bg-cream">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className="relative flex-1 px-3 py-2 rounded-xl text-[13px] font-bold transition-colors"
            style={{ color: active ? "#fff" : "var(--sub, #8A8178)" }}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-xl"
                style={{ background: "var(--accent)" }}
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative z-10">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode }) {
  return (
    <button onClick={() => onChange(!checked)} className="flex items-center gap-3 w-full text-left">
      <span
        className="w-10 h-6 rounded-full p-0.5 flex transition-colors shrink-0"
        style={{ background: checked ? "var(--accent)" : "#d8d2c8", justifyContent: checked ? "flex-end" : "flex-start" }}
      >
        <motion.span layout transition={{ type: "spring", stiffness: 500, damping: 34 }} className="w-5 h-5 rounded-full bg-white shadow" />
      </span>
      <span className="text-[13px] text-ink">{label}</span>
    </button>
  );
}
