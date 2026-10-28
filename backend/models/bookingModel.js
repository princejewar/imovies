import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    show: { type: mongoose.Schema.Types.ObjectId, ref: 'Show', required: true },
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    theatre: { type: mongoose.Schema.Types.ObjectId, ref: 'Theatre', required: true },
    seats: [{ _id: false, number: Number, tier: String, price: Number }],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    promoCode: String,
    total: { type: Number, required: true },
    status: { type: String, enum: ['confirmed', 'cancelled', 'rescheduled'], default: 'confirmed' },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    ticketCode: { type: String, required: true, unique: true },
    reminded: { type: Boolean, default: false },
    rescheduledFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  },
  { timestamps: true }
);

export default mongoose.model('Booking', bookingSchema);
