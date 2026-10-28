import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <section className="landing">
      <h1>Welcome to <span>iMovies</span></h1>
      <p>Your ultimate destination for the latest blockbusters and timeless classics</p>
      <div className="landing-actions">
        <Link to="/login" className="btn btn-pill glow">Sign In</Link>
        <Link to="/register" className="btn btn-pill btn-outline">Sign Up</Link>
      </div>
    </section>
  );
}
