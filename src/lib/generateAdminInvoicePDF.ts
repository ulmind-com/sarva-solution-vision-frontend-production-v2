import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface AdminInvoiceItem {
  product?: { productName?: string; _id?: string } | string;
  productName?: string;
  hsnCode?: string;
  quantity?: number;
  productDP?: number;
  productMRP?: number;
  price?: number;
  taxableValue?: number;
  amount?: number;
  cgstRate?: number;
  cgstAmount?: number;
  sgstRate?: number;
  sgstAmount?: number;
}

interface DeliveryAddress {
  shopName?: string;
  franchiseName?: string;
  fullAddress?: string;
  city?: string;
  state?: string;
}

interface AdminInvoice {
  invoiceNo?: string;
  invoiceNumber?: string;
  _id?: string;
  createdAt_IST?: string;
  invoiceDate?: string;
  createdAt?: string;
  deliveryAddress?: DeliveryAddress;
  franchiseId?: { shopName?: string; name?: string; vendorId?: string };
  franchise?: { shopName?: string; name?: string; vendorId?: string };
  items: AdminInvoiceItem[];
  subTotal?: number;
  totalTaxableValue?: number;
  totalCGST?: number;
  totalSGST?: number;
  grandTotal?: number;
  totalAmount?: number;
}

const fmt = (n: number | undefined | null): string =>
  parseFloat(String(n ?? 0)).toFixed(2);

