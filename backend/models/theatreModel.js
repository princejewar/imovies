import mongoose from 'mongoose';

const tier = { price: { type: Number, default: 0, min: 0 }, count: { type: Number, default: 0, min: 0, max: 300 } };

// Seats are numbered continuously: balcony first, then middle, then lower.
const theatreSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    tiers: { balcony: tier, middle: tier, lower: tier },
  },
  { timestamps: true }
);

export default mongoose.model('Theatre', theatreSchema);
