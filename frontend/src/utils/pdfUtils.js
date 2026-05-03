// frontend/src/utils/pdfUtils.js
import jsPDF from "jspdf";
import { formatDate } from "./web3Utils";

// ─────────────────────────────────────────────────────────────────────────────
// SIGNATURE IMAGES — drawn on a hidden <canvas> and exported as base64 PNG.
// These replicate the cursive signatures visible in the certificate image.
// ─────────────────────────────────────────────────────────────────────────────

function drawRegistrarSignature() {
  const canvas = document.createElement("canvas");
  canvas.width  = 300;
  canvas.height = 90;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, 300, 90);
  ctx.strokeStyle = "#111111";
  ctx.lineWidth   = 2.2;
  ctx.lineCap     = "round";
  ctx.lineJoin    = "round";

  // "B. Chidambus" style — cursive strokes
  ctx.beginPath();
  // B
  ctx.moveTo(20, 60); ctx.lineTo(20, 30);
  ctx.moveTo(20, 30); ctx.bezierCurveTo(40, 28, 42, 44, 20, 46);
  ctx.moveTo(20, 46); ctx.bezierCurveTo(44, 44, 46, 62, 20, 60);
  // dot after B
  ctx.moveTo(50, 58); ctx.arc(50, 57, 2, 0, Math.PI * 2);
  // C
  ctx.moveTo(80, 42); ctx.bezierCurveTo(58, 36, 54, 68, 78, 64);
  // h
  ctx.moveTo(83, 30); ctx.lineTo(83, 65);
  ctx.moveTo(83, 48); ctx.bezierCurveTo(90, 40, 100, 40, 100, 52);
  ctx.lineTo(100, 65);
  // i
  ctx.moveTo(106, 48); ctx.lineTo(106, 65);
  ctx.moveTo(106, 38); ctx.arc(106, 36, 2, 0, Math.PI * 2);
  // d
  ctx.moveTo(130, 30); ctx.lineTo(130, 65);
  ctx.moveTo(130, 52); ctx.bezierCurveTo(130, 40, 112, 40, 112, 52);
  ctx.bezierCurveTo(112, 64, 130, 64, 130, 52);
  // a
  ctx.moveTo(148, 52); ctx.bezierCurveTo(148, 40, 133, 40, 133, 52);
  ctx.bezierCurveTo(133, 64, 148, 64, 148, 52); ctx.lineTo(148, 68);
  // m
  ctx.moveTo(152, 50); ctx.lineTo(152, 65);
  ctx.moveTo(152, 50); ctx.bezierCurveTo(158, 40, 168, 40, 168, 52);
  ctx.lineTo(168, 65);
  ctx.moveTo(168, 50); ctx.bezierCurveTo(174, 40, 184, 40, 184, 52);
  ctx.lineTo(184, 65);
  // b
  ctx.moveTo(190, 30); ctx.lineTo(190, 65);
  ctx.moveTo(190, 52); ctx.bezierCurveTo(190, 40, 208, 40, 208, 52);
  ctx.bezierCurveTo(208, 64, 190, 64, 190, 52);
  // u
  ctx.moveTo(212, 48); ctx.lineTo(212, 60);
  ctx.bezierCurveTo(212, 68, 228, 68, 228, 60); ctx.lineTo(228, 48);
  // s
  ctx.moveTo(248, 46); ctx.bezierCurveTo(232, 42, 230, 54, 242, 56);
  ctx.bezierCurveTo(254, 58, 250, 70, 234, 67);
  ctx.stroke();
  return canvas.toDataURL("image/png");
}

