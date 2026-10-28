// Live seat availability over Socket.IO.
// - Booked seats come from MongoDB and are broadcast after every booking or cancellation.
// - Held seats are temporary locks: when someone selects a seat everyone else watching the
//   same show sees it greyed out. A hold expires after HOLD_MS, on release, or on disconnect.

const HOLD_MS = 5 * 60 * 1000;
const holds = new Map(); // showId -> Map(seat -> { socketId, expiresAt, timer })

const view = (showId) =>
  Object.fromEntries([...(holds.get(showId) || [])].map(([seat, h]) => [seat, { by: h.socketId, expiresAt: h.expiresAt }]));

function release(io, showId, seat) {
  const hold = holds.get(showId)?.get(seat);
  if (!hold) return null;
  clearTimeout(hold.timer);
  holds.get(showId).delete(seat);
  return hold;
}

export function initRealtime(io) {
  io.on('connection', (socket) => {
    const joined = new Set();

    socket.on('join-show', (showId) => {
      socket.join(showId);
      joined.add(showId);
      socket.emit('holds', view(showId));
    });

    socket.on('hold-seat', ({ showId, seat }, ack) => {
      if (!holds.has(showId)) holds.set(showId, new Map());
      const map = holds.get(showId);
      const current = map.get(seat);
      if (current && current.socketId !== socket.id) return ack?.(false);
      if (current) clearTimeout(current.timer);
      const timer = setTimeout(() => {
        release(io, showId, seat);
        io.to(socket.id).emit('hold-expired', { seat });
        io.to(showId).emit('holds', view(showId));
      }, HOLD_MS);
      map.set(seat, { socketId: socket.id, expiresAt: Date.now() + HOLD_MS, timer });
      io.to(showId).emit('holds', view(showId));
      ack?.(true);
    });

    socket.on('release-seat', ({ showId, seat }) => {
      const hold = holds.get(showId)?.get(seat);
      if (hold?.socketId === socket.id) {
        release(io, showId, seat);
        io.to(showId).emit('holds', view(showId));
      }
    });

    socket.on('disconnect', () => {
      for (const showId of joined) {
        for (const [seat, h] of holds.get(showId) || []) if (h.socketId === socket.id) release(io, showId, seat);
        io.to(showId).emit('holds', view(showId));
      }
    });
  });
}

// Called after seats are confirmed or freed in the database.
export function broadcastSeats(io, show, confirmedSeats = []) {
  const id = String(show._id);
  confirmedSeats.forEach((s) => release(io, id, s));
  io.to(id).emit('seats-updated', show.bookedSeats);
  io.to(id).emit('holds', view(id));
}
