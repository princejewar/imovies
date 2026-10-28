import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import { FaWheelchair } from 'react-icons/fa';
import api, { errorMessage } from '../utils/api.js';
import { SOCKET_URL } from '../host.js';
import Loader from '../components/Loader.jsx';
import { cap, fmtDate, fmtTime } from '../utils/format.js';

const MAX_SEATS = 8;
const PER_ROW = 10;
const ORDER = ['lower', 'middle', 'balcony']; // front of the hall to the back
const METHODS = [['upi', 'UPI'], ['card', 'Card'], ['netbanking', 'Net banking'], ['wallet', 'Wallet']];

const mmss = (ms) => `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`;

export default function SeatSelection() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const rescheduleId = params.get('reschedule');
  const navigate = useNavigate();

  const [show, setShow] = useState(null);
  const [old, setOld] = useState(null); // booking being rescheduled
  const [selected, setSelected] = useState([]);
  const [holds, setHolds] = useState({});
  const [mySocket, setMySocket] = useState(null);
  const [live, setLive] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [step, setStep] = useState('seats'); // seats -> review (-> payment)
  const [method, setMethod] = useState('upi');
  const [promoInput, setPromoInput] = useState('');
  const [promo, setPromo] = useState(null);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState('');
  const [error, setError] = useState('');
  const socketRef = useRef(null);

  useEffect(() => {
    api.get(`/shows/${id}`).then((r) => setShow(r.data)).catch((e) => setError(errorMessage(e)));
    if (rescheduleId) api.get(`/bookings/${rescheduleId}`).then((r) => setOld(r.data)).catch(() => {});

    const socket = io(SOCKET_URL);
    socketRef.current = socket;
    socket.on('connect', () => { setLive(true); setMySocket(socket.id); socket.emit('join-show', id); });
    socket.on('disconnect', () => setLive(false));
    socket.on('holds', setHolds);
    socket.on('seats-updated', (bookedSeats) => {
      setShow((s) => (s ? { ...s, bookedSeats } : s));
      setSelected((sel) => sel.filter((n) => !bookedSeats.includes(n)));
    });
    socket.on('hold-expired', ({ seat }) => {
      setSelected((sel) => sel.filter((n) => n !== seat));
      toast.warn(`Your hold on seat ${seat} expired. Pick it again if you still want it.`);
    });
    return () => socket.disconnect();
  }, [id, rescheduleId]);

  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);

  useEffect(() => { if (step === 'review' && selected.length === 0) setStep('seats'); }, [step, selected]);

  const layout = useMemo(() => (show ? [...show.layout].sort((a, b) => ORDER.indexOf(a.tier) - ORDER.indexOf(b.tier)) : []), [show]);
  const priceOf = (n) => layout.find((t) => n >= t.start && n <= t.end);
  const items = [...selected].sort((a, b) => a - b).map((n) => ({ number: n, ...priceOf(n) }));
  const subtotal = items.reduce((s, i) => s + i.price, 0);
  const discount = promo ? promo.discount : 0;
  const total = subtotal - discount;
  const due = old ? subtotal - old.total : total;

  const myHoldEnds = Object.values(holds).filter((h) => h.by === mySocket).map((h) => h.expiresAt);
  const remaining = myHoldEnds.length ? Math.min(...myHoldEnds) - now : null;

  if (error && !show) return <p className="error center">{error}</p>;
  if (!show) return <Loader />;

  const statusOf = (n) => {
    if (show.bookedSeats.includes(n)) return 'booked';
    if (selected.includes(n)) return 'selected';
    if (holds[n] && holds[n].by !== mySocket) return 'held';
    return 'free';
  };

  const toggle = (n) => {
    const status = statusOf(n);
    if (status === 'booked' || status === 'held') return;
    if (status === 'selected') {
      socketRef.current.emit('release-seat', { showId: id, seat: n });
      return setSelected((s) => s.filter((x) => x !== n));
    }
    if (selected.length >= MAX_SEATS) return toast.info(`You can book up to ${MAX_SEATS} seats at a time.`);
    socketRef.current.emit('hold-seat', { showId: id, seat: n }, (ok) => {
      if (ok) setSelected((s) => [...s, n]);
      else toast.error(`Seat ${n} was just taken by someone else.`);
    });
  };

  const applyPromo = async () => {
    try { const { data } = await api.post('/bookings/promo', { code: promoInput, amount: subtotal }); setPromo(data); toast.success(`${data.code} applied: you save ₹${data.discount}`); }
    catch (e) { setPromo(null); toast.error(errorMessage(e)); }
  };

  const goReview = () => { setPromo(null); setPromoInput(''); setFailure(''); setStep('review'); };

  const pay = async () => {
    setBusy(true);
    setFailure('');
    try {
      const body = { showId: id, seats: selected, paymentMethod: method };
      const { data } = rescheduleId
        ? await api.post(`/bookings/${rescheduleId}/reschedule`, body)
        : await api.post('/bookings', { ...body, promoCode: promo?.code });
      toast.success(rescheduleId ? 'Booking rescheduled!' : 'Payment successful. Booking confirmed!');
      navigate(`/booking/${data._id}`);
    } catch (e) {
      if (e.response?.status === 402) setFailure(errorMessage(e));
      else {
        toast.error(errorMessage(e));
        if (e.response?.status === 409) { setSelected([]); setStep('seats'); }
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="seat-page">
      <div className="seat-main">
        <h1 className="heading">{show.movie.title}</h1>
        <p className="muted center">
          {show.theatre.name}, {show.theatre.location} · {fmtDate(show.startsAt)} · {fmtTime(show.showTime)}
          <span className={`live ${live ? 'on' : ''}`}>{live ? 'Live seats' : 'Reconnecting…'}</span>
        </p>
        {old && <p className="banner">Rescheduling your booking of ₹{old.total}. You'll only pay or get back the price difference.</p>}

        <div className="screen" aria-hidden="true">Screen this way</div>
        <div className="seatmap" role="group" aria-label="Seat map">
          {layout.map((t) => {
            const nums = Array.from({ length: t.count }, (_, i) => t.start + i);
            const rows = Array.from({ length: Math.ceil(nums.length / PER_ROW) }, (_, i) => nums.slice(i * PER_ROW, (i + 1) * PER_ROW));
            return (
              <section key={t.tier} className="tier">
                <h3>{cap(t.tier)} <span>₹{t.price}</span></h3>
                {rows.map((row, ri) => (
                  <div className="seat-row" key={ri}>
                    {row.map((n) => {
                      const status = statusOf(n);
                      const accessible = t.tier === 'lower' && n - t.start < 2;
                      return (
                        <button key={n} className={`seat ${status} ${accessible ? 'accessible' : ''}`}
                          disabled={status === 'booked' || status === 'held' || step === 'review'}
                          onClick={() => toggle(n)} aria-pressed={status === 'selected'}
                          aria-label={`${cap(t.tier)} seat ${n}, ₹${t.price}, ${status}${accessible ? ', wheelchair accessible' : ''}`}
                          title={accessible ? 'Wheelchair accessible' : undefined}>
                          {accessible ? <FaWheelchair aria-hidden="true" /> : n}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </section>
            );
          })}
        </div>
        <div className="legend">
          <span><i className="seat free" /> Available</span><span><i className="seat selected" /> Yours</span>
          <span><i className="seat held" /> Someone is choosing</span><span><i className="seat booked" /> Booked</span>
          <span><i className="seat free accessible"><FaWheelchair aria-hidden="true" /></i> Accessible</span>
        </div>
      </div>

      <aside className="card summary">
        {step === 'seats' ? (
          <>
            <h2>Your seats</h2>
            {items.length === 0 ? <p className="muted">Pick up to {MAX_SEATS} seats on the map.</p> : (
              <>
                <ul className="lines">{items.map((i) => <li key={i.number}><span>{cap(i.tier)} · seat {i.number}</span><b>₹{i.price}</b></li>)}</ul>
                <div className="total"><span>Total</span><b>₹{subtotal}</b></div>
                {remaining !== null && remaining > 0 && <p className="hold">Seats held for {mmss(remaining)}</p>}
              </>
            )}
            <button className="btn full" disabled={!items.length} onClick={goReview}>Review booking</button>
          </>
        ) : (
          <>
            <h2>Review booking</h2>
            <p className="muted">{show.movie.title}<br />{fmtDate(show.startsAt)} · {fmtTime(show.showTime)} · {show.theatre.name}</p>
            <ul className="lines">{items.map((i) => <li key={i.number}><span>{cap(i.tier)} · seat {i.number}</span><b>₹{i.price}</b></li>)}</ul>
            <div className="total"><span>Subtotal</span><b>₹{subtotal}</b></div>
            {!old && (
              <div className="promo">
                <input placeholder="Promo code" value={promoInput} onChange={(e) => setPromoInput(e.target.value.toUpperCase())} aria-label="Promo code" />
                <button className="btn btn-sm btn-ghost" onClick={applyPromo} disabled={!promoInput}>Apply</button>
              </div>
            )}
            {discount > 0 && <div className="total save"><span>Promo {promo.code}</span><b>−₹{discount}</b></div>}
            {old ? (
              <div className="total"><span>{due > 0 ? 'To pay now' : due < 0 ? 'Refund' : 'Difference'}</span><b>₹{Math.abs(due)}</b></div>
            ) : (
              <div className="total grand"><span>To pay</span><b>₹{total}</b></div>
            )}

            <fieldset className="methods"><legend>Payment method</legend>
              {METHODS.map(([v, label]) => (
                <label key={v} className={method === v ? 'on' : ''}><input type="radio" name="method" value={v} checked={method === v} onChange={() => setMethod(v)} /> {label}</label>
              ))}
            </fieldset>

            {failure && (
              <div className="failure" role="alert">
                <b>Payment failed</b>
                <p>{failure}</p>
                <p className="muted">Your seats are released. Try again or choose another method.</p>
              </div>
            )}
            <button className="btn full" disabled={busy} onClick={pay}>
              {busy ? 'Processing payment…' : failure ? 'Retry payment' : old ? 'Confirm reschedule' : `Pay ₹${total}`}
            </button>
            <button className="btn btn-ghost full" disabled={busy} onClick={() => setStep('seats')}>Change seats</button>
            <p className="muted small">Demo checkout: payments are simulated, no money moves.</p>
          </>
        )}
      </aside>
    </div>
  );
}