function drawVCSignature() {
  const canvas = document.createElement("canvas");
  canvas.width  = 300;
  canvas.height = 90;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, 300, 90);
  ctx.strokeStyle = "#111111";
  ctx.lineWidth   = 2.2;
  ctx.lineCap     = "round";
  ctx.lineJoin    = "round";

  // "Gurneetony" / Vice-Chancellor style — flowing right-leaning strokes
  ctx.beginPath();
  // Large initial loop (G-shape)
  ctx.moveTo(30, 65);
  ctx.bezierCurveTo(10, 30, 40, 10, 60, 30);
  ctx.bezierCurveTo(75, 45, 60, 65, 40, 62);
  ctx.moveTo(55, 48); ctx.lineTo(70, 48);
  // u
  ctx.moveTo(78, 38); ctx.lineTo(78, 57);
  ctx.bezierCurveTo(78, 68, 94, 68, 94, 57); ctx.lineTo(94, 38);
  // r
  ctx.moveTo(100, 48); ctx.lineTo(100, 68);
  ctx.moveTo(100, 54); ctx.bezierCurveTo(108, 44, 118, 46, 116, 54);
  // n
  ctx.moveTo(122, 48); ctx.lineTo(122, 68);
  ctx.moveTo(122, 52); ctx.bezierCurveTo(128, 42, 140, 42, 140, 54);
  ctx.lineTo(140, 68);
  // e
  ctx.moveTo(160, 55); ctx.lineTo(146, 55);
  ctx.bezierCurveTo(144, 44, 162, 40, 164, 52);
  ctx.bezierCurveTo(166, 64, 148, 70, 146, 66);
  // e
  ctx.moveTo(182, 55); ctx.lineTo(168, 55);
  ctx.bezierCurveTo(166, 44, 184, 40, 186, 52);
  ctx.bezierCurveTo(188, 64, 170, 70, 168, 66);
  // t
  ctx.moveTo(194, 32); ctx.lineTo(194, 68);
  ctx.moveTo(186, 48); ctx.lineTo(204, 48);
  // o
  ctx.moveTo(218, 54); ctx.bezierCurveTo(218, 42, 206, 42, 206, 54);
  ctx.bezierCurveTo(206, 66, 218, 66, 218, 54);
  // n
  ctx.moveTo(222, 48); ctx.lineTo(222, 68);
  ctx.moveTo(222, 52); ctx.bezierCurveTo(228, 42, 240, 42, 240, 54);
  ctx.lineTo(240, 68);
  // y — descender
  ctx.moveTo(246, 48); ctx.lineTo(250, 65);
  ctx.moveTo(258, 48); ctx.lineTo(246, 78);
  // trailing flourish underline
  ctx.moveTo(20, 75);
  ctx.bezierCurveTo(80, 72, 160, 78, 260, 73);
  ctx.stroke();
  return canvas.toDataURL("image/png");
}

