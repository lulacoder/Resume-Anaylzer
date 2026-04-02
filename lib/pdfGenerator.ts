import { PDFDocument, PDFFont, StandardFonts, rgb } from 'pdf-lib';

interface SectionData {
  title: string;
  improved: string;
}

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 42;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const palette = {
  text: rgb(0.13, 0.12, 0.16),
  muted: rgb(0.42, 0.41, 0.47),
  accent: rgb(0.79, 0.33, 0.28),
  accentSoft: rgb(0.98, 0.94, 0.91),
  border: rgb(0.89, 0.84, 0.8),
  summaryFill: rgb(0.99, 0.98, 0.97),
};

export async function generateResumePdf(
  sections: SectionData[],
  jobTitle?: string | null,
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const serifFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

  const allImprovedText = sections.map((section) => section.improved).join('\n');
  const candidateName = detectCandidateName(sections);
  const heading = candidateName || 'Optimized Resume';
  const subheading = jobTitle || detectHeadline(sections) || 'Tailored resume edition';
  const contactItems = extractContactItems(allImprovedText);
  const summarySectionIndex = sections.findIndex((section) => /summary|profile|objective/i.test(section.title));

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  const drawPageChrome = (isContinuation = false) => {
    page.drawLine({
      start: { x: MARGIN, y: PAGE_HEIGHT - 24 },
      end: { x: PAGE_WIDTH - MARGIN, y: PAGE_HEIGHT - 24 },
      thickness: 0.8,
      color: palette.border,
    });

    if (isContinuation) {
      page.drawText('Resume continuation', {
        x: MARGIN,
        y: PAGE_HEIGHT - 18,
        size: 8,
        font: bodyFont,
        color: palette.muted,
      });
    }
  };

  const newPage = () => {
    page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    y = PAGE_HEIGHT - MARGIN;
    drawPageChrome(true);
  };

  const ensureSpace = (requiredHeight: number) => {
    if (y - requiredHeight < MARGIN) {
      newPage();
    }
  };

  const wrapText = (text: string, size: number, font: PDFFont, maxWidth: number) => {
    const words = text.split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let line = '';

    for (const word of words) {
      const testLine = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(testLine, size) > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = testLine;
      }
    }

    if (line) {
      lines.push(line);
    }

    return lines;
  };

  const drawTextBlock = ({
    text,
    size,
    font,
    color = palette.text,
    x = MARGIN,
    maxWidth = CONTENT_WIDTH,
    lineHeight = size * 1.45,
  }: {
    text: string;
    size: number;
    font: PDFFont;
    color?: ReturnType<typeof rgb>;
    x?: number;
    maxWidth?: number;
    lineHeight?: number;
  }) => {
    const lines = wrapText(text, size, font, maxWidth);

    for (const line of lines) {
      ensureSpace(lineHeight);
      page.drawText(line, {
        x,
        y,
        size,
        font,
        color,
      });
      y -= lineHeight;
    }
  };

  const drawBullet = (text: string, size = 10.5) => {
    const bulletX = MARGIN + 10;
    const contentX = MARGIN + 24;
    const contentWidth = CONTENT_WIDTH - 24;
    const lineHeight = size * 1.45;
    const lines = wrapText(text, size, bodyFont, contentWidth);

    ensureSpace(Math.max(lineHeight, lines.length * lineHeight));
    page.drawText('•', {
      x: bulletX,
      y,
      size: size + 1,
      font: boldFont,
      color: palette.accent,
    });

    for (const line of lines) {
      ensureSpace(lineHeight);
      page.drawText(line, {
        x: contentX,
        y,
        size,
        font: bodyFont,
        color: palette.text,
      });
      y -= lineHeight;
    }
  };

  const drawSectionHeading = (title: string) => {
    ensureSpace(32);
    page.drawRectangle({
      x: MARGIN,
      y: y - 14,
      width: CONTENT_WIDTH,
      height: 18,
      color: palette.accentSoft,
      borderColor: palette.border,
      borderWidth: 0.5,
    });
    page.drawText(title.toUpperCase(), {
      x: MARGIN + 12,
      y: y - 2,
      size: 9,
      font: boldFont,
      color: palette.accent,
    });
    y -= 26;
  };

  const drawSummaryBox = (text: string) => {
    const summaryLines = text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .flatMap((line) => wrapText(line, 10.5, serifFont, CONTENT_WIDTH - 28));

    const boxHeight = Math.max(70, summaryLines.length * 15 + 26);
    ensureSpace(boxHeight + 10);
    page.drawRectangle({
      x: MARGIN,
      y: y - boxHeight + 10,
      width: CONTENT_WIDTH,
      height: boxHeight,
      color: palette.summaryFill,
      borderColor: palette.border,
      borderWidth: 0.7,
    });
    page.drawLine({
      start: { x: MARGIN + 14, y: y - 10 },
      end: { x: MARGIN + 14, y: y - boxHeight + 18 },
      thickness: 2,
      color: palette.accent,
    });
    page.drawText('PROFESSIONAL SUMMARY', {
      x: MARGIN + 28,
      y: y - 4,
      size: 9,
      font: boldFont,
      color: palette.accent,
    });

    y -= 24;
    for (const line of summaryLines) {
      page.drawText(line, {
        x: MARGIN + 28,
        y,
        size: 10.5,
        font: serifFont,
        color: palette.text,
      });
      y -= 15;
    }
    y -= 14;
  };

  drawPageChrome();

  page.drawRectangle({
    x: MARGIN,
    y: y - 78,
    width: CONTENT_WIDTH,
    height: 78,
    color: palette.accentSoft,
    borderColor: palette.border,
    borderWidth: 0.7,
  });

  page.drawText(heading, {
    x: MARGIN + 18,
    y: y - 24,
    size: candidateName ? 24 : 20,
    font: boldFont,
    color: palette.text,
  });

  page.drawText(subheading, {
    x: MARGIN + 18,
    y: y - 42,
    size: 10,
    font: boldFont,
    color: palette.accent,
  });

  if (contactItems.length > 0) {
    const contactLines = wrapText(contactItems.join('  |  '), 9.5, bodyFont, CONTENT_WIDTH - 36);
    let contactY = y - 58;
    for (const line of contactLines.slice(0, 2)) {
      page.drawText(line, {
        x: MARGIN + 18,
        y: contactY,
        size: 9.5,
        font: bodyFont,
        color: palette.muted,
      });
      contactY -= 12;
    }
  }

  y -= 96;

  sections.forEach((section, index) => {
    const lines = section.improved.split('\n').map((line) => line.trim()).filter(Boolean);

    if (index === summarySectionIndex && section.improved.trim().length > 0) {
      drawSummaryBox(section.improved.trim());
      return;
    }

    drawSectionHeading(section.title.trim());

    lines.forEach((line) => {
      if (line.startsWith('-') || line.startsWith('•') || line.startsWith('*')) {
        drawBullet(line.replace(/^[-•*]\s*/, ''));
        y -= 3;
      } else {
        drawTextBlock({
          text: line,
          size: 10.5,
          font: bodyFont,
          lineHeight: 15,
        });
        y -= 5;
      }
    });

    y -= 10;
  });

  pdfDoc.getPages().forEach((pdfPage, index) => {
    pdfPage.drawLine({
      start: { x: MARGIN, y: 26 },
      end: { x: PAGE_WIDTH - MARGIN, y: 26 },
      thickness: 0.7,
      color: palette.border,
    });
    pdfPage.drawText(`Page ${index + 1}`, {
      x: PAGE_WIDTH - MARGIN - 36,
      y: 14,
      size: 8.5,
      font: bodyFont,
      color: palette.muted,
    });
  });

  return pdfDoc.save();
}

