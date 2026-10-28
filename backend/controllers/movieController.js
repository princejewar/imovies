import Movie from '../models/movieModel.js';
import Show from '../models/showModel.js';
import Review from '../models/reviewModel.js';
import Favorite from '../models/favoriteModel.js';
import { escapeRegex } from '../utils/escape.js';
import { notifyAll } from '../utils/notify.js';

const list = (v) => (Array.isArray(v) ? v : String(v || '').split(',')).map((x) => x.trim()).filter(Boolean);
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export const listMovies = async (req, res) => {
  const { q, genre, language, rating } = req.query;
  const filter = {};
  if (q) filter.title = new RegExp(escapeRegex(q), 'i');
  if (genre) filter.genres = new RegExp(`^${escapeRegex(genre)}$`, 'i');
  if (language) filter.language = new RegExp(`^${escapeRegex(language)}$`, 'i');
  if (rating) filter.rating = { $gte: Number(rating) };
  res.json(await Movie.find(filter).sort({ releaseDate: -1 }));
};

export const filterOptions = async (_req, res) => {
  const [genres, languages] = await Promise.all([Movie.distinct('genres'), Movie.distinct('language')]);
  res.json({ genres: genres.sort(), languages: languages.filter(Boolean).sort() });
};

export const getMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Movie not found.' });
    res.json(movie);
  } catch {
    res.status(404).json({ message: 'Movie not found.' });
  }
};

export const createMovie = async (req, res) => {
  try {
    const b = req.body;
    if (!b.title?.trim() || !b.releaseDate) return res.status(400).json({ message: 'Movie name and release date are required.' });
    const movie = await Movie.create({
      title: b.title, description: b.description, genres: list(b.genres).map(cap), language: b.language,
      cast: list(b.cast), releaseDate: new Date(b.releaseDate), runtime: +b.runtime || 120,
      certification: b.certification, trailerUrl: b.trailerUrl, poster: b.poster,
      hue: Math.floor(Math.random() * 360),
    });
    const upcoming = movie.releaseDate > new Date();
    await notifyAll(upcoming ? 'Coming soon' : 'Now showing', upcoming
      ? `${movie.title} releases on ${movie.releaseDate.toDateString()}. Add it to your favorites!`
      : `${movie.title} is now showing. Book your seats!`);
    res.status(201).json(movie);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const updateMovie = async (req, res) => {
  const b = { ...req.body };
  if (b.genres !== undefined) b.genres = list(b.genres).map(cap);
  if (b.cast !== undefined) b.cast = list(b.cast);
  delete b.rating; delete b.ratingCount;
  res.json(await Movie.findByIdAndUpdate(req.params.id, b, { new: true }));
};

export const deleteMovie = async (req, res) => {
  const shows = await Show.find({ movie: req.params.id });
  if (shows.some((s) => s.bookedSeats.length))
    return res.status(400).json({ message: 'This movie has booked shows. Cancel those bookings first.' });
  await Promise.all([
    Show.deleteMany({ movie: req.params.id }), Review.deleteMany({ movie: req.params.id }),
    Favorite.deleteMany({ movie: req.params.id }), Movie.findByIdAndDelete(req.params.id),
  ]);
  res.json({ ok: true });
};
