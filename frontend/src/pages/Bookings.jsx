import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import api, { errorMessage } from '../utils/api.js';
import Heading from '../components/Heading.jsx';
import Poster from '../components/Poster.jsx';
import Loader from '../components/Loader.jsx';
import { fmtDate, fmtTime, groupSeats } from '../utils/format.js';

const CUTOFF_H = 2;

export default function Bookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState(null);

  const load = () => api.get('/bookings/mine').then((r) => setBookings(r.data)).catch((e) => toast.error(errorMessage(e)));
  useEffect(() => { load(); }, []);

  const cancel = async (id) => {
    if (!confirm('Cancel this booking? Your seats are released and the full amount is refunded.')) return;
    try { await api.delete(`/bookings/${id}`); toast.success('Booking cancelled. Refund initiated.'); load(); }
    catch (e) { toast.error(errorMessage(e)); }
  };

  if (!bookings) return <Loader />;
  return (
    <>
      <Heading>Your Bookings</Heading>
      {bookings.length === 0 && <p className="muted center">No bookings yet. <Link to="/">Find a movie</Link></p>}
      <div className="booking-grid">
        {bookings.map((b) => {
          const canChange = b.status === 'confirmed' && dayjs(b.show.startsAt).diff(dayjs(), 'hour', true) >= CUTOFF_H;
          return (
            <article key={b._id} className={`card booking ${b.status !== 'confirmed' ? 'inactive' : ''}`}>
              <Poster movie={b.movie} className="booking-poster" />
              <dl>
                <div><dt>Movie:</dt><dd>{b.movie.title}</dd></div>
                <div><dt>Theatre:</dt><dd>{b.theatre.name}</dd></div>
                <div><dt>Showdate:</dt><dd>{fmtDate(b.show.startsAt)}</dd></div>
                <div><dt>Showtime:</dt><dd>{fmtTime(b.show.showTime)}</dd></div>
                {groupSeats(b.seats).map(([tier, nums]) => <div key={tier}><dt>{tier} Seats:</dt><dd>{nums.join(', ')}</dd></div>)}
                <div><dt>Total Price:</dt><dd>₹{b.total}{b.discount > 0 && <small className="muted"> (saved ₹{b.discount})</small>}</dd></div>
                <div><dt>Status:</dt><dd><span className={`status ${b.status}`}>{b.status}</span></dd></div>
                <div className="actions">
                  {b.status === 'confirmed' && <button className="btn btn-sm" onClick={() => navigate(`/booking/${b._id}`)}>E-ticket</button>}
                  {canChange && <button className="btn btn-sm btn-ghost" onClick={() => navigate(`/movie/${b.movie._id}/shows?reschedule=${b._id}`)}>Reschedule</button>}
                  {canChange && <button className="btn btn-sm btn-ghost" onClick={() => cancel(b._id)}>Cancel</button>}
                  {b.status === 'confirmed' && !canChange && <small className="muted">Changes close {CUTOFF_H} hours before the show</small>}
                </div>
              </dl>
            </article>
          );
        })}
      </div>
    </>
  );
}
