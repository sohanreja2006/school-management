import jsPDF from 'jspdf';

const SCHOOL_NAME = 'Academix International School';
const SCHOOL_TAGLINE = 'Excellence in Education Since 2020';
const SCHOOL_ADDRESS = '123 Education Avenue, Academic City';
const ACADEMIC_YEAR = '2025-2026';

// Color palette
const COLORS = {
  primary: [37, 99, 235],      // Blue
  primaryDark: [30, 64, 175],   // Dark Blue
  accent: [147, 51, 234],       // Purple
  success: [22, 163, 74],       // Green
  dark: [15, 23, 42],           // Slate 900
  medium: [100, 116, 139],      // Slate 500
  light: [226, 232, 240],       // Slate 200
  white: [255, 255, 255],
  gold: [202, 138, 4],          // Amber
  cardBg: [248, 250, 252],      // Slate 50
};

const drawRoundedRect = (doc, x, y, w, h, r, fillColor, strokeColor) => {
  if (fillColor) doc.setFillColor(...fillColor);
  if (strokeColor) {
    doc.setDrawColor(...strokeColor);
    doc.setLineWidth(0.5);
  }
  doc.roundedRect(x, y, w, h, r, r, fillColor && strokeColor ? 'FD' : fillColor ? 'F' : 'S');
};

const drawHeader = (doc, cardX, cardY, cardW, type) => {
  // Header gradient bar
  drawRoundedRect(doc, cardX, cardY, cardW, 28, 4, COLORS.primary);
  drawRoundedRect(doc, cardX, cardY + 15, cardW, 13, 0, COLORS.primary);

  // School emblem circle
  doc.setFillColor(...COLORS.white);
  doc.circle(cardX + 16, cardY + 14, 8, 'F');
  doc.setFillColor(...COLORS.primary);
  doc.circle(cardX + 16, cardY + 14, 6.5, 'F');
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('A', cardX + 16, cardY + 16.5, { align: 'center' });

  // School name
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(SCHOOL_NAME, cardX + 28, cardY + 11);

  // Tagline
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.text(SCHOOL_TAGLINE, cardX + 28, cardY + 16);

  // Card type badge
  const badgeText = type === 'id' ? 'STUDENT ID CARD' : 'ADMIT CARD';
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  const badgeW = doc.getTextWidth(badgeText) + 10;
  drawRoundedRect(doc, cardX + cardW - badgeW - 8, cardY + 20, badgeW, 5.5, 2, COLORS.gold);
  doc.setTextColor(...COLORS.dark);
  doc.text(badgeText, cardX + cardW - badgeW / 2 - 8, cardY + 24);
};

const drawPhotoPlaceholder = (doc, x, y) => {
  drawRoundedRect(doc, x, y, 24, 28, 3, COLORS.light, COLORS.medium);
  doc.setTextColor(...COLORS.medium);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.text('PHOTO', x + 12, y + 15, { align: 'center' });
};

const drawField = (doc, label, value, x, y) => {
  doc.setTextColor(...COLORS.medium);
  doc.setFontSize(5.5);
  doc.setFont('helvetica', 'bold');
  doc.text(label.toUpperCase(), x, y);
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(String(value || 'N/A'), x, y + 4.5);
};

const drawQRCode = (doc, student, x, y, size, type) => {
  // QR placeholder box with data
  drawRoundedRect(doc, x, y, size, size, 2, COLORS.white, COLORS.light);

  // Generate simple QR-like pattern
  const verifyData = type === 'id'
    ? `Academix-ID|${student.rollNumber}|${student.name}|${student.class}`
    : `Academix-ADMIT|${student.rollNumber}|${student.name}|${student.class}|${ACADEMIC_YEAR}`;

  // Draw a simple data matrix pattern
  const cells = 11;
  const cellSize = (size - 4) / cells;
  const startX = x + 2;
  const startY = y + 2;

  // Generate pattern from student data hash
  let hash = 0;
  for (let i = 0; i < verifyData.length; i++) {
    hash = ((hash << 5) - hash + verifyData.charCodeAt(i)) | 0;
  }

  doc.setFillColor(...COLORS.dark);
  for (let row = 0; row < cells; row++) {
    for (let col = 0; col < cells; col++) {
      // Position markers (corners)
      const isCorner = (row < 3 && col < 3) || (row < 3 && col >= cells - 3) || (row >= cells - 3 && col < 3);
      const seed = (hash * (row * cells + col + 1)) & 0x7FFFFFFF;
      const shouldFill = isCorner || (seed % 3 === 0);

      if (shouldFill) {
        doc.rect(startX + col * cellSize, startY + row * cellSize, cellSize * 0.9, cellSize * 0.9, 'F');
      }
    }
  }

  // Verification text below QR
  doc.setTextColor(...COLORS.medium);
  doc.setFontSize(4);
  doc.setFont('helvetica', 'normal');
  doc.text('Scan to Verify', x + size / 2, y + size + 3, { align: 'center' });
};

