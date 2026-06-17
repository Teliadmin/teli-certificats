# TELI · Générateur de certificats (React + TypeScript)

Génère des certificats de réussite TELI en PDF — à l'unité (avec aperçu en direct) ou **en masse via CSV** (un PDF par apprenant, zippés). Tout se passe dans le navigateur, aucune donnée n'est envoyée en ligne.

Stack : **React 18 + TypeScript + Vite + Tailwind + Framer Motion**, avec `jsPDF` (PDF), `papaparse` (CSV), `jszip` (archive), `qrcode` (QR de vérification).

## Démarrer

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc (vérif. de types) + build de production
```

## Fonctionnalités

- **Individuel** : prénom, nom, langue → aperçu en direct → PDF (A4 paysage).
- **Masse (CSV)** : import `prenom,nom,langue`, aperçu en tableau, puis **ZIP** (un PDF par personne) ou **PDF unique** multi-pages. Barre de progression.
- **Deux modèles** : Classique (ornemental) et Moderne (épuré).
- **Couleur par langue** automatique (Yoruba = corail, Mina = teal, Fongbé = violet…), avec override manuel.
- **Personnalisation** : titre, texte (variables `{prenom} {nom} {langue}`), signataire, lieu, préfixe d'identifiant, logo, signature manuscrite.
- **QR code** de vérification (`learning.teli-app.com/verify/{id}`), activable.
- **Dynamisme** : reveals au montage, surbrillance d'onglet animée (layoutId), crossfade de modèle, dropzone réactive, progression et toast animés.

## Structure

```
src/
  types.ts                 Types du domaine (CertState, CertData, CsvRow…)
  theme.ts                 Palette + couleurs par langue
  lib/
    pdf.ts                 Dessin du certificat dans jsPDF (logique pure)
    qr.ts                  Génération du QR code
    csv.ts                 Parsing + normalisation CSV
    helpers.ts             Utilitaires (slug, id, date, download, images)
  hooks/
    certContext.tsx        État global + actions (single, ZIP, merged)
  components/
    ui.tsx                 Primitives (Field, Input, Button, Segmented, Toggle…)
    Topbar / DesignControls / SingleForm / CsvImport /
    Customization / CertificatePreview / Actions
  App.tsx                  Assemblage + onglets + toast
```

## Brancher à TELI

Le PDF utilise une police serif intégrée (Times) pour un rendu net sans dépendance de fonte ; l'aperflu écran utilise Playfair Display (très léger écart possible). Pour reproduire ton design pré-défini exact (couleurs, logo, mise en page), il suffit d'ajuster `src/lib/pdf.ts` (PDF) et `src/index.css` (aperçu) — les deux partagent la même structure. Ce module peut aussi être intégré comme page « Certificats » du dashboard TELI.
