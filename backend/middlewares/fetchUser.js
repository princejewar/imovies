import jwt from 'jsonwebtoken';

// Reads the JWT from the Authorization header and attaches { id, role } to req.user.
export const fetchUser = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Please log in to continue.' });
  try {
    const { id, role } = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id, role };
    next();
  } catch {
    res.status(401).json({ message: 'Your session has expired. Please log in again.' });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admins only.' });
  next();
};

export const userOnly = (req, res, next) => {
  if (req.user?.role !== 'user') return res.status(403).json({ message: 'Log in with a customer account to do this.' });
  next();
};
