import { useEffect, useState } from 'react';
import api from '../utils/api.js';
import useAuth from '../hooks/useAuth.js';
import Heading from '../components/Heading.jsx';
import MovieCard from '../components/MovieCard.jsx';
import MovieDetailsPopup from '../components/MovieDetailsPopup.jsx';
import Loader from '../components/Loader.jsx';

export default function Favorites() {
  const { favorites } = useAuth();
  const [movies, setMovies] = useState(null);
  const [open, setOpen] = useState(null);

  useEffect(() => { api.get('/favorites').then((r) => setMovies(r.data)); }, []);
  const visible = (movies || []).filter((m) => favorites.includes(m._id));

  return (
    <>
      <Heading>Your Favorites</Heading>
      {!movies && <Loader />}
      {movies && visible.length === 0 && <p className="muted center">Nothing saved yet. Tap the heart on any movie.</p>}
      <div className="grid">{visible.map((m) => <MovieCard key={m._id} movie={m} onOpen={setOpen} />)}</div>
      {open && <MovieDetailsPopup movie={open} onClose={() => setOpen(null)} />}
    </>
  );
}
