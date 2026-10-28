import mongoose from 'mongoose';

const promoSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ['percent', 'flat'], required: true },
    value: { type: Number, required: true, min: 1 },
    minAmount: { type: Number, default: 0 },
    maxDiscount: { type: Number }, // cap for percent codes
    expiresAt: Date,
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Promo', promoSchema);
