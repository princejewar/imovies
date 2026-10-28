import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import api, { errorMessage } from '../../utils/api.js';
import Heading from '../../components/Heading.jsx';

const empty = { code: '', type: 'percent', value: '', minAmount: '', maxDiscount: '', expiresAt: '' };

export default function AdminPromos() {
  const [promos, setPromos] = useState([]);
  const [form, setForm] = useState(empty);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const load = () => api.get('/admin/promos').then((r) => setPromos(r.data));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try { await api.post('/admin/promos', form); toast.success('Promo code created.'); setForm(empty); load(); }
    catch (err) { toast.error(errorMessage(err)); }
  };
  const toggle = async (id) => { await api.patch(`/admin/promos/${id}`); load(); };
  const remove = async (id) => { if (confirm('Delete this promo code?')) { await api.delete(`/admin/promos/${id}`); load(); } };

  return (
    <>
      <Heading>Promo Codes</Heading>
      <form className="card form two-col" onSubmit={submit}>
        <label>Code<input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="WELCOME10" required /></label>
        <label>Type
          <select value={form.type} onChange={set('type')}><option value="percent">Percentage off</option><option value="flat">Flat amount off (₹)</option></select>
        </label>
        <label>Value<input type="number" min="1" value={form.value} onChange={set('value')} required /></label>
        <label>Minimum order (₹)<input type="number" min="0" value={form.minAmount} onChange={set('minAmount')} /></label>
        <label>Max discount (₹, for % codes)<input type="number" min="0" value={form.maxDiscount} onChange={set('maxDiscount')} /></label>
        <label>Expires on<input type="date" value={form.expiresAt} onChange={set('expiresAt')} /></label>
        <div className="span-2 center"><button className="btn">Create code</button></div>
      </form>

      <div className="card table-wrap spaced">
        <table>
          <thead><tr><th>Code</th><th>Discount</th><th>Minimum</th><th>Expires</th><th>Active</th><th /></tr></thead>
          <tbody>
            {promos.map((p) => (
              <tr key={p._id}>
                <td><b>{p.code}</b></td>
                <td>{p.type === 'percent' ? `${p.value}%${p.maxDiscount ? ` (max ₹${p.maxDiscount})` : ''}` : `₹${p.value}`}</td>
                <td>{p.minAmount ? `₹${p.minAmount}` : '–'}</td>
                <td>{p.expiresAt ? dayjs(p.expiresAt).format('D MMM YYYY') : 'Never'}</td>
                <td><button className="link" onClick={() => toggle(p._id)}>{p.active ? 'On' : 'Off'}</button></td>
                <td className="end"><button className="link" onClick={() => remove(p._id)}>Delete</button></td>
              </tr>
            ))}
            {promos.length === 0 && <tr><td colSpan={6} className="muted">No promo codes yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
