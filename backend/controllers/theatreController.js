import Theatre from '../models/theatreModel.js';
import Show from '../models/showModel.js';
import { totalSeats } from '../utils/seatLayout.js';

export const listTheatres = async (_req, res) => {
  const theatres = await Theatre.find().sort({ name: 1 });
  res.json(theatres.map((t) => ({ ...t.toObject(), totalSeats: totalSeats(t) })));
};

export const createTheatre = async (req, res) => {
  try {
    const { name, location, tiers = {} } = req.body;
    if (!name?.trim() || !location?.trim()) return res.status(400).json({ message: 'Theatre name and location are required.' });
    const clean = {};
    for (const t of ['balcony', 'middle', 'lower']) {
      clean[t] = { price: Math.max(+tiers[t]?.price || 0, 0), count: Math.min(Math.max(Math.floor(+tiers[t]?.count) || 0, 0), 300) };
    }
    if (!Object.values(clean).some((t) => t.count > 0 && t.price > 0))
      return res.status(400).json({ message: 'Add at least one seat tier with a price and a seat count.' });
    res.status(201).json(await Theatre.create({ name, location, tiers: clean }));
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const deleteTheatre = async (req, res) => {
  if (await Show.exists({ theatre: req.params.id, startsAt: { $gt: new Date() } }))
    return res.status(400).json({ message: 'This theatre still has upcoming shows. Delete those first.' });
  await Theatre.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
};
