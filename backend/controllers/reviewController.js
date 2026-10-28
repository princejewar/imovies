import mongoose from 'mongoose';
import Review from '../models/reviewModel.js';
import Movie from '../models/movieModel.js';

async function recalc(movieId) {
  const [agg] = await Review.aggregate([
    { $match: { movie: new mongoose.Types.ObjectId(movieId) } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  await Movie.findByIdAndUpdate(movieId, { rating: agg ? Math.round(agg.avg * 10) / 10 : 0, ratingCount: agg?.count || 0 });
}

export const listReviews = async (req, res) => {
  res.json(await Review.find({ movie: req.params.movieId }).sort({ createdAt: -1 }).populate('user', 'username'));
};

export const saveReview = async (req, res) => {
  try {
    const rating = Number(req.body.rating);
    if (!(rating >= 1 && rating <= 5)) return res.status(400).json({ message: 'Choose a rating from 1 to 5 stars.' });
    const review = await Review.findOneAndUpdate(
      { user: req.user.id, movie: req.params.movieId },
      { rating, comment: req.body.comment || '' },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    await recalc(req.params.movieId);
    res.status(201).json(review);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Customers can delete their own review; admins can delete any review (moderation).
export const deleteReview = async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ message: 'Review not found.' });
  if (req.user.role !== 'admin' && String(review.user) !== req.user.id) return res.status(403).json({ message: 'You can only delete your own review.' });
  await review.deleteOne();
  await recalc(review.movie);
  res.json({ ok: true });
};
