import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";
import { C } from "../theme";
import Logo from "../assets/Logo AML.png"

export default function Topbar() {
  return (
    <header className="flex items-center gap-3 px-5 sm:px-7 py-4 bg-white border-b border-line sticky top-0 z-30">
      <motion.div
        initial={{ scale: 0.8, rotate: -8, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 18 }}
        className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-lg"
        // style={{ background: `linear-gradient(135deg, ${C.coral}, ${C.coralDeep})` }}
      >
        <img src={Logo} alt="" className="rounded-lg" />
      </motion.div>
      <div className="leading-tight">
        <b className="text-[17px] tracking-tight block">TELI</b>
        <span className="text-[11px] text-sub">Plateforme d'apprentissage de langues africaines</span>
      </div>
      <div className="flex-1" />
      <span className="hidden sm:inline-flex items-center gap-1.5 text-[12px] font-bold text-coral bg-coral-soft px-3 py-1.5 rounded-full">
        <GraduationCap size={14} /> Certificats de langue
      </span>
    </header>
  );
}
