// Seat numbers run continuously: balcony first, then middle, then lower.
export const TIERS = ['balcony', 'middle', 'lower'];

export function layoutOf(theatre) {
  let next = 1;
  return TIERS.map((tier) => {
    const { price = 0, count = 0 } = theatre.tiers?.[tier] || {};
    const start = next;
    next += count;
    return { tier, price, count, start, end: next - 1 };
  }).filter((t) => t.count > 0);
}

export const totalSeats = (theatre) => layoutOf(theatre).reduce((sum, t) => sum + t.count, 0);

export function seatInfo(theatre, number) {
  const t = layoutOf(theatre).find((x) => number >= x.start && number <= x.end);
  return t ? { number, tier: t.tier, price: t.price } : null;
}
