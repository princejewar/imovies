import Favorite from '../models/favoriteModel.js';

export const listFavorites = async (req, res) => {
  const favs = await Favorite.find({ user: req.user.id }).sort({ createdAt: -1 }).populate('movie');
  res.json(favs.map((f) => f.movie).filter(Boolean));
};

export const addFavorite = async (req, res) => {
  try {
    await Favorite.updateOne({ user: req.user.id, movie: req.params.movieId }, {}, { upsert: true });
    res.status(201).json({ ok: true });
  } catch (e) {
    res.status(400).json({ message: 'Could not save this movie.' });
  }
};

export const removeFavorite = async (req, res) => {
  await Favorite.deleteOne({ user: req.user.id, movie: req.params.movieId });
  res.json({ ok: true });
};
