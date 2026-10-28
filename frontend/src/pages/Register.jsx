import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuth from '../hooks/useAuth.js';
import { errorMessage } from '../utils/api.js';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '', accessCode: '' });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match.');
    setBusy(true);
    try {
      const user = await register(form, admin ? 'admin' : 'user');
      toast.success(`Welcome to iMovies, ${user.username}!`);
      navigate(user.role === 'admin' ? '/admin' : '/', { replace: true });
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
        <h1>{admin ? 'Register as Admin' : 'Register'}</h1>
        <label>Username<input placeholder="Enter Username" value={form.username} onChange={set('username')} required autoComplete="username" /></label>
        <label>Email<input type="email" placeholder="Enter your email" value={form.email} onChange={set('email')} required autoComplete="email" /></label>
        <label>Password<input type={show ? 'text' : 'password'} placeholder="Enter your password" minLength={6} value={form.password} onChange={set('password')} required autoComplete="new-password" /></label>
        <label>Confirm Password<input type={show ? 'text' : 'password'} placeholder="Confirm your password" value={form.confirmPassword} onChange={set('confirmPassword')} required autoComplete="new-password" /></label>
        {admin && <label>Admin access code<input type="password" placeholder="Ask the site owner for this code" value={form.accessCode} onChange={set('accessCode')} required /></label>}
        <label className="check"><input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} /> Show Password</label>
        <button className="btn" disabled={busy}>{busy ? 'Creating account…' : 'Submit'}</button>
        <p className="alt">Already have an account? <Link to="/login">Login</Link></p>
        <p className="alt">{admin ? 'Register as a customer' : 'Register as an'} <button type="button" className="link" onClick={() => setAdmin(!admin)}>{admin ? 'instead' : 'Admin'}</button></p>
      </form>
    </div>
  );
}
