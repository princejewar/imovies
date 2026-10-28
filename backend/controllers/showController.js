import dayjs from 'dayjs';
import Show from '../models/showModel.js';
import Movie from '../models/movieModel.js';
import Theatre from '../models/theatreModel.js';
import { layoutOf, totalSeats } from '../utils/seatLayout.js';

// Upcoming shows of a movie, with how many seats are still free.
export const showsForMovie = async (req, res) => {
  try {
    const shows = await Show.find({ movie: req.params.movieId, startsAt: { $gt: new Date() } }).sort({ startsAt: 1 }).populate('theatre', 'name location tiers');
    res.json(shows.map((s) => ({
      _id: s._id, theatre: { _id: s.theatre._id, name: s.theatre.name, location: s.theatre.location },
      showDate: s.showDate, showTime: s.showTime, startsAt: s.startsAt,
      total: totalSeats(s.theatre), available: totalSeats(s.theatre) - s.bookedSeats.length,
    })));
  } catch {
    res.status(404).json({ message: 'Movie not found.' });
  }
};

export const getShow = async (req, res) => {
  try {
    const show = await Show.findById(req.params.id).populate('theatre').populate('movie', 'title poster hue certification runtime');
    if (!show) return res.status(404).json({ message: 'Show not found.' });
    res.json({ ...show.toObject(), layout: layoutOf(show.theatre), totalSeats: totalSeats(show.theatre) });
  } catch {
    res.status(404).json({ message: 'Show not found.' });
  }
};

export const listShows = async (_req, res) => {
  const shows = await Show.find().sort({ startsAt: -1 }).limit(200).populate('movie', 'title').populate('theatre', 'name tiers');
  res.json(shows.map((s) => ({ ...s.toObject(), total: totalSeats(s.theatre), booked: s.bookedSeats.length })));
};

export const createShow = async (req, res) => {
  try {
    const { theatreId, movieId, showDate, showTime } = req.body;
    const [theatre, movie] = await Promise.all([Theatre.findById(theatreId), Movie.findById(movieId)]);
    if (!theatre || !movie || !showDate || !showTime) return res.status(400).json({ message: 'Choose a theatre, a movie, a show date and a showtime.' });
    const startsAt = dayjs(`${showDate} ${showTime}`).toDate();
    if (isNaN(startsAt) || startsAt <= new Date()) return res.status(400).json({ message: 'Pick a date and time in the future.' });
    if (startsAt < movie.releaseDate && dayjs(startsAt).format('YYYY-MM-DD') < dayjs(movie.releaseDate).format('YYYY-MM-DD'))
      return res.status(400).json({ message: 'A show can\'t be scheduled before the movie\'s release date.' });
    res.status(201).json(await Show.create({ theatre: theatre._id, movie: movie._id, showDate, showTime, startsAt }));
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ message: 'This theatre already has a show at that time.' });
    res.status(500).json({ message: e.message });
  }
};

export const deleteShow = async (req, res) => {
  const show = await Show.findById(req.params.id);
  if (show?.bookedSeats.length) return res.status(400).json({ message: 'This show has bookings and can\'t be deleted.' });
  await Show.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
};
