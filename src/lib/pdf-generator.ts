import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportElementToPdf(
  element: HTMLElement,
  filename = 'document.pdf',
  orientation: 'portrait' | 'landscape' = 'portrait',
  pageSize: 'a4' | 'a5' | [number, number] = 'a4'
): Promise<void> {
  try {
    const canvas = await html2canvas(element, {
      scale: 2, // High resolution rendering
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    
    // PDF document instance
    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: pageSize,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Calculate aspect ratio
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

    const renderWidth = imgWidth * ratio;
    const renderHeight = imgHeight * ratio;

    const xOffset = (pdfWidth - renderWidth) / 2;
    const yOffset = (pdfHeight - renderHeight) / 2;

    pdf.addImage(imgData, 'PNG', xOffset, yOffset, renderWidth, renderHeight);
    pdf.save(filename);
  } catch (err) {
    console.error('Error generating PDF:', err);
    throw err;
  }
}

export function printDocumentHtml(
  htmlWithStyles: string,
  title = 'Print Document',
  orientation: 'portrait' | 'landscape' = 'portrait',
  pageSize: 'A4' | 'ID_CARD' | 'A5' = 'A4'
): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print documents.');
    return;
  }

  const pageCss = pageSize === 'ID_CARD'
    ? (orientation === 'landscape' ? '85.6mm 53.98mm' : '53.98mm 85.6mm')
    : (orientation === 'landscape' ? 'A4 landscape' : 'A4 portrait');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Cinzel:wght@600;700;900&family=Great+Vibes&display=swap" rel="stylesheet">
        <style>
          @page {
            size: ${pageCss};
            margin: 0;
          }
          * {
            box-sizing: border-box;
          }
          html, body {
            margin: 0;
            padding: 0;
            background: white;
            color: #0f172a;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
          }
          @media print {
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        </style>
      </head>
      <body>
        ${htmlWithStyles}
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();

  // Wait for images and fonts to load before triggering print
  setTimeout(() => {
    printWindow.print();
  }, 600);
}
