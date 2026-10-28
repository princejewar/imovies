import dayjs from 'dayjs';

export const fmtDate = (d) => dayjs(d).format('MMM D, YYYY');
export const fmtDateTime = (d) => dayjs(d).format('ddd, D MMM · h:mm A');
export const fmtTime = (hhmm) => dayjs(`2000-01-01 ${hhmm}`).format('h:mm A');
export const rupees = (n) => `₹${n}`;
export const cap = (s = '') => s.charAt(0).toUpperCase() + s.slice(1);

// [{ number, tier }] -> [["Balcony", [12, 13]], ["Middle", [201]]]
export function groupSeats(seats = []) {
  const groups = {};
  seats.forEach((s) => (groups[s.tier] ||= []).push(s.number));
  return Object.entries(groups).map(([tier, nums]) => [cap(tier), nums.sort((a, b) => a - b)]);
}
