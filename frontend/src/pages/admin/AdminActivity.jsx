import { useEffect, useState } from 'react';
import { FiTrash2, FiVideo } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api, { errorMessage } from '../../utils/api.js';
import Heading from '../../components/Heading.jsx';
import Loader from '../../components/Loader.jsx';
import { fmtDate, fmtTime, groupSeats } from '../../utils/format.js';

export default function AdminActivity() {
  const [shows, setShows] = useState(null);
  const [bookings, setBookings] = useState(null);
  const load = () => {
    api.get('/shows').then((r) => setShows(r.data));
    api.get('/admin/bookings').then((r) => setBookings(r.data));
  };
  useEffect(load, []);

  const remove = async (id) => {
    if (!confirm('Delete this show?')) return;
    try { await api.delete(`/shows/${id}`); toast.success('Show deleted.'); load(); } catch (e) { toast.error(errorMessage(e)); }
  };

  return (
    <>
      <Heading>Admin Shows</Heading>
      {!shows && <Loader />}
      {shows?.length === 0 && <p className="muted center">No shows scheduled.</p>}
      <div className="card-grid">
        {(shows || []).map((s) => (
          <div className="card info-card" key={s._id}>
            <FiVideo className="ico" aria-hidden="true" />
            <dl>
              <div><dt>Movie:</dt><dd>{s.movie?.title}</dd></div>
              <div><dt>Theatre:</dt><dd>{s.theatre?.name}</dd></div>
              <div><dt>Showdate:</dt><dd>{fmtDate(s.startsAt)}</dd></div>
              <div><dt>Showtime:</dt><dd>{fmtTime(s.showTime)}</dd></div>
              <div><dt>Seats booked:</dt><dd>{s.booked} / {s.total}</dd></div>
            </dl>
            <button className="btn-outline-full" onClick={() => remove(s._id)} aria-label="Delete show"><FiTrash2 /></button>
          </div>
        ))}
      </div>

      <Heading>All Bookings</Heading>
      {!bookings && <Loader />}
      {bookings?.length === 0 && <p className="muted center">No bookings yet.</p>}
      <div className="card-grid wide">
        {(bookings || []).map((b) => (
          <div className={`card info-card ${b.status !== 'confirmed' ? 'inactive' : ''}`} key={b._id}>
            <FiVideo className="ico" aria-hidden="true" />
            <dl>
              <div><dt>User:</dt><dd>{b.user?.email}</dd></div>
              <div><dt>Movie:</dt><dd>{b.movie?.title}</dd></div>
              <div><dt>Theatre:</dt><dd>{b.theatre?.name}</dd></div>
              <div><dt>Show:</dt><dd>{b.show && `${fmtDate(b.show.showDate)} · ${fmtTime(b.show.showTime)}`}</dd></div>
              {groupSeats(b.seats).map(([tier, nums]) => <div key={tier}><dt>{tier} Seats:</dt><dd>{nums.join(', ')}</dd></div>)}
              <div><dt>Total:</dt><dd>₹{b.total} <small className="muted">{b.payment?.method} · {b.payment?.status}</small></dd></div>
              <div><dt>Status:</dt><dd><span className={`status ${b.status}`}>{b.status}</span></dd></div>
            </dl>
          </div>
        ))}
      </div>
    </>
  );
}
