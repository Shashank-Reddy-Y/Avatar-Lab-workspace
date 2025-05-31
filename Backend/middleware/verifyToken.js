
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const verifyToken = (req, res, next) => {
  const authHeader = req.header('Authorization');

if (!authHeader || !authHeader.startsWith('Bearer ')) {
  return res.status(401).json({ message: 'Access denied. Token missing or malformed.' });
}

const token = authHeader.split(' ')[1];


  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // You can access user data from token with req.user
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

module.exports = verifyToken;
