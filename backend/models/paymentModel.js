import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ['upi', 'card', 'netbanking', 'wallet'], required: true },
    status: { type: String, enum: ['success', 'refunded', 'transferred'], default: 'success' },
    refundedAmount: { type: Number, default: 0 },
    transactionId: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Payment', paymentSchema);
