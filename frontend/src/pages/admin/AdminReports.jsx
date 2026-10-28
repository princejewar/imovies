import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { toast } from 'react-toastify';
import api, { errorMessage } from '../../utils/api.js';
import Heading from '../../components/Heading.jsx';
import Loader from '../../components/Loader.jsx';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const options = (title) => ({
  responsive: true,
  plugins: { legend: { display: false }, title: { display: true, text: title, color: '#9aa3b5' } },
  scales: { x: { ticks: { color: '#9aa3b5' }, grid: { display: false } }, y: { ticks: { color: '#9aa3b5' }, beginAtZero: true } },
});

export default function AdminReports() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);

  const load = () => {
    api.get('/admin/stats').then((r) => setStats(r.data));
    api.get('/admin/users').then((r) => setUsers(r.data));
    api.get('/admin/payments').then((r) => setPayments(r.data));
  };
  useEffect(load, []);

  const removeUser = async (u) => {
    if (!confirm(`Delete the account of ${u.email}?`)) return;
    try { await api.delete(`/admin/users/${u._id}`); toast.success('User deleted.'); load(); } catch (e) { toast.error(errorMessage(e)); }
  };

  if (!stats) return <Loader />;
  const cards = [['Revenue', `₹${stats.revenue}`], ['Tickets sold', stats.tickets], ['Bookings', stats.bookings], ['Cancelled', stats.cancelled], ['Customers', stats.users], ['Movies', stats.movies], ['Shows', stats.shows], ['Reviews', stats.reviews]];
  const accent = '#dc143c';

  return (
    <>
      <Heading>Reports</Heading>
      <div className="stat-grid">{cards.map(([k, v]) => <div className="card stat" key={k}><span className="muted">{k}</span><b>{v}</b></div>)}</div>

      <div className="chart-grid">
        <div className="card">
          <Bar options={options('Revenue by movie (₹)')} data={{ labels: stats.revenueByMovie.map((r) => r.title), datasets: [{ data: stats.revenueByMovie.map((r) => r.revenue), backgroundColor: accent, borderRadius: 6 }] }} />
          {stats.revenueByMovie.length === 0 && <p className="muted center">No confirmed bookings yet.</p>}
        </div>
        <div className="card">
          <Bar options={options('Revenue, last 7 days (₹)')} data={{ labels: stats.revenueByDay.map((d) => dayjs(d.date).format('D MMM')), datasets: [{ data: stats.revenueByDay.map((d) => d.revenue), backgroundColor: '#3aa99a', borderRadius: 6 }] }} />
        </div>
      </div>

      <Heading as="h2">Payments</Heading>
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Receipt</th><th>Customer</th><th>Method</th><th>Amount</th><th>Refunded</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            {payments.map((p) => <tr key={p._id}><td>{p.transactionId}</td><td>{p.user?.email}</td><td>{p.method}</td><td>₹{p.amount}</td><td>{p.refundedAmount ? `₹${p.refundedAmount}` : '–'}</td><td>{p.status}</td><td>{dayjs(p.createdAt).format('D MMM, h:mm A')}</td></tr>)}
            {payments.length === 0 && <tr><td colSpan={7} className="muted">No payments yet.</td></tr>}
          </tbody>
        </table>
      </div>

      <Heading as="h2">Customers</Heading>
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Joined</th><th /></tr></thead>
          <tbody>
            {users.map((u) => <tr key={u._id}><td>{u.username}</td><td>{u.email}</td><td>{dayjs(u.createdAt).format('D MMM YYYY')}</td><td className="end"><button className="link" onClick={() => removeUser(u)}>Delete</button></td></tr>)}
          </tbody>
        </table>
      </div>
    </>
  );
}
