import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import Admin from '../models/adminModel.js';

const sign = (doc, role) => jwt.sign({ id: doc._id, role, name: doc.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
const out = (doc, role) => ({ token: sign(doc, role), user: { id: doc._id, username: doc.username, email: doc.email, role } });

const register = (Model, role) => async (req, res) => {
  try {
    const { username, email, password, confirmPassword, accessCode, phone } = req.body;
    if (typeof email !== 'string' || typeof password !== 'string' || !username?.trim())
      return res.status(400).json({ message: 'Enter a username, a valid email and a password.' });
    if (password.length < 6) return res.status(400).json({ message: 'Your password needs at least 6 characters.' });
    if (confirmPassword !== undefined && confirmPassword !== password) return res.status(400).json({ message: 'Passwords do not match.' });
    if (role === 'admin' && (!process.env.ADMIN_ACCESS_CODE || accessCode !== process.env.ADMIN_ACCESS_CODE))
      return res.status(403).json({ message: 'That admin access code is not correct.' });
    if (await Model.findOne({ email: email.toLowerCase() })) return res.status(409).json({ message: 'An account with this email already exists.' });
    const doc = await Model.create({ username: username.trim(), email, phone, password: await bcrypt.hash(password, 10) });
    res.status(201).json(out(doc, role));
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const login = (Model, role) => async (req, res) => {
  try {
    const { email, password } = req.body;
    if (typeof email !== 'string' || typeof password !== 'string') return res.status(400).json({ message: 'Enter your email and password.' });
    const doc = await Model.findOne({ email: email.toLowerCase() });
    if (!doc || !(await bcrypt.compare(password, doc.password))) return res.status(401).json({ message: 'Email or password is incorrect.' });
    res.json(out(doc, role));
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const registerUser = register(User, 'user');
export const registerAdmin = register(Admin, 'admin');
export const loginUser = login(User, 'user');
export const loginAdmin = login(Admin, 'admin');
