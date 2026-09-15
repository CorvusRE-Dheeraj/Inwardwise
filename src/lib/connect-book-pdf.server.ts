import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

/** Keeps only characters the standard PDF fonts can draw. */
function clean(text: string): string {
  return text
    .replace(/[\u2018\u2019\u201A\u2032]/g, "'")
    .replace(/[\u201C\u201D\u201E\u2033]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\u00a0/g, " ")
    .replace(/[^\x20-\x7E\n]/g, "");
}

function wrap(text: string, font: any, size: number, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split(/\n/)) {
    if (!paragraph.trim()) {
      lines.push("");
      continue;
    }
    let line = "";
    for (const word of paragraph.split(/\s+/)) {
      const next = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(next, size) > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = next;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

/** Builds a printable PDF of one section of the book. */
export async function buildSectionPdf(opts: {
  title: string;
  content: string;
  minutes: number;
}): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const body = await doc.embedFont(StandardFonts.TimesRoman);
  const display = await doc.embedFont(StandardFonts.TimesRomanBold);
  const mono = await doc.embedFont(StandardFonts.Helvetica);

  const ink = rgb(0.07, 0.07, 0.07);
  const royal = rgb(0.11, 0.23, 0.62);

  const width = 595.28;
  const height = 841.89;
  const margin = 64;
  const maxWidth = width - margin * 2;

  let page = doc.addPage([width, height]);
  let y = height - margin;

  const newPage = () => {
    page = doc.addPage([width, height]);
    y = height - margin;
  };

  page.drawText(clean("MIND IT!  FOR HEALTH AND HAPPINESS"), {
    x: margin,
    y,
    size: 8,
    font: mono,
    color: royal,
  });
  y -= 28;

  for (const line of wrap(clean(opts.title), display, 24, maxWidth)) {
    if (y < margin + 40) newPage();
    page.drawText(line, { x: margin, y, size: 24, font: display, color: ink });
    y -= 30;
  }

  y -= 6;
  page.drawText(
    clean(`About ${opts.minutes} minute${opts.minutes === 1 ? "" : "s"} to read`),
    { x: margin, y, size: 9, font: mono, color: royal },
  );
  y -= 30;

  for (const line of wrap(clean(opts.content), body, 12, maxWidth)) {
    if (y < margin + 20) newPage();
    if (line === "") {
      y -= 10;
      continue;
    }
    page.drawText(line, { x: margin, y, size: 12, font: body, color: ink });
    y -= 19;
  }

  if (y < margin + 40) newPage();
  y -= 16;
  page.drawText(
    clean("Confirm on Connect Book once you have read this. Nothing further is sent until you do."),
    { x: margin, y, size: 9, font: mono, color: royal },
  );

  return doc.save();
}