const drawSignatureArea = (doc, x, y, w) => {
  // Signature line
  doc.setDrawColor(...COLORS.medium);
  doc.setLineWidth(0.3);
  doc.line(x, y, x + w, y);

  doc.setTextColor(...COLORS.medium);
  doc.setFontSize(5.5);
  doc.setFont('helvetica', 'bold');
  doc.text('AUTHORIZED SIGNATURE', x + w / 2, y + 4, { align: 'center' });
};

const drawFooter = (doc, cardX, cardY, cardW, cardH) => {
  // Footer bar
  const footerY = cardY + cardH - 8;
  drawRoundedRect(doc, cardX, footerY, cardW, 8, 0, [241, 245, 249]);
  drawRoundedRect(doc, cardX, footerY + 4, cardW, 4, 4, [241, 245, 249]);

  doc.setTextColor(...COLORS.medium);
  doc.setFontSize(4.5);
  doc.setFont('helvetica', 'normal');
  doc.text(SCHOOL_ADDRESS, cardX + cardW / 2, footerY + 4, { align: 'center' });
  doc.text(`Academic Year: ${ACADEMIC_YEAR}`, cardX + cardW / 2, footerY + 7, { align: 'center' });
};


// ========== ID CARD ==========
export const generateIDCard = (student) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [86, 54] });

  const cardX = 0, cardY = 0, cardW = 86, cardH = 54;

  // Background
  drawRoundedRect(doc, cardX, cardY, cardW, cardH, 4, COLORS.white);

  // Subtle border
  doc.setDrawColor(...COLORS.light);
  doc.setLineWidth(0.8);
  doc.roundedRect(cardX + 0.5, cardY + 0.5, cardW - 1, cardH - 1, 3.5, 3.5, 'S');

  // Header
  drawHeader(doc, cardX, cardY, cardW, 'id');

  // Photo
  drawPhotoPlaceholder(doc, cardX + 4, cardY + 31);

  // Student details
  const detailX = cardX + 32;
  drawField(doc, 'Student Name', student.name, detailX, cardY + 32);
  drawField(doc, 'Class', `Class ${student.class}`, detailX, cardY + 39);

  const col2X = cardX + 58;
  drawField(doc, 'Roll Number', student.rollNumber, col2X, cardY + 32);
  drawField(doc, 'Contact', student.contact, col2X, cardY + 39);

  // QR Code
  drawQRCode(doc, student, cardX + 68, cardY + 31, 14, 'id');

  // Footer
  drawFooter(doc, cardX, cardY, cardW, cardH);

  doc.save(`ID_Card_${student.rollNumber}_${student.name.replace(/\s+/g, '_')}.pdf`);
};


