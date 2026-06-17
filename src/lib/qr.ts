import { toDataURL } from "qrcode";

/** Génère un QR code en DataURL (PNG). Renvoie null en cas d'échec. */
export async function makeQR(text: string, size = 140): Promise<string | null> {
  try {
    return await toDataURL(text, {
      width: size,
      margin: 1,
      color: { dark: "#1A1714", light: "#ffffff" },
      errorCorrectionLevel: "M",
    });
  } catch {
    return null;
  }
}
