import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import api, { errorMessage } from '../../utils/api.js';
import Heading from '../../components/Heading.jsx';

export default function AddShow() {
  const [theatres, setTheatres] = useState([]);
  const [movies, setMovies] = useState([]);
  const [form, setForm] = useState({ theatreId: '', movieId: '', showDate: '', showTime: '' });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  useEffect(() => {
    api.get('/theatres').then((r) => setTheatres(r.data));
    api.get('/movies').then((r) => setMovies(r.data));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try { await api.post('/shows', form); toast.success('Show scheduled.'); setForm({ ...form, showTime: '' }); }
    catch (err) { toast.error(errorMessage(err)); }
    finally { setBusy(false); }
  };

  return (
    <div className="narrow">
      <Heading>Add Show</Heading>
      <form className="card form" onSubmit={submit}>
        <label>Theatres
          <select value={form.theatreId} onChange={set('theatreId')} required>
            <option value="">Select Theatre</option>
            {theatres.map((t) => <option key={t._id} value={t._id}>{t.name} ({t.location})</option>)}
          </select>
        </label>
        <label>Movies
          <select value={form.movieId} onChange={set('movieId')} required>
            <option value="">Select Movie</option>
            {movies.map((m) => <option key={m._id} value={m._id}>{m.title}</option>)}
          </select>
        </label>
        <label>Show Date<input type="date" min={dayjs().format('YYYY-MM-DD')} value={form.showDate} onChange={set('showDate')} required /></label>
        <label>Showtime<input type="time" value={form.showTime} onChange={set('showTime')} required /></label>
        <div className="center"><button className="btn" disabled={busy}>{busy ? 'Scheduling…' : 'Submit'}</button></div>
      </form>
    </div>
  );
}