// Function is now async to allow fetching product details
export const generateAdminInvoicePDF = async (invoice: AdminInvoice) => {

  // ── Preload Watermark Logo & Aspect Ratio ──
  let logoBase64 = '';
  let logoRatio = 1;
  try {
    const res = await fetch('/logo.png');
    const blob = await res.blob();
    logoBase64 = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        const img = new Image();
        img.onload = () => {
          logoRatio = img.width / img.height || 1;
          resolve(dataUrl);
        };
        img.onerror = () => resolve(dataUrl);
        img.src = dataUrl;
      };
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.error('Could not load logo for watermark', e);
  }

  // ── Fetch Product Names & BV/PV before generating PDF ──
  const itemsWithNames = await Promise.all(
    invoice.items.map(async (item) => {
      let fetchedName = item.productName;
      let fetchedBv = 0;
      let fetchedPv = 0;

      // Extract existing bv/pv if passed as an object snapshot
      if (typeof item.product === 'object' && item.product !== null) {
        fetchedBv = (item.product as any).bv || 0;
        fetchedPv = (item.product as any).pv || 0;
      }

      // If product is just an ID string or missing full details, fetch it
      if (typeof item.product === 'string') {
        try {
          const res = await fetch(`https://sarvasolution-backend-production-v2.onrender.com/api/v1/user/products/${item.product}`);
          const data = await res.json();
          if (data.success && data.data?.product) {
            fetchedName = data.data.product.productName || fetchedName;
            fetchedBv = data.data.product.bv || fetchedBv;
            fetchedPv = data.data.product.pv || fetchedPv;
          }
        } catch (error) {
          console.error("Failed to fetch product details for ID:", item.product, error);
        }
      }

      return {
        ...item,
        productName: fetchedName,
        productBv: fetchedBv,
        productPv: fetchedPv
      };
    })
  );


  // ── Original PDF Generation Logic ──
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm' });
  const pw = doc.internal.pageSize.getWidth();
  const m = 10;

  doc.setDrawColor(0);
  doc.setLineWidth(0.3);

  // ── Title ──
  const titleY = m;
  doc.rect(m, titleY, pw - 2 * m, 10);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('TAX INVOICE', pw / 2, titleY + 7, { align: 'center' });

  // ── Header Info ──
  const hY = titleY + 10;
  const hH = 22;
  doc.rect(m, hY, pw - 2 * m, hH);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  let ly = hY + 5;
  doc.text('GST No: 19ABRCS5991B1ZQ', m + 3, ly);
  ly += 4;
  doc.text('Tax is payable on Reverse Charge: No', m + 3, ly);
  ly += 4;
  doc.setFont('helvetica', 'bold');
  const invNo = invoice.invoiceNo || invoice.invoiceNumber || invoice._id?.slice(-8).toUpperCase() || '';
  doc.text('Invoice No: ' + invNo, m + 3, ly);
  doc.setFont('helvetica', 'normal');
  ly += 4;
  const dateStr = invoice.createdAt_IST || (invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : invoice.createdAt ? new Date(invoice.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'N/A');
  doc.text('Date: ' + dateStr, m + 3, ly);

  // ── Parties Section (side-by-side) ──
  const pY = hY + hH;
  const pH2 = 26;
  const midX = pw / 2;
  doc.rect(m, pY, midX - m, pH2);
  doc.rect(midX, pY, pw - m - midX, pH2);

  // Billed To (Franchise)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Billed To:', m + 3, pY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  const da = invoice.deliveryAddress;
  const franchiseData = invoice.franchiseId || invoice.franchise;
  const billedName = da?.shopName
    ? `${da.shopName}${da.franchiseName ? ' (' + da.franchiseName + ')' : ''}`
    : franchiseData?.shopName || 'N/A';
  doc.text('Name: ' + billedName, m + 3, pY + 10);

  const billedAddr = da?.fullAddress
    ? [da.fullAddress, da.city, da.state].filter(Boolean).join(', ')
    : [da?.city, da?.state].filter(Boolean).join(', ') || 'India';
  doc.text('Address: ' + billedAddr, m + 3, pY + 14, { maxWidth: midX - m - 6 });

  // Sold By (Company)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Sold By:', midX + 3, pY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Name: Sarva Solution Vision Pvt. Ltd.', midX + 3, pY + 10);
  doc.text('Address: Tarafdar Bhavan - 1st Floor,', midX + 3, pY + 14);
  doc.text('Atghora, Phool Tala, Kolkata-700136', midX + 3, pY + 18);

  // ── Items Table ──
  const tableStartY = pY + pH2 + 2;

  let totalBV = 0;
  let totalPV = 0;

  // Use itemsWithNames here instead of invoice.items
  const tableBody = itemsWithNames.map((item, i) => {
    const qty = item.quantity ?? 0;
    const rate = item.productDP ?? item.price ?? 0;
    const mrp = item.productMRP ?? rate;
    const gross = item.taxableValue ?? item.amount ?? (qty * rate);
    const cgstRate = item.cgstRate ?? 0;
    const sgstRate = item.sgstRate ?? 0;
    const cgstAmt = item.cgstAmount ?? (gross * cgstRate) / 100;
    const sgstAmt = item.sgstAmount ?? (gross * sgstRate) / 100;

    totalBV += (item.productBv || 0) * qty;
    totalPV += (item.productPv || 0) * qty;

    const productName = typeof item.product === 'object'
      ? item.product?.productName || 'Product'
      : item.productName || ('Product ID: ' + (item.product || 'N/A'));

    return [
      String(i + 1),
      productName,
      item.hsnCode || '-',
      String(qty),
      fmt(rate),
      fmt(mrp),
      fmt(gross),
      `${cgstRate}% (${fmt(cgstAmt)})`,
      `${sgstRate}% (${fmt(sgstAmt)})`,
    ];
  });

  autoTable(doc, {
    startY: tableStartY,
    head: [['SI', 'Description of Goods', 'HSN', 'QTY', 'Rate', 'MRP', 'Gross', 'CGST', 'SGST']],
    body: tableBody,
    theme: 'grid',
    headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0], fontSize: 7, fontStyle: 'bold', halign: 'center' },
    bodyStyles: { fontSize: 7 },
    styles: { fontSize: 9, cellPadding: 3, lineWidth: 0.3, lineColor: [0, 0, 0], halign: 'center' },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 'auto', halign: 'left' },
      2: { cellWidth: 14 },
      3: { cellWidth: 10 },
      4: { cellWidth: 18 },
      5: { cellWidth: 18 },
      6: { cellWidth: 20 },
      7: { cellWidth: 26 },
      8: { cellWidth: 26 },
    },
  });

  // ── Totals ──
  const finalY = (doc as any).lastAutoTable?.finalY || tableStartY + 30;

  const grossTotal = invoice.subTotal ?? invoice.totalTaxableValue ?? invoice.grandTotal ?? 0;
  const totalCGST = invoice.totalCGST ?? 0;
  const totalSGST = invoice.totalSGST ?? 0;
  const grandTotal = invoice.grandTotal ?? invoice.totalAmount ?? 0;

  const summaryData: [string, string][] = [
    ['Total BV:', fmt(totalBV)],
    ['Total PV:', fmt(totalPV)],
    ['Gross Total:', fmt(grossTotal)],
    ['Total CGST:', fmt(totalCGST)],
    ['Total SGST:', fmt(totalSGST)],
    ['Grand Total:', fmt(grandTotal)],
  ];

  const sLineH = 5;
  const sBoxW = 70;
  const sBoxX = pw - m - sBoxW;
  const sy = finalY + 4;
  const sBoxH = summaryData.length * sLineH + 4;
  doc.rect(sBoxX, sy, sBoxW, sBoxH);

  doc.setFontSize(8);
  summaryData.forEach(([label, val], idx) => {
    const yPos = sy + 4 + idx * sLineH;
    const isBold = label === 'Grand Total:';
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.text(label, sBoxX + 3, yPos);
    doc.text(val, pw - m - 3, yPos, { align: 'right' });
  });

  // ── Signature Block ──
  const sigY = sy + sBoxH + 16;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('For Sarva Solution Vision', pw - m - 5, sigY, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.line(pw - m - 50, sigY + 12, pw - m, sigY + 12);
  doc.text('Authorised Signature', pw - m - 25, sigY + 16, { align: 'center' });

  // ── Apply Watermark to All Pages ──
  if (logoBase64) {
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      if (typeof doc.saveGraphicsState === 'function') {
        doc.saveGraphicsState();
        doc.setGState(new (doc as any).GState({ opacity: 0.08 }));
        let imgW = 120;
        let imgH = 120 / logoRatio;
        if (imgH > 180) {
          imgH = 180;
          imgW = 180 * logoRatio;
        }
        const x = (doc.internal.pageSize.getWidth() - imgW) / 2;
        const y = (doc.internal.pageSize.getHeight() - imgH) / 2;
        doc.addImage(logoBase64, 'PNG', x, y, imgW, imgH);
        doc.restoreGraphicsState();
      }
    }
  }

  doc.save('Invoice_' + invNo + '.pdf');
};