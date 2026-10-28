import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiCheckCircle, FiDownload } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api, { errorMessage } from '../utils/api.js';
import Loader from '../components/Loader.jsx';
import { fmtDate, fmtTime, groupSeats } from '../utils/format.js';

export default function BookingConfirmation() {
  const { id } = useParams();
  const [b, setB] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { api.get(`/bookings/${id}`).then((r) => setB(r.data)).catch((e) => setError(errorMessage(e))); }, [id]);

  const download = async () => {
    try {
      const { data } = await api.get(`/bookings/${id}/ticket`, { responseType: 'blob' });
      const url = URL.createObjectURL(data);
      const a = Object.assign(document.createElement('a'), { href: url, download: `imovies-ticket-${b.ticketCode.slice(0, 8)}.pdf` });
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) { toast.error(errorMessage(e)); }
  };

  if (error) return <p className="error center">{error}</p>;
  if (!b) return <Loader />;

  return (
    <div className="confirm">
      <FiCheckCircle className="tick" aria-hidden="true" />
      <h1 className="heading">Booking <span>{b.status === 'confirmed' ? 'Confirmed' : b.status}</span></h1>
      <p className="muted">A confirmation and receipt were sent to your alerts{' '}<Link to="/alerts">(view)</Link>.</p>

      <div className="ticket">
        <div className="ticket-main">
          <h2>{b.movie.title}</h2>
          <dl>
            <div><dt>Theatre</dt><dd>{b.theatre.name}, {b.theatre.location}</dd></div>
            <div><dt>Date</dt><dd>{fmtDate(b.show.startsAt)}</dd></div>
            <div><dt>Time</dt><dd>{fmtTime(b.show.showTime)}</dd></div>
            {groupSeats(b.seats).map(([tier, nums]) => <div key={tier}><dt>{tier}</dt><dd>{nums.join(', ')}</dd></div>)}
            <div><dt>Paid</dt><dd>₹{b.total}{b.promoCode && <small className="muted"> ({b.promoCode} saved ₹{b.discount})</small>}</dd></div>
            {b.payment && <div><dt>Receipt</dt><dd>{b.payment.transactionId}</dd></div>}
          </dl>
        </div>
        <div className="ticket-qr">
          <img src={b.qr} alt="QR code for entry" width="180" height="180" />
          <small className="muted">Scan at the entrance</small>
        </div>
      </div>

      <div className="confirm-actions">
        <button className="btn" onClick={download}><FiDownload /> Download e-ticket (PDF)</button>
        <Link to="/bookings" className="btn btn-ghost">My bookings</Link>
        <Link to={`/?movie=${b.movie._id}`} className="btn btn-ghost">Write a review</Link>
      </div>
    </div>
  );
}
