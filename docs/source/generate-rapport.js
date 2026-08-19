// Régénère docs/rapport-journalier.docx à partir de journal-activite.json.
// Pour ajouter une journée : éditer journal-activite.json (ajouter une entrée
// à "entries"), puis `node docs/source/generate-rapport.js`. Ne pas créer de
// nouveau fichier daté : ce script écrase toujours le même docs/rapport-journalier.docx.

const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, ShadingType, AlignmentType, Header, Footer, PageNumber,
} = require("docx");

const DARK = "1a1a1a";
const GREY = "666666";
const ACCENT = "2563eb";
const LIGHT_BG = "F3F4F6";

const journal = require("./journal-activite.json");

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 320, after: 140 },
    children: [new TextRun({ text, bold: true, size: 28, color: DARK })],
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 100 },
    children: [new TextRun({ text, bold: true, size: 22, color: ACCENT })],
  });
}

function p(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text, size: 21, color: DARK, ...opts })],
  });
}

function cell(text, opts = {}) {
  const { width, bold = false, shade = null, color = DARK, align = AlignmentType.LEFT } = opts;
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: shade ? { type: ShadingType.CLEAR, fill: shade } : undefined,
    margins: { top: 100, bottom: 100, left: 120, right: 120 },
    children: [new Paragraph({ alignment: align, children: [new TextRun({ text, bold, size: 20, color })] })],
  });
}

function formatDate(iso) {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h} h ${String(m).padStart(2, "0")}` : `${m} min`;
}

const colWidths = [3000, 5200, 1400];

function dayTable(blocs) {
  const header = new TableRow({
    tableHeader: true,
    children: [
      cell("Bloc de travail", { width: colWidths[0], bold: true, shade: DARK, color: "FFFFFF" }),
      cell("Détail", { width: colWidths[1], bold: true, shade: DARK, color: "FFFFFF" }),
      cell("Temps", { width: colWidths[2], bold: true, shade: DARK, color: "FFFFFF", align: AlignmentType.CENTER }),
    ],
  });
  const rows = blocs.map((b, i) =>
    new TableRow({
      children: [
        cell(b.titre, { width: colWidths[0], bold: true, shade: i % 2 ? LIGHT_BG : null }),
        cell(b.detail, { width: colWidths[1], shade: i % 2 ? LIGHT_BG : null }),
        cell(formatDuration(b.minutes), { width: colWidths[2], shade: i % 2 ? LIGHT_BG : null, align: AlignmentType.CENTER }),
      ],
    })
  );
  const dayTotal = blocs.reduce((s, b) => s + b.minutes, 0);
  const totalRow = new TableRow({
    children: [
      cell("Total journée", { width: colWidths[0], bold: true, shade: "DBEAFE" }),
      cell("", { width: colWidths[1], shade: "DBEAFE" }),
      cell(formatDuration(dayTotal), { width: colWidths[2], bold: true, shade: "DBEAFE", align: AlignmentType.CENTER }),
    ],
  });
  return { table: new Table({ width: { size: 9600, type: WidthType.DXA }, columnWidths: colWidths, rows: [header, ...rows, totalRow] }), dayTotal };
}

const entries = [...journal.entries].sort((a, b) => a.date.localeCompare(b.date));
let grandTotal = 0;
const body = [];

for (const entry of entries) {
  const { table, dayTotal } = dayTable(entry.blocs);
  grandTotal += dayTotal;
  body.push(h1(`Journée du ${formatDate(entry.date)}`));
  body.push(p(entry.resume));
  body.push(h2("Détail des blocs de travail"));
  body.push(table);
}

const grandTotalRow = new TableRow({
  children: [
    cell("Cumul toutes journées", { width: colWidths[0] + colWidths[1], bold: true, shade: ACCENT, color: "FFFFFF" }),
    cell(formatDuration(grandTotal), { width: colWidths[2], bold: true, shade: ACCENT, color: "FFFFFF", align: AlignmentType.CENTER }),
  ],
});

const doc = new Document({
  sections: [
    {
      properties: { page: { size: { width: 11907, height: 16840 } } },
      headers: {
        default: new Header({
          children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Cleaning App — Rapport d'activité", size: 16, color: GREY })] })],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: "Page ", size: 16, color: GREY }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: GREY })],
            }),
          ],
        }),
      },
      children: [
        new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "RAPPORT D'ACTIVITÉ", bold: true, size: 36, color: DARK })] }),
        new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "Cleaning App", size: 24, color: ACCENT, bold: true })] }),
        new Paragraph({ spacing: { after: 300 }, children: [new TextRun({ text: `${entries.length} journée(s) de travail — cumul : ${formatDuration(grandTotal)}`, size: 18, color: GREY })] }),
        ...body,
        new Table({ width: { size: 9600, type: WidthType.DXA }, columnWidths: [colWidths[0] + colWidths[1], colWidths[2]], rows: [grandTotalRow] }),
        p("Les temps sont reconstruits a posteriori à partir de l'historique Git et des horodatages des ressources créées (Supabase, Google Cloud), complétés par une estimation raisonnable de la complexité de chaque bloc. Ce n'est pas un chronométrage minute par minute : à utiliser comme base de discussion pour un devis, à ajuster selon votre propre référentiel de facturation.", { italics: true, size: 19, color: GREY }),
      ],
    },
  ],
});

const outPath = path.join(__dirname, "..", "rapport-journalier.docx");
Packer.toBuffer(doc).then((buf) => {
  require("fs").writeFileSync(outPath, buf);
  console.log("written", outPath);
});
