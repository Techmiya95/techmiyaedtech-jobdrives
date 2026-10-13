import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

/**
 * Downloads a DOM element as a high-resolution PNG image
 */
export async function exportElementAsPng(element, fileName = 'job-drive-admit-card.png') {
  if (!element) throw new Error('Target element not found');

  const dataUrl = await toPng(element, {
    quality: 0.98,
    pixelRatio: 2.5,
    cacheBust: true,
    style: {
      transform: 'none',
    },
  });

  const link = document.createElement('a');
  link.download = fileName;
  link.href = dataUrl;
  link.click();
  return dataUrl;
}

/**
 * Downloads a DOM element as a professionally formatted PDF
 */
export async function exportElementAsPdf(element, fileName = 'job-drive-admit-card.pdf') {
  if (!element) throw new Error('Target element not found');

  const dataUrl = await toPng(element, {
    quality: 0.98,
    pixelRatio: 2.5,
    cacheBust: true,
    style: {
      transform: 'none',
    },
  });

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Calculate dimensions to center the admit card on A4 page
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Desired width on page: 140mm (compact elegant pass)
  const imgWidth = 140;
  const elementRatio = element.offsetHeight / element.offsetWidth;
  const imgHeight = imgWidth * elementRatio;

  const xPos = (pageWidth - imgWidth) / 2;
  const yPos = 25; // Header margin

  // Add subtle header text on PDF
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(100, 116, 139);
  pdf.text('TECHMIYA EDTECH CAMPUS PLACEMENT DRIVE 2026', pageWidth / 2, 16, { align: 'center' });

  // Add the card image
  pdf.addImage(dataUrl, 'PNG', xPos, yPos, imgWidth, imgHeight);

  // Add footer instructions
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(148, 163, 184);
  pdf.text('Please carry 2 printed copies of this pass along with your College ID and updated resumes.', pageWidth / 2, yPos + imgHeight + 12, { align: 'center' });
  pdf.text('For queries, contact support@techmiya.edu.in | Venue: Main Auditorium & Lab Complex', pageWidth / 2, yPos + imgHeight + 17, { align: 'center' });

  pdf.save(fileName);
  return dataUrl;
}
