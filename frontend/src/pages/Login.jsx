import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuth from '../hooks/useAuth.js';
import { errorMessage } from '../utils/api.js';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [admin, setAdmin] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const user = await login(form.email, form.password, admin ? 'admin' : 'user');
      toast.success(`Welcome back, ${user.username}!`);
      navigate(user.role === 'admin' ? '/admin' : location.state?.from || '/', { replace: true });
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={submit}>
        <Link to="/" className="logo center-logo"><i>i</i>Movies</Link>
        <h1>{admin ? 'Admin login' : 'Login'}</h1>
        <label>Email<input type="email" placeholder="Enter your email" value={form.email} onChange={set('email')} required autoComplete="email" /></label>
        <label>Password<input type={show ? 'text' : 'password'} placeholder="Enter your password" value={form.password} onChange={set('password')} required autoComplete="current-password" /></label>
        <label className="check"><input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} /> Show Password</label>
        <button className="btn" disabled={busy}>{busy ? 'Signing in…' : 'Submit'}</button>
        <p className="alt">New here? <Link to="/register">Register</Link></p>
        <p className="alt"><button type="button" className="link" onClick={() => setAdmin(!admin)}>{admin ? 'Login as a customer' : 'Login as an Admin'}</button></p>
      </form>
    </div>
  );
}
