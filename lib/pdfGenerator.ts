import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

interface SectionData {
  title: string;
  improved: string;
}

export async function generateResumePdf(
  sections: SectionData[],
  jobTitle?: string | null,
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage([612, 792]); // US Letter
  const { width, height } = page.getSize();
  const margin = 54;
  const maxWidth = width - margin * 2;
  let y = height - margin;

  function newPage() {
    page = pdfDoc.addPage([612, 792]);
    y = height - margin;
  }

  function drawText(
    text: string,
    size: number,
    currentFont = font,
    color = rgb(0, 0, 0),
  ) {
    const lineHeight = size * 1.4;
    const words = text.split(/\s+/);
    let line = '';

    for (const word of words) {
      const testLine = line ? `${line} ${word}` : word;
      const testWidth = currentFont.widthOfTextAtSize(testLine, size);

      if (testWidth > maxWidth) {
        if (line) {
          if (y - lineHeight < margin) {
            newPage();
          }
          page.drawText(line, { x: margin, y, size, font: currentFont, color });
          y -= lineHeight;
        }
        line = word;
      } else {
        line = testLine;
      }
    }

    if (line) {
      if (y - lineHeight < margin) {
        newPage();
      }
      page.drawText(line, { x: margin, y, size, font: currentFont, color });
      y -= lineHeight;
    }
  }

  function drawBullet(text: string, size = 11) {
    const indent = 20;
    const bulletX = margin + indent;
    const contentX = margin + indent + 12;
    const contentMaxWidth = maxWidth - indent - 12;
    const lineHeight = size * 1.4;

    if (y - lineHeight < margin) {
      newPage();
    }

    page.drawText('•', { x: bulletX, y, size, font, color: rgb(0.2, 0.2, 0.2) });

    const words = text.split(/\s+/);
    let line = '';
    let isFirst = true;

    for (const word of words) {
      const testLine = line ? `${line} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(testLine, size);

      if (testWidth > contentMaxWidth) {
        if (line) {
          if (y - lineHeight < margin) {
            newPage();
          }
          page.drawText(line, { x: contentX, y, size, font, color: rgb(0.1, 0.1, 0.1) });
          y -= lineHeight;
          isFirst = false;
        }
        line = word;
      } else {
        line = testLine;
      }
    }

    if (line) {
      if (y - lineHeight < margin) {
        newPage();
      }
      page.drawText(line, {
        x: isFirst ? contentX : contentX,
        y,
        size,
        font,
        color: rgb(0.1, 0.1, 0.1),
      });
      y -= lineHeight;
    }
  }

  // Title
  if (jobTitle) {
    drawText(jobTitle, 22, boldFont, rgb(0.1, 0.3, 0.6));
    y -= 4;
    const titleLineWidth = boldFont.widthOfTextAtSize(jobTitle, 22);
    page.drawLine({
      start: { x: margin, y },
      end: { x: margin + Math.min(titleLineWidth, maxWidth), y },
      thickness: 1.5,
      color: rgb(0.1, 0.3, 0.6),
    });
    y -= 20;
  }

  for (const section of sections) {
    // Section header
    if (y < margin + 40) {
      newPage();
    }
    y -= 8;

    drawText(section.title.toUpperCase(), 13, boldFont, rgb(0.1, 0.3, 0.6));
    y -= 2;

    page.drawLine({
      start: { x: margin, y },
      end: { x: margin + maxWidth, y },
      thickness: 0.5,
      color: rgb(0.7, 0.7, 0.7),
    });
    y -= 10;

    // Section content — detect bullet points
    const lines = section.improved.split('\n').filter(l => l.trim());
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*')) {
        drawBullet(trimmed.replace(/^[-•*]\s*/, ''), 11);
        y -= 2;
      } else {
        drawText(trimmed, 11);
        y -= 4;
      }
    }

    y -= 8;
  }

  return pdfDoc.save();
}
