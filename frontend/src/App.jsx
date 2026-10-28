import { Navigate, Route, Routes } from 'react-router-dom';
import useAuth from './hooks/useAuth.js';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Home from './pages/Home.jsx';
import Shows from './pages/Shows.jsx';
import SeatSelection from './pages/SeatSelection.jsx';
import BookingConfirmation from './pages/BookingConfirmation.jsx';
import Bookings from './pages/Bookings.jsx';
import Favorites from './pages/Favorites.jsx';
import Alerts from './pages/Alerts.jsx';
import Profile from './pages/Profile.jsx';
import AdminMovies from './pages/admin/AdminMovies.jsx';
import AddMovie from './pages/admin/AddMovie.jsx';
import AddTheatre from './pages/admin/AddTheatre.jsx';
import AddShow from './pages/admin/AddShow.jsx';
import AdminActivity from './pages/admin/AdminActivity.jsx';
import AdminReports from './pages/admin/AdminReports.jsx';
import AdminPromos from './pages/admin/AdminPromos.jsx';

function Root() {
  const { user } = useAuth();
  if (!user) return <Landing />;
  return user.role === 'admin' ? <Navigate to="/admin" replace /> : <Layout />;
}

const customer = (el) => <ProtectedRoute role="user">{el}</ProtectedRoute>;
const admin = (el) => <ProtectedRoute role="admin">{el}</ProtectedRoute>;

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Home: landing page for visitors, movie list for customers */}
      <Route path="/" element={<Root />}>
        <Route index element={<Home />} />
      </Route>

      <Route element={<Layout />}>
        <Route path="/movie/:id/shows" element={customer(<Shows />)} />
        <Route path="/shows/:id/seats" element={customer(<SeatSelection />)} />
        <Route path="/booking/:id" element={customer(<BookingConfirmation />)} />
        <Route path="/bookings" element={customer(<Bookings />)} />
        <Route path="/favorites" element={customer(<Favorites />)} />
        <Route path="/alerts" element={customer(<Alerts />)} />
        <Route path="/profile" element={customer(<Profile />)} />

        <Route path="/admin" element={admin(<AdminMovies />)} />
        <Route path="/admin/movies/add" element={admin(<AddMovie />)} />
        <Route path="/admin/theatres/add" element={admin(<AddTheatre />)} />
        <Route path="/admin/shows/add" element={admin(<AddShow />)} />
        <Route path="/admin/activity" element={admin(<AdminActivity />)} />
        <Route path="/admin/reports" element={admin(<AdminReports />)} />
        <Route path="/admin/promos" element={admin(<AdminPromos />)} />
        <Route path="*" element={<p className="muted center">That page doesn't exist.</p>} />
      </Route>
    </Routes>
  );
}
