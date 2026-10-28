import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import { FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import api, { errorMessage } from '../utils/api.js';
import useAuth from '../hooks/useAuth.js';
import Poster from './Poster.jsx';
import { fmtDate } from '../utils/format.js';

const Stars = ({ value, onChange }) => (
  <span className="stars">
    {[1, 2, 3, 4, 5].map((n) => (
      <button key={n} type="button" className={n <= value ? 'on' : ''} onClick={() => onChange?.(n)} disabled={!onChange} aria-label={`${n} star${n > 1 ? 's' : ''}`}>
        <FaStar />
      </button>
    ))}
  </span>
);

export default function MovieDetailsPopup({ movie, onClose }) {
  const { user, favorites, toggleFavorite } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [current, setCurrent] = useState(movie);

  const load = () => {
    api.get(`/reviews/movie/${movie._id}`).then((r) => setReviews(r.data));
    api.get(`/movies/${movie._id}`).then((r) => setCurrent(r.data));
  };
  useEffect(load, [movie._id]);

  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', esc);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', esc); document.body.style.overflow = ''; };
  }, [onClose]);

  const mine = reviews.find((r) => r.user?._id === user?.id);
  useEffect(() => { setRating(mine?.rating || 0); setComment(mine?.comment || ''); }, [mine?._id]);

  const upcoming = dayjs(current.releaseDate).isAfter(dayjs());
  const saved = favorites.includes(movie._id);

  const submit = async (e) => {
    e.preventDefault();
    try { await api.post(`/reviews/movie/${movie._id}`, { rating, comment }); toast.success('Thanks for your review!'); load(); }
    catch (err) { toast.error(errorMessage(err)); }
  };
  const remove = async (id) => { await api.delete(`/reviews/${id}`); load(); };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="popup" role="dialog" aria-modal="true" aria-label={`${current.title} details`} onClick={(e) => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose} aria-label="Close"><FiX /></button>
        <div className="popup-grid">
          <Poster movie={current} className="popup-poster" />
          <div>
            <h2>{current.title}</h2>
            <p className="meta">
              {current.certification && <span className="cert">{current.certification}</span>}
              {current.runtime} min · {current.language} · {fmtDate(current.releaseDate)}
            </p>
            {current.ratingCount > 0 && <p className="avg"><FaStar /> {current.rating} <span>({current.ratingCount} {current.ratingCount === 1 ? 'review' : 'reviews'})</span></p>}
            <div className="pills">{current.genres?.map((g) => <span key={g}>{g}</span>)}</div>
            <p className="desc">{current.description}</p>
            {current.cast?.length > 0 && <p className="cast"><b>Cast:</b> {current.cast.join(', ')}</p>}

            <div className="popup-actions">
              {user?.role === 'user' && (
                upcoming
                  ? <button className="btn" disabled>Releases {fmtDate(current.releaseDate)}</button>
                  : <button className="btn" onClick={() => navigate(`/movie/${movie._id}/shows`)}>Book tickets</button>
              )}
              {!user && <button className="btn" onClick={() => navigate('/login')}>Log in to book</button>}
              {user?.role === 'user' && <button className="btn btn-ghost" onClick={() => toggleFavorite(movie._id)}>{saved ? 'In favorites ♥' : 'Add to favorites'}</button>}
              {current.trailerUrl && <a className="btn btn-ghost" href={current.trailerUrl} target="_blank" rel="noreferrer">Watch trailer</a>}
            </div>
          </div>
        </div>

        <h3 className="section-title">Reviews</h3>
        {user?.role === 'user' && (
          <form className="review-form" onSubmit={submit}>
            <div><Stars value={rating} onChange={setRating} /> <span className="muted">{mine ? 'Update your review' : 'Rate this movie'}</span></div>
            <textarea rows={2} maxLength={600} placeholder="What did you think? (optional)" value={comment} onChange={(e) => setComment(e.target.value)} />
            <button className="btn btn-sm" disabled={!rating}>{mine ? 'Update review' : 'Post review'}</button>
          </form>
        )}
        {reviews.length === 0 && <p className="muted">No reviews yet.</p>}
        <div className="reviews">
          {reviews.map((r) => (
            <div className="review" key={r._id}>
              <div className="row"><b>{r.user?.username || 'Guest'}</b><Stars value={r.rating} /></div>
              {r.comment && <p>{r.comment}</p>}
              {(r.user?._id === user?.id || user?.role === 'admin') && <button className="link" onClick={() => remove(r._id)}>Delete</button>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
