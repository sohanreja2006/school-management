import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateInvoice = (student, schoolInfo = {}) => {
  try {
    const doc = new jsPDF();
    
    // Safety checks for data
    const name = student?.name || 'Unknown Student';
    const rollNumber = student?.rollNumber || 'N/A';
    const className = student?.class || 'N/A';
    const totalFees = student?.totalFees || 0;
    const paidFees = student?.paidFees || 0;
    const balance = totalFees - paidFees;
    
    const status = balance <= 0 ? 'FULLY PAID' : paidFees > 0 ? 'PARTIALLY PAID' : 'UNPAID';

    // Header Branding
    doc.setFillColor(13, 148, 136); // Teal 600
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Academix', 20, 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('OFFICIAL FEE RECEIPT', 155, 25);

    // Bill To Section
    doc.setTextColor(30, 41, 59); // Slate 800
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO:', 20, 60);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Student: ${name}`, 20, 70);
    doc.text(`Roll No: ${rollNumber}`, 20, 77);
    doc.text(`Class: ${className}`, 20, 84);

    // Receipt Details
    doc.setFont('helvetica', 'bold');
    doc.text('RECEIPT INFO:', 140, 60);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 140, 70);
    doc.text(`Ref ID: #FEE-${Date.now().toString().slice(-6)}`, 140, 77);
    
    // Status Badge
    const badgeColor = status === 'FULLY PAID' ? [16, 185, 129] : status === 'PARTIALLY PAID' ? [245, 158, 11] : [239, 68, 68];
    doc.setFillColor(...badgeColor);
    doc.roundedRect(140, 82, 50, 8, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(status, 165, 87, { align: 'center' });

    // Main Table
    autoTable(doc, {
      startY: 100,
      head: [['DESCRIPTION', 'TOTAL AMOUNT', 'PAID TO DATE', 'OUTSTANDING']],
      body: [
        [
          'Tuition & Academic Fees', 
          `$${totalFees.toLocaleString()}`, 
          `$${paidFees.toLocaleString()}`, 
          `$${balance.toLocaleString()}`
        ]
      ],
      headStyles: { 
        fillColor: [15, 23, 42], 
        textColor: 255, 
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: { 
        fontSize: 10,
        halign: 'center',
        cellPadding: 8
      },
      columnStyles: {
        0: { halign: 'left', cellWidth: 80 }
      },
      margin: { left: 20, right: 20 }
    });

    // Final Summary
    const finalY = (doc).lastAutoTable.finalY + 15;
    
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Summary', 130, finalY);
    
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', 130, finalY + 8);
    doc.text(`$${totalFees.toLocaleString()}`, 190, finalY + 8, { align: 'right' });
    
    doc.text('Total Paid:', 130, finalY + 15);
    doc.text(`$${paidFees.toLocaleString()}`, 190, finalY + 15, { align: 'right' });
    
    doc.setDrawColor(226, 232, 240);
    doc.line(130, finalY + 19, 190, finalY + 19);
    
    doc.setTextColor(13, 148, 136);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Balance Due:', 130, finalY + 28);
    doc.text(`$${balance.toLocaleString()}`, 190, finalY + 28, { align: 'right' });

    // Footer
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Authorized Signature', 165, 250, { align: 'center' });
    doc.line(140, 245, 190, 245);
    
    doc.text('This is a system-generated invoice for Academix SaaS.', 105, 280, { align: 'center' });

    doc.save(`Invoice_${rollNumber}_${name.replace(/\s+/g, '_')}.pdf`);
  } catch (error) {
    console.error('Invoice Generation Error:', error);
    alert('Could not generate PDF. Please try again or check your browser console.');
  }
};

export const generateReportCard = (studentResult, examName, options = {}) => {
  try {
    if (!studentResult || !studentResult.results || !studentResult.summary) {
      alert('No result data available to generate report card.');
      return;
    }

    const doc = new jsPDF();
    const { results, summary } = studentResult;
    
    // Ensure numeric types & check overrides
    const pct = options.customPercentage !== undefined ? parseFloat(options.customPercentage) : (parseFloat(summary.percentage) || 0);
    const totalObt = Number(summary.totalObtained) || 0;
    const totalMax = Number(summary.totalMax) || 0;
    const grade = options.customGrade !== undefined ? options.customGrade : (summary.grade || 'N/A');
    const schoolName = options.customSchoolName || 'Academix';
    const studentName = options.studentName || 'Student';
    const rollNumber = options.rollNumber || 'N/A';

    // Header with Branding
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, 210, 45, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text(String(schoolName), 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`ACADEMIC PROGRESS REPORT - ${(examName || 'EXAM').toUpperCase()}`, 105, 32, { align: 'center' });
    
    doc.setFontSize(8);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 40, { align: 'center' });

    // Summary Section
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('SUMMARY OF PERFORMANCE', 20, 58);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Student Name: ${studentName} | Roll No: ${rollNumber}`, 20, 65);

    doc.setDrawColor(226, 232, 240);
    doc.line(20, 69, 190, 69);

    // Performance Stats
    const statsY = 82;
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(79, 70, 229);
    doc.text(`${pct.toFixed(1)}%`, 45, statsY, { align: 'center' });
    doc.text(String(grade), 105, statsY, { align: 'center' });
    doc.setTextColor(30, 41, 59);
    doc.text(`${totalObt}/${totalMax}`, 165, statsY, { align: 'center' });
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('OVERALL PERCENTAGE', 45, statsY + 7, { align: 'center' });
    doc.text('FINAL GRADE', 105, statsY + 7, { align: 'center' });
    doc.text('TOTAL MARKS', 165, statsY + 7, { align: 'center' });

    // Subjects Table
    const tableBody = results.map(r => {
      const rPct = Number(r.percentage) || 0;
      return [
        String(r.subject || 'Unknown'),
        String(r.max || 0),
        String(r.obtained || 0),
        `${rPct.toFixed(1)}%`,
        String(r.status || 'N/A').toUpperCase()
      ];
    });

    autoTable(doc, {
      startY: 100,
      head: [['SUBJECT NAME', 'MAX MARKS', 'OBTAINED', 'PERCENTAGE', 'STATUS']],
      body: tableBody,
      headStyles: { 
        fillColor: [30, 41, 59], 
        textColor: 255, 
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: { 
        fontSize: 10,
        halign: 'center',
        cellPadding: 6
      },
      columnStyles: {
        0: { halign: 'left', fontStyle: 'bold', cellWidth: 70 }
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 4) {
          const status = String(data.cell.raw);
          if (status === 'PASS') data.cell.styles.textColor = [16, 185, 129];
          else data.cell.styles.textColor = [239, 68, 68];
        }
      }
    });

    // Final Notes
    const finalY = (doc).lastAutoTable.finalY + 30;
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('TEACHER REMARKS:', 20, finalY);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const remark = pct >= 80 ? 'Excellent work! Keep maintaining this standard of performance.' : 
                   pct >= 50 ? 'Good progress. With more focus on weak subjects, you can achieve better results.' :
                   'Requires significant improvement and extra classes for core subjects.';
    doc.text(remark, 20, finalY + 8);

    // Signature Area
    doc.line(20, finalY + 40, 80, finalY + 40);
    doc.line(140, finalY + 40, 190, finalY + 40);
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Class Teacher', 50, finalY + 45, { align: 'center' });
    doc.text('Principal / Headmaster', 165, finalY + 45, { align: 'center' });

    // Footer
    doc.setFontSize(7);
    doc.text(`This is a system-generated report card from ${schoolName}.`, 105, 285, { align: 'center' });

    doc.save(`Report_Card_${(studentName || 'student').replace(/\s+/g, '_')}_${(examName || 'exam').replace(/\s+/g, '_')}.pdf`);
  } catch (error) {
    console.error('PDF Generation Error:', error);
    alert('Failed to generate report card: ' + error.message);
  }
};
