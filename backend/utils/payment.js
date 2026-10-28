import { randomInt } from 'crypto';

// Simulated payment gateway. To go live, replace the body with a Stripe / Razorpay
// call: create the charge, then return { ok: true, transactionId: <gateway id> }.
export async function processPayment({ amount, method }) {
  await new Promise((resolve) => setTimeout(resolve, 600));
  if (amount > 0 && Math.random() < Number(process.env.PAYMENT_FAIL_RATE || 0))
    return { ok: false, message: 'Your bank declined the payment. Please try again or use another payment method.' };
  return { ok: true, transactionId: `TXN${Date.now()}${randomInt(100, 999)}`, method };
}
