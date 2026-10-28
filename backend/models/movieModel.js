import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    genres: [String],
    language: { type: String, trim: true },
    cast: [String],
    releaseDate: { type: Date, required: true },
    runtime: { type: Number, default: 120 }, // minutes
    certification: { type: String, trim: true }, // U, UA, A ...
    trailerUrl: { type: String, trim: true },
    poster: { type: String }, // image URL or data URL; a generated poster is shown when empty
    hue: { type: Number, default: 0 },
    rating: { type: Number, default: 0 }, // average of reviews (1-5)
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Movie', movieSchema);
