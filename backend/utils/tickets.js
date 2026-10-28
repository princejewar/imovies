import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import dayjs from 'dayjs';

export const qrDataUrl = (booking) => QRCode.toDataURL(booking.ticketCode, { margin: 1, width: 220 });

const groupSeats = (seats) =>
  Object.entries(
    seats.reduce((acc, s) => ((acc[s.tier] ||= []).push(s.number), acc), {})
  ).map(([tier, nums]) => `${tier[0].toUpperCase()}${tier.slice(1)}: ${nums.sort((a, b) => a - b).join(', ')}`);

// Streams a PDF e-ticket (with QR code) to the response. booking must have movie, theatre and show populated.
export async function streamTicket(booking, res) {
  const qr = await QRCode.toBuffer(booking.ticketCode, { margin: 1, width: 240 });
  const doc = new PDFDocument({ size: [420, 640], margin: 32 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="imovies-ticket-${booking.ticketCode.slice(0, 8)}.pdf"`);
  doc.pipe(res);

  doc.rect(0, 0, 420, 90).fill('#0e1628');
  doc.fillColor('#dc143c').fontSize(26).text('i', 32, 30, { continued: true }).fillColor('#ffffff').text('Movies');
  doc.fillColor('#9aa3b5').fontSize(10).text('E-TICKET', 32, 64);

  doc.fillColor('#111111').fontSize(20).text(booking.movie.title, 32, 112, { width: 356 });
  doc.moveDown(0.8).fontSize(11).fillColor('#444444');
  const rows = [
    ['Theatre', `${booking.theatre.name}, ${booking.theatre.location}`],
    ['Date', dayjs(booking.show.startsAt).format('ddd, D MMM YYYY')],
    ['Time', booking.show.showTime],
    ['Seats', groupSeats(booking.seats).join('  |  ')],
    ['Amount paid', `Rs. ${booking.total}`],
    ['Status', booking.status],
  ];
  rows.forEach(([k, v]) => {
    doc.fillColor('#888888').fontSize(9).text(k.toUpperCase());
    doc.fillColor('#111111').fontSize(12).text(v).moveDown(0.5);
  });
  doc.image(qr, 110, 430, { width: 200 });
  doc.fillColor('#666666').fontSize(9).text(`Ticket code: ${booking.ticketCode}`, 32, 640 - 70, { width: 356, align: 'center' });
  doc.text('Show this QR code at the cinema entrance.', { width: 356, align: 'center' });
  doc.end();
}
