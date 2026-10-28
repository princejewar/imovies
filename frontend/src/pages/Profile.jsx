import { Link, useNavigate } from 'react-router-dom';
import { FiClock, FiHeart, FiLogOut, FiMoon, FiSun } from 'react-icons/fi';
import useAuth from '../hooks/useAuth.js';
import useTheme from '../hooks/useTheme.js';
import Heading from '../components/Heading.jsx';

export default function Profile() {
  const { user, logout, favorites } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <>
      <Heading>Your Profile</Heading>
      <div className="card profile">
        <div className="avatar" aria-hidden="true">{user.username?.[0]?.toUpperCase()}</div>
        <h2>{user.username}</h2>
        <p className="muted">{favorites.length} favorite {favorites.length === 1 ? 'movie' : 'movies'}</p>
        <div className="profile-actions">
          <Link to="/bookings" className="btn btn-ghost"><FiClock /> My bookings</Link>
          <Link to="/favorites" className="btn btn-ghost"><FiHeart /> Favorites</Link>
          <button className="btn btn-ghost" onClick={toggleTheme}>{theme === 'dark' ? <FiSun /> : <FiMoon />} {theme === 'dark' ? 'Light' : 'Dark'} theme</button>
          <button className="btn" onClick={() => { logout(); navigate('/'); }}><FiLogOut /> Log out</button>
        </div>
      </div>
    </>
  );
}
