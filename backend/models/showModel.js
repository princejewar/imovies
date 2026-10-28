import mongoose from 'mongoose';

const showSchema = new mongoose.Schema(
  {
    theatre: { type: mongoose.Schema.Types.ObjectId, ref: 'Theatre', required: true },
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    showDate: { type: String, required: true }, // YYYY-MM-DD
    showTime: { type: String, required: true }, // HH:mm (24h)
    startsAt: { type: Date, required: true },
    bookedSeats: { type: [Number], default: [] },
  },
  { timestamps: true }
);
showSchema.index({ theatre: 1, startsAt: 1 }, { unique: true }); // one show per theatre per time
showSchema.index({ movie: 1, startsAt: 1 });

export default mongoose.model('Show', showSchema);
