import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import dayjs from 'dayjs';
import User from './models/userModel.js';
import Admin from './models/adminModel.js';
import Movie from './models/movieModel.js';
import Theatre from './models/theatreModel.js';
import Show from './models/showModel.js';
import Booking from './models/bookingModel.js';
import Payment from './models/paymentModel.js';
import Review from './models/reviewModel.js';
import Favorite from './models/favoriteModel.js';
import Promo from './models/promoModel.js';
import Notification from './models/notificationModel.js';

const day = (n) => dayjs().add(n, 'day').startOf('day').toDate();

const movies = [
  { title: 'Midnight Monsoon', genres: ['Drama', 'Romance'], language: 'Hindi', runtime: 138, certification: 'UA', releaseDate: day(-20), cast: ['Aarav Mehta', 'Naina Kapoor', 'Rohan Bhatt'], hue: 345, description: 'Two strangers share a stalled train during the first night of the monsoon and slowly untangle the lives they left behind.' },
  { title: 'Orbit Seven', genres: ['Sci-Fi', 'Thriller'], language: 'English', runtime: 124, certification: 'UA', releaseDate: day(-12), cast: ['Maya Lin', 'Daniel Okafor', 'Sven Larsen'], hue: 210, description: 'A salvage crew finds a station that has been broadcasting their own voices for thirty years.' },
  { title: 'The Last Chai Stall', genres: ['Comedy'], language: 'Hindi', runtime: 112, certification: 'U', releaseDate: day(-30), cast: ['Vikram Rao', 'Sheela Joshi', 'Tinku Verma'], hue: 38, description: 'When a highway bypass threatens a roadside chai stall, the regulars stage the town\'s funniest protest.' },
  { title: 'Iron Kabaddi', genres: ['Action', 'Sport'], language: 'Hindi', runtime: 146, certification: 'UA', releaseDate: day(-5), cast: ['Karan Dhillon', 'Pooja Sethi', 'Bhim Singh'], hue: 12, description: 'A disgraced raider rebuilds a village kabaddi team for one final league season.' },
  { title: 'Paper Lanterns', genres: ['Animation', 'Family'], language: 'English', runtime: 98, certification: 'U', releaseDate: day(-8), cast: ['Lia Park', 'Omar Haddad'], hue: 160, description: 'A girl follows a trail of floating lanterns into a city built from folded paper.' },
  { title: 'Hollow Hill', genres: ['Horror', 'Mystery'], language: 'English', runtime: 107, certification: 'A', releaseDate: day(-40), cast: ['Elena Ruiz', 'Tom Hale'], hue: 280, description: 'A family moves into a hill station home where the echo answers a beat too late.' },
  { title: 'Saffron Skies', genres: ['Adventure'], language: 'Hindi', runtime: 131, certification: 'U', releaseDate: day(14), cast: ['Ishaan Roy', 'Tara Menon'], hue: 25, description: 'Three friends cross the Thar by hot-air balloon to deliver a wedding invitation on time.' },
  { title: 'Static', genres: ['Thriller'], language: 'English', runtime: 115, certification: 'UA', releaseDate: day(28), cast: ['Nora Quinn', 'Idris Cole'], hue: 190, description: 'A late-night radio host starts receiving calls from tomorrow.' },
  { title: 'Crimson Alley', genres: ['Crime'], language: 'Hindi', runtime: 128, certification: 'A', releaseDate: day(-10), cast: ['Rajveer Malik', 'Anjali Desai', 'Farhan Qureshi'], hue: 355, description: 'A tired inspector has one night to find who is burning down the old bazaar before the whole lane is gone.' },
  { title: 'The Banyan Fort', genres: ['Historical'], language: 'Hindi', runtime: 152, certification: 'UA', releaseDate: day(-18), cast: ['Devraj Chauhan', 'Meera Solanki'], hue: 30, description: 'In 1707 a young commander must hold a hill fort with three hundred soldiers against an army ten times larger.' },
  { title: 'Raag Rangeela', genres: ['Musical'], language: 'Hindi', runtime: 140, certification: 'U', releaseDate: day(-6), cast: ['Sanjana Iyer', 'Kabir Nair', 'Usha Pandey'], hue: 320, description: 'A street singer and a classical vocalist form an unlikely duo for a national music contest.' },
  { title: 'Border of Ashes', genres: ['War'], language: 'Hindi', runtime: 158, certification: 'UA', releaseDate: day(-25), cast: ['Vikrant Sood', 'Harleen Gill', 'Mohan Thapa'], hue: 100, description: 'A small border post holds its ground through one long winter night as help struggles through the mountain snow.' },
  { title: 'The Quiet Chef', genres: ['Biography'], language: 'English', runtime: 118, certification: 'U', releaseDate: day(-15), cast: ['Marco Bellini', 'Priya Nandakumar'], hue: 48, description: 'The true story of a street-food cook who built a restaurant from a single cart and never raised his voice.' },
  { title: 'Wild Frontiers', genres: ['Documentary'], language: 'English', runtime: 95, certification: 'U', releaseDate: day(-35), cast: ['Narrated by Helen Ward'], hue: 140, description: 'A year with the rangers who protect the last wild tiger corridors of central India.' },
  { title: 'Operation Nightingale', genres: ['Spy'], language: 'English', runtime: 122, certification: 'UA', releaseDate: day(-3), cast: ['Leo Brandt', 'Zara Malhotra', 'Viktor Hale'], hue: 230, description: 'A retired translator is pulled back in when a message only she can decode turns up in a children\'s radio show.' },
  { title: 'Dust & Thunder', genres: ['Western'], language: 'English', runtime: 126, certification: 'UA', releaseDate: day(-22), cast: ['Jack Merrow', 'Rosa Delgado'], hue: 22, description: 'A drifter guards a dying desert town from a land baron who owns the only well.' },
  { title: 'Tidal Line', genres: ['Disaster'], language: 'English', runtime: 119, certification: 'UA', releaseDate: day(-9), cast: ['Ana Ferreira', 'Kenji Mori', 'Chloe Barnes'], hue: 195, description: 'Marine engineers have forty minutes to evacuate a coastal city after the sea suddenly pulls back.' },
  { title: 'Saga of Surya', genres: ['Mythology'], language: 'Hindi', runtime: 144, certification: 'U', releaseDate: day(-14), cast: ['Arjun Rathore', 'Kavya Menon', 'Sudhir Kale'], hue: 42, description: 'The legend of the sun warrior retold on a grand scale, from his hidden birth to the final duel.' },
  { title: 'Dragon of Dunmere', genres: ['Fantasy'], language: 'English', runtime: 135, certification: 'UA', releaseDate: day(7), cast: ['Isla Brennan', 'Tomas Reyes', 'Wren Alder'], hue: 125, description: 'A shepherd girl discovers that the dragon her village fears is the last guardian of its valley.' },
  { title: 'Captain Vayu', genres: ['Superhero'], language: 'Hindi', runtime: 137, certification: 'UA', releaseDate: day(21), cast: ['Rudra Khanna', 'Tanvi Bose', 'Imran Sheikh'], hue: 205, description: 'An air-force pilot gains the power to ride the wind, then learns the city\'s smog was never an accident.' },
  // ---- Famous classics (descriptions are original one-liners) ----
  { title: 'The Shawshank Redemption', genres: ['Drama'], language: 'English', runtime: 142, certification: 'A', releaseDate: new Date('1994-09-23'), cast: ['Tim Robbins', 'Morgan Freeman', 'Bob Gunton'], hue: 215, description: 'A banker jailed for a crime he says he did not commit finds hope, and an unlikely friend, behind prison walls.' },
  { title: 'The Dark Knight', genres: ['Action'], language: 'English', runtime: 152, certification: 'UA', releaseDate: new Date('2008-07-18'), cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart'], hue: 235, description: 'Gotham\'s masked protector faces a chaos-loving criminal who wants to prove that anyone can be pushed to the edge.' },
  { title: 'Inception', genres: ['Sci-Fi'], language: 'English', runtime: 148, certification: 'UA', releaseDate: new Date('2010-07-16'), cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page'], hue: 200, description: 'A thief who steals secrets from dreams is offered one last job: planting an idea instead of taking one.' },
  { title: 'The Godfather', genres: ['Crime'], language: 'English', runtime: 175, certification: 'A', releaseDate: new Date('1972-03-24'), cast: ['Marlon Brando', 'Al Pacino', 'James Caan'], hue: 15, description: 'The reluctant youngest son of a powerful crime family is drawn into the business his father built.' },
  { title: 'Dilwale Dulhania Le Jayenge', genres: ['Romance'], language: 'Hindi', runtime: 189, certification: 'U', releaseDate: new Date('1995-10-20'), cast: ['Shah Rukh Khan', 'Kajol', 'Amrish Puri'], hue: 340, description: 'Two young travellers fall in love on a European trip, then must win over a strict father back home.' },
  { title: 'Jurassic Park', genres: ['Adventure'], language: 'English', runtime: 127, certification: 'UA', releaseDate: new Date('1993-06-11'), cast: ['Sam Neill', 'Laura Dern', 'Jeff Goldblum'], hue: 95, description: 'Visitors to an island theme park of living dinosaurs find out what happens when the safety systems fail.' },
  { title: 'The Lion King', genres: ['Animation'], language: 'English', runtime: 88, certification: 'U', releaseDate: new Date('1994-06-24'), cast: ['Matthew Broderick', 'Jeremy Irons', 'James Earl Jones'], hue: 32, description: 'A young lion prince runs from his past and must decide whether to return and claim his place.' },
  { title: 'The Shining', genres: ['Horror'], language: 'English', runtime: 146, certification: 'A', releaseDate: new Date('1980-05-23'), cast: ['Jack Nicholson', 'Shelley Duvall', 'Danny Lloyd'], hue: 5, description: 'A writer takes a winter caretaker job at an empty mountain hotel, and the isolation slowly takes hold of him.' },
  { title: '3 Idiots', genres: ['Comedy'], language: 'Hindi', runtime: 170, certification: 'UA', releaseDate: new Date('2009-12-25'), cast: ['Aamir Khan', 'R. Madhavan', 'Sharman Joshi'], hue: 50, description: 'Two friends search for their old engineering-college buddy, remembering how he taught them to follow their passion.' },
  { title: 'The Lord of the Rings: The Fellowship of the Ring', genres: ['Fantasy'], language: 'English', runtime: 178, certification: 'UA', releaseDate: new Date('2001-12-19'), cast: ['Elijah Wood', 'Ian McKellen', 'Viggo Mortensen'], hue: 120, description: 'A young hobbit and eight companions set out to destroy a ring that could bring a dark lord back to power.' },
];

const theatres = [
  { name: 'Galaxy Cinemas', location: 'Indore', tiers: { balcony: { price: 280, count: 30 }, middle: { price: 220, count: 50 }, lower: { price: 160, count: 60 } } },
  { name: 'Royal Multiplex', location: 'Bhopal', tiers: { balcony: { price: 300, count: 20 }, middle: { price: 240, count: 40 }, lower: { price: 170, count: 50 } } },
  { name: 'Srinivasa Talkies', location: 'Ujjain', tiers: { balcony: { price: 150, count: 20 }, middle: { price: 120, count: 40 }, lower: { price: 90, count: 40 } } },
];
const times = ['10:30', '13:45', '17:15', '20:45'];

await mongoose.connect(process.env.MONGODB_CONNECTION_LINK);
await Promise.all([User, Admin, Movie, Theatre, Show, Booking, Payment, Review, Favorite, Promo, Notification].map((M) => M.deleteMany()));

await Admin.create({ username: 'Admin', email: 'admin@imovies.com', password: await bcrypt.hash('admin123', 10) });
const demo = await User.create({ username: 'Demo User', email: 'user@imovies.com', password: await bcrypt.hash('user123', 10) });

const createdMovies = await Movie.insertMany(movies);
const createdTheatres = await Theatre.insertMany(theatres);

const released = createdMovies.filter((m) => m.releaseDate <= new Date());
const unique = [];
for (let d = 0; d < 10; d++) {
  createdTheatres.forEach((theatre, ti) => {
    times.forEach((time, i) => {
      const showDate = dayjs().add(d, 'day').format('YYYY-MM-DD');
      const startsAt = dayjs(`${showDate} ${time}`).toDate();
      if (startsAt <= new Date()) return;
      const movie = released[(d + ti * 2 + i) % released.length]; // one movie per theatre slot
      unique.push({ theatre: theatre._id, movie: movie._id, showDate, showTime: time, startsAt });
    });
  });
}
await Show.insertMany(unique);

await Promo.insertMany([
  { code: 'WELCOME10', type: 'percent', value: 10, maxDiscount: 100, minAmount: 200 },
  { code: 'CINEMA50', type: 'flat', value: 50, minAmount: 300 },
]);

await Review.insertMany([
  { user: demo._id, movie: createdMovies[0]._id, rating: 5, comment: 'Beautifully shot, the train scenes stayed with me.' },
  { user: demo._id, movie: createdMovies[2]._id, rating: 4, comment: 'Genuinely funny and warm.' },
]);
await Movie.findByIdAndUpdate(createdMovies[0]._id, { rating: 5, ratingCount: 1 });
await Movie.findByIdAndUpdate(createdMovies[2]._id, { rating: 4, ratingCount: 1 });

console.log(`Seeded ${createdMovies.length} movies, ${createdTheatres.length} theatres, ${unique.length} shows, 2 promo codes.`);
console.log('Admin: admin@imovies.com / admin123   |   User: user@imovies.com / user123   |   Promo codes: WELCOME10, CINEMA50');
await mongoose.disconnect();
