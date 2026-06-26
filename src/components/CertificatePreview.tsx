import { motion } from "framer-motion";
import { useCert } from "../hooks/certContext";
import { cap, fillTpl } from "../lib/helpers";
import Logo from "../assets/Logo AML.png"

function starPts(cx: number, cy: number, outer: number, inner: number, points: number): string {
  const p: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI / points) * i - Math.PI / 2;
    p.push(`${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`);
  }
  return p.join(" ");
}

function Seal({ accent, lang }: { accent: string; lang: string }) {
  return (
    <motion.svg
      viewBox="0 0 100 100" width="100%" height="100%"
      initial={{ rotate: -12, scale: 0.85, opacity: 0 }}
      animate={{ rotate: 0, scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
    >
      <circle cx="50" cy="50" r="48" fill={accent} />
      <circle cx="50" cy="50" r="40" fill="#fff" />
      <circle cx="50" cy="50" r="40" fill="none" stroke="#E0A100" strokeWidth="2" />
      <polygon points={starPts(50, 46, 17, 7, 5)} fill={accent} />
      <text x="50" y="70" textAnchor="middle" fontFamily="Plus Jakarta Sans, sans-serif" fontSize="11" fontWeight="800" fill={accent}>TELI</text>
      <text x="50" y="82" textAnchor="middle" fontFamily="Plus Jakarta Sans, sans-serif" fontSize="6.5" fill="#8A8178">{(lang || "").toUpperCase()}</text>
    </motion.svg>
  );
}

export default function CertificatePreview() {
  const { active } = useCert();
  const d = active;
  const fullName = `${cap(d.firstName)} ${(d.lastName || "").toUpperCase()}`.trim();

  return (
    <div className="preview-stage">
      <motion.div
        key={d.template}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className={`cert ${d.template}`}
        style={{ ["--accent" as string]: d.accent }}
      >
        <div className="frame" />
        <div className="frame2" />
        <div className="inner">
          <div className="c-logo">
            {d.logo ? (
              <img className="logo-img" src={Logo} alt="logo" />
            ) : (
              <>
                <div className="m"><img src={Logo} alt="" className="rounded-md" /></div>
                {/* <div className="wm"><b className="pr-28">TELI</b><span>Learn African Languages</span></div> */}
              </>
            )}
          </div>
          <div className="c-title">{d.title}</div>
          <div className="c-rule" />
          <div className="c-sub">Ce certificat est fièrement décerné à</div>
          <div className="c-name">{fullName}</div>
          <div className="c-nameline" />
          <div className="c-body">{fillTpl(d.bodyTpl, d)}</div>
          <div className="c-foot">
            <div className="blk">
              {d.sign && <img className="sig-img" src={d.sign} alt="signature" />}
              {/* <div className="sigline" /> */}
              <div className="sig-name">{d.signName}</div>
              <div className="sigline" />
              {/* <div className="sig-role">{d.signRole}</div> */}
            </div>
            <div className="seal"><Seal accent={d.accent} lang={d.language} /></div>
            <div className="blk">
              <div className="date-val">{d.dateStr}</div>
              <div className="sigline" />
              {/* <div className="date-lbl">{d.location}</div> */}
            </div>
          </div>
          {/* <div className="c-id">Certificat N° {d.id} · learning.teli-app.com</div> */}
        </div>
      </motion.div>
    </div>
  );
}
