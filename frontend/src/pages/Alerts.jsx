import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import api from '../utils/api.js';
import useAuth from '../hooks/useAuth.js';
import Heading from '../components/Heading.jsx';
import Loader from '../components/Loader.jsx';

export default function Alerts() {
  const { setUnread } = useAuth();
  const [items, setItems] = useState(null);

  useEffect(() => {
    api.get('/notifications').then(async (r) => {
      setItems(r.data.items);
      if (r.data.unread) { await api.patch('/notifications/read-all'); setUnread(0); }
    });
  }, [setUnread]);

  return (
    <>
      <Heading>Your Alerts</Heading>
      {!items && <Loader />}
      {items?.length === 0 && <p className="muted center">No alerts yet. Booking confirmations, receipts, show reminders and new releases appear here.</p>}
      <div className="stack">
        {(items || []).map((n) => (
          <div key={n._id} className={`card alert-card ${n.read ? '' : 'unread'}`}>
            <div className="row"><b>{n.title}</b><span className="muted">{dayjs(n.createdAt).format('D MMM, h:mm A')}</span></div>
            <p>{n.message}</p>
          </div>
        ))}
      </div>
    </>
  );
}
