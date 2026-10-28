// Shows the uploaded poster, or a generated one so the app never looks empty.
export default function Poster({ movie, className = '' }) {
  if (movie.poster) return <img className={`poster ${className}`} src={movie.poster} alt={`${movie.title} poster`} loading="lazy" />;
  const h = movie.hue ?? 0;
  return (
    <div className={`poster poster-gen ${className}`} style={{ background: `linear-gradient(160deg, hsl(${h} 55% 38%), hsl(${(h + 35) % 360} 60% 12%))` }}>
      <span>{movie.title}</span>
    </div>
  );
}