// ─────────────────────────────────────────────────────────────────────────────
// UNIVERSITY SEAL — drawn on canvas, mimics the round blue PU logo
// ─────────────────────────────────────────────────────────────────────────────
function drawUniversitySeal() {
  const canvas = document.createElement("canvas");
  const S = 160;
  canvas.width  = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d");
  const cx = S / 2, cy = S / 2, r = S / 2 - 4;

  // Outer circle fill (blue)
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = "#1a3a8a"; ctx.fill();

  // Inner white ring
  ctx.beginPath(); ctx.arc(cx, cy, r - 8, 0, Math.PI * 2);
  ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2; ctx.stroke();

  // Inner circle (lighter blue)
  ctx.beginPath(); ctx.arc(cx, cy, r - 14, 0, Math.PI * 2);
  ctx.fillStyle = "#2550aa"; ctx.fill();

  // Circular text "PONDICHERRY UNIVERSITY" around top
  ctx.save();
  ctx.translate(cx, cy);
  ctx.font = "bold 10px Arial";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  const topText = "PONDICHERRY UNIVERSITY";
  const topRadius = r - 5;
  const topStartAngle = -Math.PI * 0.82;
  const topAngleStep  = (Math.PI * 1.64) / (topText.length - 1);
  for (let i = 0; i < topText.length; i++) {
    const angle = topStartAngle + i * topAngleStep;
    ctx.save();
    ctx.rotate(angle + Math.PI / 2);
    ctx.translate(0, -topRadius + 1);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(topText[i], 0, 0);
    ctx.restore();
  }

  // Bottom text
  const botText = "PUDUCHERRY";
  const botRadius = r - 5;
  const botStartAngle = Math.PI * 0.18;
  const botAngleStep  = (Math.PI * 0.64) / (botText.length - 1);
  for (let i = 0; i < botText.length; i++) {
    const angle = botStartAngle + i * botAngleStep;
    ctx.save();
    ctx.rotate(angle + Math.PI / 2);
    ctx.translate(0, botRadius - 1);
    ctx.rotate(Math.PI / 2);
    ctx.fillText(botText[i], 0, 0);
    ctx.restore();
  }
  ctx.restore();

  // Central lotus symbol (simplified)
  ctx.save();
  ctx.translate(cx, cy - 4);
  ctx.fillStyle = "#ffe080";
  // petals
  for (let i = 0; i < 8; i++) {
    ctx.save();
    ctx.rotate((i * Math.PI) / 4);
    ctx.beginPath();
    ctx.ellipse(0, -16, 4, 12, 0, 0, Math.PI * 2);
    ctx.fillStyle = i % 2 === 0 ? "#ffe080" : "#ffcc44";
    ctx.fill();
    ctx.restore();
  }
  // Centre dot
  ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2);
  ctx.fillStyle = "#ffaa00"; ctx.fill();
  ctx.restore();

  // Stars / separators on ring
  ctx.fillStyle = "#ffe080";
  for (let i = 0; i < 2; i++) {
    const sx = i === 0 ? cx - (r - 6) * Math.cos(Math.PI * 0.12) : cx + (r - 6) * Math.cos(Math.PI * 0.12);
    const sy = cy + (r - 6) * Math.sin(Math.PI * 0.12);
    ctx.beginPath(); ctx.arc(sx, sy, 3, 0, Math.PI * 2); ctx.fill();
  }

  return canvas.toDataURL("image/png");
}

