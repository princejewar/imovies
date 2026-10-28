import { FiCalendar, FiHeart } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { toast } from 'react-toastify';
import useAuth from '../hooks/useAuth.js';
import Poster from './Poster.jsx';
import { fmtDate } from '../utils/format.js';

export default function MovieCard({ movie, onOpen, children }) {
  const { user, favorites, toggleFavorite } = useAuth();
  const saved = favorites.includes(movie._id);

  const heart = async (e) => {
    e.stopPropagation();
    try { await toggleFavorite(movie._id); } catch { toast.error('Could not update your favorites.'); }
  };

  return (
    <article className="movie-card">
      <button className="movie-open" onClick={() => onOpen?.(movie)} aria-label={`View details for ${movie.title}`}>
        <Poster movie={movie} />
        <div className="movie-info">
          <h3>{movie.title}</h3>
          <p className="date"><FiCalendar aria-hidden="true" /> {fmtDate(movie.releaseDate)}</p>
          <div className="pills">{movie.genres?.slice(0, 3).map((g) => <span key={g}>{g}</span>)}</div>
        </div>
      </button>
      {user?.role === 'user' && (
        <button className={`fav ${saved ? 'on' : ''}`} onClick={heart} aria-pressed={saved} aria-label={saved ? 'Remove from favorites' : 'Add to favorites'}>
          {saved ? <FaHeart /> : <FiHeart />}
        </button>
      )}
      {children}
    </article>
  );
}
