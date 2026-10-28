import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FiBarChart2, FiBell, FiClock, FiFilm, FiHeart, FiHome, FiLogOut, FiMoon, FiPlusCircle, FiSun, FiTag, FiUser } from 'react-icons/fi';
import { FaTheaterMasks } from 'react-icons/fa';
import useAuth from '../hooks/useAuth.js';
import useTheme from '../hooks/useTheme.js';

const Icon = ({ to, label, children, end }) => (
  <NavLink to={to} end={end} className="nav-icon" title={label} aria-label={label}>{children}</NavLink>
);

export default function Navbar() {
  const { user, logout, unread } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  const search = (e) => { e.preventDefault(); navigate(`/?q=${encodeURIComponent(q.trim())}`); };
  const leave = () => { logout(); navigate('/'); };
  const isAdmin = user?.role === 'admin';

  return (
    <header className="navbar">
      <Link to="/" className="logo" aria-label="iMovies home"><i>i</i>Movies</Link>

      {!isAdmin && (
        <form className="nav-search" onSubmit={search} role="search">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search movies" aria-label="Search movies" />
          <button type="submit" aria-label="Search">i</button>
        </form>
      )}

      <nav className="nav-icons">
        <button className="nav-icon" onClick={toggleTheme} title="Switch theme" aria-label="Switch between light and dark theme">
          {theme === 'dark' ? <FiSun /> : <FiMoon />}
        </button>
        {isAdmin ? (
          <>
            <Icon to="/admin" label="Movies" end><FiHome /></Icon>
            <Icon to="/admin/movies/add" label="Add movie"><FiFilm /></Icon>
            <Icon to="/admin/shows/add" label="Add show"><FiPlusCircle /></Icon>
            <Icon to="/admin/theatres/add" label="Add theatre"><FaTheaterMasks /></Icon>
            <Icon to="/admin/activity" label="Shows and bookings"><FiClock /></Icon>
            <Icon to="/admin/reports" label="Reports"><FiBarChart2 /></Icon>
            <Icon to="/admin/promos" label="Promo codes"><FiTag /></Icon>
            <button className="nav-icon" onClick={leave} title="Log out" aria-label="Log out"><FiLogOut /></button>
          </>
        ) : user ? (
          <>
            <Icon to="/" label="Home" end><FiHome /></Icon>
            <Icon to="/favorites" label="Favorites"><FiHeart /></Icon>
            <Icon to="/bookings" label="My bookings"><FiClock /></Icon>
            <NavLink to="/alerts" className="nav-icon" title="Alerts" aria-label={`Alerts${unread ? `, ${unread} unread` : ''}`}>
              <FiBell />{unread > 0 && <span className="count">{unread}</span>}
            </NavLink>
            <Icon to="/profile" label="Profile"><FiUser /></Icon>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-sm">Sign in</Link>
            <Link to="/register" className="btn btn-sm btn-ghost">Sign up</Link>
          </>
        )}
      </nav>
    </header>
  );
}