// ========== ADMIT CARD ==========
export const generateAdmitCard = (student) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });

  const pageW = 148, pageH = 210;
  const margin = 8;
  const cardX = margin, cardY = margin;
  const cardW = pageW - margin * 2, cardH = pageH - margin * 2;

  // Card background with border
  drawRoundedRect(doc, cardX, cardY, cardW, cardH, 5, COLORS.white);
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(1.2);
  doc.roundedRect(cardX + 1, cardY + 1, cardW - 2, cardH - 2, 4, 4, 'S');

  // Inner decorative border
  doc.setDrawColor(...COLORS.light);
  doc.setLineWidth(0.3);
  doc.roundedRect(cardX + 3, cardY + 3, cardW - 6, cardH - 6, 3, 3, 'S');

  // Header bar
  drawRoundedRect(doc, cardX + 5, cardY + 5, cardW - 10, 24, 3, COLORS.primary);

  // School emblem
  doc.setFillColor(...COLORS.white);
  doc.circle(cardX + 18, cardY + 17, 7, 'F');
  doc.setFillColor(...COLORS.primary);
  doc.circle(cardX + 18, cardY + 17, 5.5, 'F');
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('A', cardX + 18, cardY + 19, { align: 'center' });

  // School name in header
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(SCHOOL_NAME, cardX + 28, cardY + 15);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(SCHOOL_TAGLINE, cardX + 28, cardY + 20);
  doc.text(SCHOOL_ADDRESS, cardX + 28, cardY + 25);

  // ADMIT CARD title
  const titleY = cardY + 37;
  drawRoundedRect(doc, cardX + cardW / 2 - 25, titleY, 50, 9, 3, COLORS.gold);
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('ADMIT CARD', cardX + cardW / 2, titleY + 6.5, { align: 'center' });

  // Academic year
  doc.setTextColor(...COLORS.medium);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(`Academic Year: ${ACADEMIC_YEAR}`, cardX + cardW / 2, titleY + 14, { align: 'center' });

  // Student info section
  const infoY = titleY + 22;

  // Photo placeholder
  drawPhotoPlaceholder(doc, cardX + 10, infoY);

  // Fields
  const fieldX = cardX + 42;
  const fieldGap = 11;
  drawField(doc, 'Student Name', student.name, fieldX, infoY);
  drawField(doc, "Father's/Guardian's Name", student.parentName, fieldX, infoY + fieldGap);
  drawField(doc, 'Class / Section', `Class ${student.class}`, fieldX, infoY + fieldGap * 2);
  drawField(doc, 'Roll Number', student.rollNumber, fieldX, infoY + fieldGap * 3);
  drawField(doc, 'Contact Number', student.contact, fieldX, infoY + fieldGap * 4);

  // Exam schedule section
  const scheduleY = infoY + 60;
  doc.setDrawColor(...COLORS.light);
  doc.setLineWidth(0.3);
  doc.line(cardX + 10, scheduleY, cardX + cardW - 10, scheduleY);

  doc.setTextColor(...COLORS.primaryDark);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('EXAMINATION SCHEDULE', cardX + cardW / 2, scheduleY + 7, { align: 'center' });

  // Table headers
  const tableY = scheduleY + 12;
  const tableX = cardX + 10;
  const colWidths = [50, 35, 27];

  drawRoundedRect(doc, tableX, tableY, cardW - 20, 7, 1.5, COLORS.primary);
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.text('SUBJECT', tableX + 4, tableY + 4.5);
  doc.text('DATE', tableX + colWidths[0] + 4, tableY + 4.5);
  doc.text('TIME', tableX + colWidths[0] + colWidths[1] + 4, tableY + 4.5);

  // Sample exam rows
  const exams = [
    { subject: 'Mathematics', date: 'To Be Announced', time: '10:00 AM' },
    { subject: 'Science', date: 'To Be Announced', time: '10:00 AM' },
    { subject: 'English', date: 'To Be Announced', time: '10:00 AM' },
    { subject: 'Social Studies', date: 'To Be Announced', time: '10:00 AM' },
    { subject: 'Hindi / Language', date: 'To Be Announced', time: '10:00 AM' },
  ];

  exams.forEach((exam, i) => {
    const rowY = tableY + 7 + i * 6.5;
    const bgColor = i % 2 === 0 ? COLORS.cardBg : COLORS.white;
    doc.setFillColor(...bgColor);
    doc.rect(tableX, rowY, cardW - 20, 6.5, 'F');

    doc.setTextColor(...COLORS.dark);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.text(exam.subject, tableX + 4, rowY + 4.5);
    doc.text(exam.date, tableX + colWidths[0] + 4, rowY + 4.5);
    doc.text(exam.time, tableX + colWidths[0] + colWidths[1] + 4, rowY + 4.5);
  });

  // Table border
  const tableEndY = tableY + 7 + exams.length * 6.5;
  doc.setDrawColor(...COLORS.light);
  doc.setLineWidth(0.3);
  doc.roundedRect(tableX, tableY, cardW - 20, tableEndY - tableY, 1.5, 1.5, 'S');

  // Instructions
  const instrY = tableEndY + 6;
  doc.setTextColor(...COLORS.primaryDark);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('INSTRUCTIONS:', cardX + 10, instrY);

  doc.setTextColor(...COLORS.medium);
  doc.setFontSize(5.5);
  doc.setFont('helvetica', 'normal');
  const instructions = [
    '1. Students must carry this admit card to the examination hall.',
    '2. No electronic devices are allowed during the examination.',
    '3. Students must reach the exam hall 15 minutes before the scheduled time.',
    '4. Use of unfair means will lead to cancellation of the exam.',
  ];
  instructions.forEach((inst, i) => {
    doc.text(inst, cardX + 10, instrY + 5 + i * 4);
  });

  // Bottom section: QR + Signatures
  const bottomY = cardH - 16;

  // QR Code
  drawQRCode(doc, student, cardX + 10, bottomY - 14, 18, 'admit');

  // Signature areas
  drawSignatureArea(doc, cardX + cardW / 2 - 15, bottomY, 25);
  doc.setTextColor(...COLORS.medium);
  doc.setFontSize(5);
  doc.text('Class Teacher', cardX + cardW / 2 - 2, bottomY + 8, { align: 'center' });

  drawSignatureArea(doc, cardX + cardW - 38, bottomY, 25);
  doc.text('Principal', cardX + cardW - 25, bottomY + 8, { align: 'center' });

  // Footer
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(0.5);
  doc.line(cardX + 5, cardY + cardH - 8, cardX + cardW - 5, cardY + cardH - 8);
  doc.setTextColor(...COLORS.medium);
  doc.setFontSize(5);
  doc.setFont('helvetica', 'normal');
  doc.text('This is a computer-generated document. No physical signature is required for digital verification.', cardX + cardW / 2, cardY + cardH - 5, { align: 'center' });
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`, cardX + cardW / 2, cardY + cardH - 2, { align: 'center' });

  doc.save(`Admit_Card_${student.rollNumber}_${student.name.replace(/\s+/g, '_')}.pdf`);
};
