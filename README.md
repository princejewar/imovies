# iMovies — Movie ticket booking made simple

A MERN stack (MongoDB, Express, React, Node.js) movie ticket booking platform with **real-time seat availability** (Socket.IO), JWT authentication, e-tickets with QR codes, promo codes, reviews, favorites, notifications and a full admin dashboard. The look follows the project guide: dark navy surfaces, crimson accents, Poppins font and a light/dark theme switch.

## Quick start
Requirements: Node.js 16+ and MongoDB Community running locally.

```bash
cp backend/.env.example backend/.env     # Windows: copy backend\.env.example backend\.env
npm run install:all                      # installs backend and frontend packages
npm run seed                             # sample movies, theatres, shows, promo codes, demo accounts
npm run dev                              # API on :5000 and React on :5173
```
Open http://localhost:5173

| Account | Email | Password |
|---|---|---|
| Admin | admin@imovies.com | admin123 |
| Customer | user@imovies.com | user123 |

Promo codes to try at checkout: `WELCOME10` (10% off, min ₹200) and `CINEMA50` (₹50 off, min ₹300).
To register a new admin, use **Register as an Admin** and enter the `ADMIN_ACCESS_CODE` from `backend/.env`.

## See the real-time seats working
Log in as the customer in two browser windows (one private). Open the same show. Click a seat in one window: it turns grey and pulses in the other. Book it: it becomes "booked" in both. A selected seat is held for 5 minutes and then released automatically.

## Features (mapped to the guide)
**Customers**
- Register / login / logout with JWT (stored in a cookie), password hashing with bcrypt
- Browse movies, search, filter by genre, language and rating, movie details popup, trailer link
- Select theatre, date and showtime, then pick seats from a three-tier layout (balcony / middle / lower) with per-tier prices and wheelchair-accessible seats
- Live seat availability, 5-minute seat holds, atomic booking so a seat can never be sold twice
- Review booking, promo code validation, payment (UPI / card / net banking / wallet), payment-failure retry
- E-ticket with QR code, downloadable as PDF; booking history; cancel (up to 2 hours before the show, full refund); reschedule to another show of the same movie (pays or gets back the difference)
- Favorites, reviews and star ratings, alerts (confirmation, receipt, cancellation, reschedule, show reminders, new and upcoming movies); optional email through SMTP
- Light / dark theme

**Admin**
- Add movie (with poster upload), add theatre (tier prices and seat counts), schedule shows, delete movies / shows / theatres
- All shows with seats booked, all bookings, payments, customers, reviews moderation
- Reports: revenue, tickets, revenue by movie and by day (Chart.js)
- Promo code management

**Platform:** MVC structure, input validation, NoSQL-injection sanitising, rate limiting, Helmet security headers, background reminder job (node-cron).

## Project structure
```
backend/
  config/db.js              MongoDB connection with auto-reconnect
  middlewares/fetchUser.js  JWT check, admin / customer guards
  models/                   user, admin, movie, theatre, show, booking, payment,
                            favorite, review, promo, notification
  controllers/              business logic for each resource
  routes/                   REST endpoints
  utils/                    seat layout, realtime sockets, payment, promo, tickets (PDF + QR),
                            notifications, reminder scheduler
  server.js  seed.js
frontend/src/
  components/  context/  hooks/  pages/ (+ pages/admin)  providers/  styles/  utils/
  App.jsx  main.jsx  host.js
```

## Notes
- **Payments are simulated.** The gateway always approves (set `PAYMENT_FAIL_RATE=0.3` in `backend/.env` to see the failure and retry screen). To go live, replace the body of `backend/utils/payment.js` with a Stripe or Razorpay call.
- **Email** is sent only if `SMTP_*` values are set; otherwise alerts are shown in the app. SMS is not included.
- **Posters** are uploaded by the admin. Movies without a poster get a generated one.
- Seat numbers run continuously: balcony first, then middle, then lower.

## API overview
`POST /api/auth/register|login`, `POST /api/auth/admin/register|login` · `GET /api/movies` (`?q=&genre=&language=&rating=`) · `GET /api/shows/movie/:id`, `GET /api/shows/:id` · `POST /api/bookings`, `GET /api/bookings/mine`, `GET /api/bookings/:id/ticket`, `POST /api/bookings/:id/reschedule`, `DELETE /api/bookings/:id` · `/api/favorites`, `/api/reviews`, `/api/notifications` · admin: `/api/movies`, `/api/theatres`, `/api/shows`, `/api/admin/*`.
Socket events: `join-show`, `hold-seat`, `release-seat` → `holds`, `seats-updated`, `hold-expired`.

## Deploying
Build the frontend (`npm run build`) and start the backend (`npm start --prefix backend`): the API then also serves the React app from one URL. Or host them separately and set `VITE_API_URL` / `VITE_SOCKET_URL` for the frontend and `CLIENT_URL` for the backend.
