import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import api, { errorMessage } from '../utils/api.js';
import Heading from '../components/Heading.jsx';
import MovieCard from '../components/MovieCard.jsx';
import MovieDetailsPopup from '../components/MovieDetailsPopup.jsx';
import Loader from '../components/Loader.jsx';

export default function Home() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const [filters, setFilters] = useState({ genre: '', language: '', rating: '' });
  const [options, setOptions] = useState({ genres: [], languages: [] });
  const [movies, setMovies] = useState(null);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(null);

  useEffect(() => { api.get('/movies/filters').then((r) => setOptions(r.data)).catch(() => {}); }, []);

  useEffect(() => {
    setError('');
    api.get('/movies', { params: { q, ...filters } })
      .then((r) => {
        setMovies(r.data);
        const wanted = params.get('movie'); // e.g. from "Write a review" on a ticket
        if (wanted) setOpen(r.data.find((m) => m._id === wanted) || null);
      })
      .catch((e) => setError(errorMessage(e)));
  }, [q, filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const { showing, upcoming } = useMemo(() => {
    const now = dayjs();
    const list = movies || [];
    return { showing: list.filter((m) => !dayjs(m.releaseDate).isAfter(now)), upcoming: list.filter((m) => dayjs(m.releaseDate).isAfter(now)) };
  }, [movies]);

  const set = (k) => (e) => setFilters({ ...filters, [k]: e.target.value });
  const active = q || filters.genre || filters.language || filters.rating;
  const clear = () => { setFilters({ genre: '', language: '', rating: '' }); setParams({}); };
  const close = () => { setOpen(null); if (params.get('movie')) setParams(q ? { q } : {}); };

  return (
    <>
      <Heading>Available Movies</Heading>
      <div className="filters">
        <select value={filters.genre} onChange={set('genre')} aria-label="Filter by genre">
          <option value="">All genres</option>{options.genres.map((g) => <option key={g}>{g}</option>)}
        </select>
        <select value={filters.language} onChange={set('language')} aria-label="Filter by language">
          <option value="">All languages</option>{options.languages.map((l) => <option key={l}>{l}</option>)}
        </select>
        <select value={filters.rating} onChange={set('rating')} aria-label="Filter by rating">
          <option value="">Any rating</option><option value="4">4★ and up</option><option value="3">3★ and up</option>
        </select>
        {active && <button className="link" onClick={clear}>Clear filters</button>}
      </div>
      {q && <p className="muted center">Results for “{q}”</p>}

      {error && <p className="error center">{error}</p>}
      {!movies && !error && <Loader />}
      {movies && showing.length === 0 && upcoming.length === 0 && <p className="muted center">No movies match your search. Try different filters.</p>}
      <div className="grid">{showing.map((m) => <MovieCard key={m._id} movie={m} onOpen={setOpen} />)}</div>

      {upcoming.length > 0 && (
        <>
          <Heading as="h2">Coming Soon</Heading>
          <div className="grid">{upcoming.map((m) => <MovieCard key={m._id} movie={m} onOpen={setOpen} />)}</div>
        </>
      )}
      {open && <MovieDetailsPopup movie={open} onClose={close} />}
    </>
  );
}