function detectCandidateName(sections: SectionData[]) {
  const commonSectionTitles = new Set([
    'experience',
    'work experience',
    'professional summary',
    'summary',
    'skills',
    'education',
    'projects',
    'certifications',
    'contact',
    'profile',
  ]);

  const candidateLines = sections
    .flatMap((section) => section.improved.split('\n').map((line) => line.trim()))
    .filter(Boolean)
    .slice(0, 12);

  return (
    candidateLines.find((line) => {
      const normalized = line.toLowerCase();
      const words = line.split(/\s+/);
      return (
        words.length >= 2 &&
        words.length <= 4 &&
        line.length >= 5 &&
        line.length <= 42 &&
        !/[0-9@|]/.test(line) &&
        !commonSectionTitles.has(normalized)
      );
    }) || null
  );
}

function detectHeadline(sections: SectionData[]) {
  const summarySection = sections.find((section) => /summary|profile|objective/i.test(section.title));
  const firstLine = summarySection?.improved
    .split('\n')
    .map((line) => line.trim())
    .find(Boolean);

  if (!firstLine || firstLine.length > 70 || /[@|]/.test(firstLine)) {
    return null;
  }

  return firstLine;
}

function extractContactItems(text: string) {
  const values: string[] = [];
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0];
  const phone = text.match(/(?:\+?\d[\d\s().-]{7,}\d)/)?.[0];
  const linkedin = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[^\s|,]+/i)?.[0];
  const github = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[^\s|,]+/i)?.[0];
  const website = text.match(/(?<!@)(?:https?:\/\/)?(?:www\.)?(?!linkedin\.com)(?!github\.com)[a-z0-9-]+\.[a-z]{2,}[^\s|,]*/i)?.[0];

  [email, phone, linkedin, github, website].forEach((value) => {
    if (value && !values.includes(value)) {
      values.push(value.replace(/^https?:\/\//, ''));
    }
  });

  return values;
}
