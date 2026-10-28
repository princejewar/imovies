import { useState } from 'react';
import { toast } from 'react-toastify';
import api, { errorMessage } from '../../utils/api.js';
import Heading from '../../components/Heading.jsx';

const TIERS = ['balcony', 'middle', 'lower'];
const empty = { name: '', location: '', balconyPrice: 0, balconyCount: 0, middlePrice: 0, middleCount: 0, lowerPrice: 0, lowerCount: 0 };

export default function AddTheatre() {
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const tiers = Object.fromEntries(TIERS.map((t) => [t, { price: form[`${t}Price`], count: form[`${t}Count`] }]));
      await api.post('/theatres', { name: form.name, location: form.location, tiers });
      toast.success('Theatre added.');
      setForm(empty);
    } catch (err) { toast.error(errorMessage(err)); }
    finally { setBusy(false); }
  };

  return (
    <div className="narrow">
      <Heading>Add Theatre</Heading>
      <form className="card form" onSubmit={submit}>
        <label>Theatre Name<input value={form.name} onChange={set('name')} required /></label>
        <label>Theatre Location<input value={form.location} onChange={set('location')} required /></label>
        <div className="two-col">
          {TIERS.flatMap((t) => [
            <label key={`${t}p`}>{`${t[0].toUpperCase()}${t.slice(1)} Seat Price`}<input type="number" min="0" value={form[`${t}Price`]} onChange={set(`${t}Price`)} /></label>,
            <label key={`${t}c`}>{`${t[0].toUpperCase()}${t.slice(1)} Seat Count`}<input type="number" min="0" max="300" value={form[`${t}Count`]} onChange={set(`${t}Count`)} /></label>,
          ])}
        </div>
        <p className="muted small">Seats are numbered from the balcony down to the lower tier. The first two lower seats are marked wheelchair accessible.</p>
        <div className="center"><button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Submit'}</button></div>
      </form>
    </div>
  );
}
