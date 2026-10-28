import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUploadCloud, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api, { errorMessage } from '../../utils/api.js';
import Heading from '../../components/Heading.jsx';

const empty = { title: '', description: '', genres: '', language: '', cast: '', releaseDate: '', runtime: '', certification: '', trailerUrl: '', poster: '' };

export default function AddMovie() {
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef();
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) return toast.error('Please choose an image file.');
    if (f.size > 1.5 * 1024 * 1024) return toast.error('The poster must be under 1.5 MB.');
    const r = new FileReader();
    r.onload = () => setForm((x) => ({ ...x, poster: r.result }));
    r.readAsDataURL(f);
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try { await api.post('/movies', form); toast.success('Movie added. Customers were notified.'); navigate('/admin'); }
    catch (err) { toast.error(errorMessage(err)); }
    finally { setBusy(false); }
  };

  return (
    <>
      <div className={`dropzone ${form.poster ? 'has' : ''}`} onClick={() => fileRef.current.click()} role="button" tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && fileRef.current.click()} aria-label="Upload movie poster">
        {form.poster ? <img src={form.poster} alt="Poster preview" /> : <><FiUploadCloud /><span>Click to upload a poster</span><small>JPG or PNG, under 1.5 MB</small></>}
        {form.poster && <button type="button" className="clear" onClick={(e) => { e.stopPropagation(); setForm({ ...form, poster: '' }); }} aria-label="Remove poster"><FiX /></button>}
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
      </div>

      <Heading>Add Movie</Heading>
      <form className="card form two-col" onSubmit={submit}>
        <label>Movie<input placeholder="Enter movie name" value={form.title} onChange={set('title')} required /></label>
        <label>Description<input placeholder="Enter movie description" value={form.description} onChange={set('description')} /></label>
        <label>Genres<input placeholder="Enter movie genres separated by commas" value={form.genres} onChange={set('genres')} /></label>
        <label>Release Date<input type="date" value={form.releaseDate} onChange={set('releaseDate')} required /></label>
        <label>Runtime<input type="number" min="30" placeholder="Enter runtime in minutes" value={form.runtime} onChange={set('runtime')} /></label>
        <label>Certification<input placeholder="Enter movie certification (U, UA, A)" value={form.certification} onChange={set('certification')} /></label>
        <label>Language<input placeholder="Hindi, English…" value={form.language} onChange={set('language')} /></label>
        <label>Cast<input placeholder="Names separated by commas" value={form.cast} onChange={set('cast')} /></label>
        <label className="span-2">Trailer URL (YouTube)<input type="url" placeholder="https://www.youtube.com/watch?v=…" value={form.trailerUrl} onChange={set('trailerUrl')} /></label>
        <div className="span-2 center"><button className="btn" disabled={busy}>{busy ? 'Adding…' : 'Submit'}</button></div>
      </form>
    </>
  );
}
