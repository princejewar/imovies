import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import api, { errorMessage } from '../utils/api.js';
import Heading from '../components/Heading.jsx';
import Loader from '../components/Loader.jsx';
import { fmtTime } from '../utils/format.js';

export default function Shows() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const reschedule = params.get('reschedule');
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState(null);
  const [date, setDate] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get(`/movies/${id}`), api.get(`/shows/movie/${id}`)])
      .then(([m, s]) => { setMovie(m.data); setShows(s.data); setDate(s.data[0] ? dayjs(s.data[0].startsAt).format('YYYY-MM-DD') : ''); })
      .catch((e) => setError(errorMessage(e)));
  }, [id]);

  const dates = useMemo(() => [...new Set((shows || []).map((s) => dayjs(s.startsAt).format('YYYY-MM-DD')))], [shows]);
  const byTheatre = useMemo(() => {
    const groups = {};
    (shows || []).filter((s) => dayjs(s.startsAt).format('YYYY-MM-DD') === date).forEach((s) => (groups[s.theatre._id] ||= { theatre: s.theatre, shows: [] }).shows.push(s));
    return Object.values(groups);
  }, [shows, date]);

  if (error) return <p className="error center">{error}</p>;
  if (!shows) return <Loader />;

  const go = (s) => navigate(`/shows/${s._id}/seats${reschedule ? `?reschedule=${reschedule}` : ''}`);

  return (
    <>
      <Heading>{movie.title}</Heading>
      <p className="muted center">{reschedule ? 'Rescheduling: pick a new date, theatre and showtime' : 'Select a date, theatre and showtime'}</p>
      {shows.length === 0 && <p className="muted center">No upcoming shows yet. <Link to="/">Browse other movies</Link></p>}

      <div className="date-tabs" role="tablist">
        {dates.map((d) => (
          <button key={d} role="tab" aria-selected={d === date} className={d === date ? 'on' : ''} onClick={() => setDate(d)}>
            <small>{dayjs(d).format('ddd')}</small><b>{dayjs(d).format('D')}</b><small>{dayjs(d).format('MMM')}</small>
          </button>
        ))}
      </div>

      <div className="theatre-list">
        {byTheatre.map(({ theatre, shows: list }) => (
          <div className="card theatre-row" key={theatre._id}>
            <div><h3>{theatre.name}</h3><p className="muted">{theatre.location}</p></div>
            <div className="times">
              {list.map((s) => {
                const ratio = s.available / s.total;
                const state = s.available === 0 ? 'sold' : ratio > 0.5 ? 'good' : ratio > 0.2 ? 'mid' : 'low';
                return (
                  <button key={s._id} className={`time ${state}`} disabled={s.available === 0} onClick={() => go(s)} title={s.available ? `${s.available} seats left` : 'Sold out'}>
                    {fmtTime(s.showTime)}<small>{s.available ? `${s.available} left` : 'Sold out'}</small>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
