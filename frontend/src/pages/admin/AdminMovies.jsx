import { useEffect, useState } from 'react';
import { FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api, { errorMessage } from '../../utils/api.js';
import Heading from '../../components/Heading.jsx';
import MovieCard from '../../components/MovieCard.jsx';
import MovieDetailsPopup from '../../components/MovieDetailsPopup.jsx';
import Loader from '../../components/Loader.jsx';

export default function AdminMovies() {
  const [movies, setMovies] = useState(null);
  const [open, setOpen] = useState(null);
  const load = () => api.get('/movies').then((r) => setMovies(r.data));
  useEffect(() => { load(); }, []);

  const remove = async (m) => {
    if (!confirm(`Delete "${m.title}" along with its shows and reviews?`)) return;
    try { await api.delete(`/movies/${m._id}`); toast.success('Movie deleted.'); load(); } catch (e) { toast.error(errorMessage(e)); }
  };

  return (
    <>
      <Heading>Available Movies</Heading>
      {!movies && <Loader />}
      {movies?.length === 0 && <p className="muted center">No movies yet. Add your first one from the film icon.</p>}
      <div className="grid">
        {(movies || []).map((m) => (
          <MovieCard key={m._id} movie={m} onOpen={setOpen}>
            <button className="trash" onClick={() => remove(m)} aria-label={`Delete ${m.title}`}><FiTrash2 /></button>
          </MovieCard>
        ))}
      </div>
      {open && <MovieDetailsPopup movie={open} onClose={() => setOpen(null)} />}
    </>
  );
}