// ─────────────────────────────────────────────────────────────────────────────
// WAX SEAL — large red embossed seal
// ─────────────────────────────────────────────────────────────────────────────
function drawWaxSeal() {
  const canvas = document.createElement("canvas");
  const S = 240;
  canvas.width  = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d");
  const cx = S / 2, cy = S / 2;

  // Jagged sunburst background
  ctx.beginPath();
  const spikes = 36;
  for (let i = 0; i < spikes * 2; i++) {
    const angle  = (i * Math.PI) / spikes;
    const radius = i % 2 === 0 ? 112 : 96;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  const grad = ctx.createRadialGradient(cx, cy, 20, cx, cy, 112);
  grad.addColorStop(0,   "#e03030");
  grad.addColorStop(0.6, "#c02020");
  grad.addColorStop(1,   "#8b0000");
  ctx.fillStyle = grad; ctx.fill();

  // Outer ring
  ctx.beginPath(); ctx.arc(cx, cy, 90, 0, Math.PI * 2);
  ctx.strokeStyle = "#ff6666"; ctx.lineWidth = 2; ctx.stroke();

  // Inner ring
  ctx.beginPath(); ctx.arc(cx, cy, 74, 0, Math.PI * 2);
  ctx.strokeStyle = "#ff9999"; ctx.lineWidth = 1.5; ctx.stroke();

  // Circular "PONDICHERRY UNIVERSITY" text
  ctx.save(); ctx.translate(cx, cy);
  ctx.font = "bold 9px Arial";
  ctx.fillStyle = "#ffdddd";
  ctx.textAlign = "center";
  const sealText = "PONDICHERRY  UNIVERSITY";
  const sR = 82;
  const sStart = -Math.PI * 0.85;
  const sStep  = (Math.PI * 1.7) / (sealText.length - 1);
  for (let i = 0; i < sealText.length; i++) {
    const a = sStart + i * sStep;
    ctx.save();
    ctx.rotate(a + Math.PI / 2);
    ctx.translate(0, -sR);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(sealText[i], 0, 0);
    ctx.restore();
  }
  ctx.restore();

  // Central emblem — simplified university crest
  ctx.save(); ctx.translate(cx, cy);
  // Book / flame symbol
  ctx.fillStyle = "#ffcccc";
  ctx.beginPath();
  ctx.ellipse(0, -8, 18, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0, -8, 10, 18, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#e03030"; ctx.fill();
  // Flame tip
  ctx.beginPath();
  ctx.moveTo(0, -34); ctx.bezierCurveTo(-8, -24, -8, -18, 0, -22);
  ctx.bezierCurveTo(8, -18, 8, -24, 0, -34);
  ctx.fillStyle = "#ffcccc"; ctx.fill();
  // Wavy base lines (book pages)
  ctx.strokeStyle = "#ffcccc"; ctx.lineWidth = 1.5;
  [-4, 0, 4].forEach((dy) => {
    ctx.beginPath();
    ctx.moveTo(-14, dy + 8);
    ctx.bezierCurveTo(-7, dy + 6, 7, dy + 10, 14, dy + 8);
    ctx.stroke();
  });
  ctx.restore();

  return canvas.toDataURL("image/png");
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN CERTIFICATE GENERATOR
// ─────────────────────────────────────────────────────────────────────────────
export function generateCertificatePDF(certData, qrDataUrl) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210, H = 297;

  // Pre-render canvas images
  const regSigUrl = drawRegistrarSignature();
  const vcSigUrl  = drawVCSignature();
  const sealUrl   = drawUniversitySeal();
  const waxUrl    = drawWaxSeal();

  // ── 1. BACKGROUND ─────────────────────────────────────────────────────────
  doc.setFillColor(240, 238, 228); // matches the warm grey-cream of PU cert
  doc.rect(0, 0, W, H, "F");

  // ── 2. WATERMARK — tiled diagonal text ────────────────────────────────────
  doc.saveGraphicsState();
  doc.setGState(new doc.GState({ opacity: 0.06 }));
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 100);
  const wm = "PONDICHERRY UNIVERSITY  ";
  for (let row = -2; row < 20; row++) {
    for (let col = -1; col < 6; col++) {
      doc.text(wm, col * 55 - 10, row * 18 + 5, { angle: 45 });
    }
  }
  doc.restoreGraphicsState();

  // ── 3. OUTER BORDER (thick dark grey, matches PU cert) ───────────────────
  doc.setDrawColor(70, 70, 70);
  doc.setLineWidth(4);
  doc.rect(6, 6, W - 12, H - 12);

  // ── 4. INNER BORDER (thin, 3 mm inside outer) ─────────────────────────────
  doc.setDrawColor(90, 90, 90);
  doc.setLineWidth(0.7);
  doc.rect(9.5, 9.5, W - 19, H - 19);

  // ── 5. SERIAL NO. (top-left) ──────────────────────────────────────────────
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(30, 30, 30);
  doc.text("Serial No. :", 13, 18);
  doc.setFont("helvetica", "bold");
  doc.text(certData.certificateId, 35, 18);

  // Numbered box — shows FULL registration number (like "0032" box in original)
  const regNo      = certData.registrationNumber.toUpperCase();
  doc.setFontSize(7.5);
  // Measure text width so box auto-sizes to fit any reg number length
  const regNoWidth = doc.getTextWidth(regNo);
  const boxW       = Math.max(28, regNoWidth + 6); // minimum 28mm, expands if needed
  const boxX       = 13;
  const boxY       = 20;
  const boxH       = 7;
  doc.setDrawColor(30, 30, 30);
  doc.setLineWidth(0.7);
  doc.rect(boxX, boxY, boxW, boxH);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 20, 20);
  doc.text(regNo, boxX + boxW / 2, boxY + 4.8, { align: "center" });

  // ── 6. ENROLMENT NO. (top-right, before QR) ───────────────────────────────
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(30, 30, 30);
  doc.text("Enrolment No. :", W - 65, 18);
  doc.setFont("helvetica", "bold");
  doc.text(certData.registrationNumber, W - 30, 18);

  // ── 7. QR CODE — top-right corner (the empty space, clear of all text) ────
  const qrSize = 24;
  const qrX    = W - 13 - qrSize;
  const qrY    = 20;
  if (qrDataUrl) {
    doc.setFillColor(255, 255, 255);
    doc.rect(qrX - 0.5, qrY - 0.5, qrSize + 1, qrSize + 1, "F");
    doc.setDrawColor(160, 160, 160);
    doc.setLineWidth(0.3);
    doc.rect(qrX - 0.5, qrY - 0.5, qrSize + 1, qrSize + 1);
    doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);
  }

  // ── 8. UNIVERSITY LOGO (circular blue seal, centre of header) ─────────────
  const logoSize = 30;
  doc.addImage(sealUrl, "PNG", W / 2 - logoSize / 2, 42, logoSize, logoSize);

  // ── 9. GOTHIC UNIVERSITY TITLE ────────────────────────────────────────────
  // The original uses a blackletter/gothic font — we emulate with Times Bold Italic
  // at a large size with letter spacing achieved via character-by-character rendering
  doc.setFont("times", "bolditalic");
  doc.setFontSize(36);
  doc.setTextColor(15, 15, 90);
  doc.text("Pondicherry University", W / 2, 38, { align: "center" });

  // ── 10. THIN RULE BELOW LOGO ──────────────────────────────────────────────
  doc.setDrawColor(80, 80, 80);
  doc.setLineWidth(0.5);
  doc.line(13, 76, W - 13, 76);

  // ── 11. BODY TEXT ─────────────────────────────────────────────────────────
  const LM = 20;   // left margin
  const RM = W - 20; // right margin
  const BW = RM - LM;
  let y = 90;

  // Preamble — italic, centred, multi-line justified
  doc.setFont("times", "italic");
  doc.setFontSize(13);
  doc.setTextColor(15, 15, 15);

  const preamble =
    "The Vice-Chancellor and the Executive Council of the " +
    "Pondicherry University, on the recommendations of the duly " +
    "appointed Board of Examiners, hereby declare that";

  const pLines = doc.splitTextToSize(preamble, BW);
  pLines.forEach((line, i) => {
    // Justify all lines except the last
    if (i < pLines.length - 1) {
      justifyLine(doc, line, LM, y, BW);
    } else {
      doc.text(line, LM, y);
    }
    y += 8;
  });

  y += 8;

  // ── Student name ──────────────────────────────────────────────────────────
  doc.setFont("times", "bold");
  doc.setFontSize(18);
  doc.setTextColor(10, 10, 10);
  doc.text(certData.studentName.toUpperCase(), W / 2, y, { align: "center" });
  y += 12;

  // ── "has been admitted to the Degree of" ──────────────────────────────────
  doc.setFont("times", "bolditalic");
  doc.setFontSize(13);
  doc.setTextColor(15, 15, 15);
  doc.text("has been admitted to the Degree of", W / 2, y, { align: "center" });
  y += 12;

  // ── Degree ────────────────────────────────────────────────────────────────
  doc.setFont("times", "bold");
  doc.setFontSize(15);
  doc.setTextColor(10, 10, 10);
  const degLines = doc.splitTextToSize(certData.degree.toUpperCase(), BW);
  degLines.forEach((line) => {
    doc.text(line, W / 2, y, { align: "center" });
    y += 9;
  });

  y += 6;

  // ── "and placed in FIRST CLASS…" ──────────────────────────────────────────
  const examDate = certData.issueDate
    ? new Date(certData.issueDate * 1000)
        .toLocaleString("en-IN", { month: "long", year: "numeric" })
        .toUpperCase()
    : "DECEMBER 2024";

  const bodyPart2 =
    `and placed in FIRST CLASS at the Examination held in ${examDate}. ` +
    `He/She has completed the degree under Department of Information Technology, ` +
    `${certData.institution}.`;

  doc.setFont("times", "italic");
  doc.setFontSize(13);
  doc.setTextColor(15, 15, 15);
  const b2Lines = doc.splitTextToSize(bodyPart2, BW);
  b2Lines.forEach((line, i) => {
    if (i < b2Lines.length - 1) {
      justifyLine(doc, line, LM, y, BW);
    } else {
      doc.text(line, LM, y);
    }
    y += 8;
  });

  y += 14;

  // ── "Given under the Seal of the University" ──────────────────────────────
  doc.setFont("times", "bolditalic");
  doc.setFontSize(13);
  doc.setTextColor(20, 20, 20);
  doc.text("Given under the Seal of the University", W / 2, y, { align: "center" });

  y += 6;

  // ── 12. WAX SEAL (large red, centre) ──────────────────────────────────────
  const waxSize = 52;
  doc.addImage(waxUrl, "PNG", W / 2 - waxSize / 2, y, waxSize, waxSize);

  // ── 13. SIGNATURE SECTION ─────────────────────────────────────────────────
  const sigBaseY = H - 50;
  const sigW     = 55;

  // ── Left signature: Registrar ──────────────────────────────────────────────
  const regSigW = 42, regSigH = 14;
  doc.addImage(regSigUrl, "PNG", 15, sigBaseY - regSigH - 2, regSigW, regSigH);
  // Signature line
  doc.setDrawColor(30, 30, 30);
  doc.setLineWidth(0.5);
  doc.line(13, sigBaseY, 13 + sigW, sigBaseY);
  doc.setFont("times", "italic");
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);
  doc.text("Registrar", 13 + sigW / 2, sigBaseY + 6, { align: "center" });

  // ── Right signature: Vice-Chancellor ──────────────────────────────────────
  const vcSigW = 48, vcSigH = 14;
  doc.addImage(vcSigUrl, "PNG", W - 13 - sigW + 2, sigBaseY - vcSigH - 2, vcSigW, vcSigH);
  doc.line(W - 13 - sigW, sigBaseY, W - 13, sigBaseY);
  doc.text("Vice-Chancellor", W - 13 - sigW / 2, sigBaseY + 6, { align: "center" });

  // ── Place + Date (centre bottom) ──────────────────────────────────────────
  doc.setFont("times", "normal");
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);
  doc.text("Puducherry", W / 2, sigBaseY, { align: "center" });
  const dateStr = formatDate(certData.issueDate);
  doc.text(`Date   ${dateStr}`, W / 2, sigBaseY + 7, { align: "center" });

  // ── 14. BLOCKCHAIN MICRO-FOOTER ───────────────────────────────────────────
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(130, 130, 130);
  doc.text(
    `Blockchain Verified  |  Cert ID: ${certData.certificateId}  |  Verify: http://localhost:3000/verify/${certData.certificateId}`,
    W / 2, H - 8, { align: "center" }
  );

  return doc.output("blob");
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: justify a single line of text across a given width
// ─────────────────────────────────────────────────────────────────────────────
function justifyLine(doc, line, x, y, width) {
  const words = line.trim().split(/\s+/);
  if (words.length <= 1) { doc.text(line, x, y); return; }
  const textWidth = doc.getTextWidth(words.join(" "));
  const extraSpace = (width - textWidth) / (words.length - 1);
  let curX = x;
  words.forEach((word, i) => {
    doc.text(word, curX, y);
    curX += doc.getTextWidth(word) + doc.getTextWidth(" ") + extraSpace;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// DOWNLOAD HELPER
// ─────────────────────────────────────────────────────────────────────────────
export function downloadPDF(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement("a");
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
