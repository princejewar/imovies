import Promo from '../models/promoModel.js';

// Validates a promo code against an order amount. Returns { promo, discount } or { error }.
export async function applyPromo(code, amount) {
  const promo = await Promo.findOne({ code: String(code || '').trim().toUpperCase(), active: true });
  if (!promo) return { error: 'This promo code is not valid.' };
  if (promo.expiresAt && promo.expiresAt < new Date()) return { error: 'This promo code has expired.' };
  if (amount < promo.minAmount) return { error: `Add ₹${promo.minAmount - amount} more to use this code (minimum ₹${promo.minAmount}).` };
  let discount = promo.type === 'percent' ? Math.floor((amount * promo.value) / 100) : promo.value;
  if (promo.type === 'percent' && promo.maxDiscount) discount = Math.min(discount, promo.maxDiscount);
  return { promo, discount: Math.min(discount, amount) };
}
