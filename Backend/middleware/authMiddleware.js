const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).render('pages/Error', { error: 'Unauthorized: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); //This file just checks if the user has the correct token, small form of security
    req.userId = decoded.id;
    next();
  } catch (err) {
    console.error('JWT verification failed:', err);
    return res.status(401).render('pages/Error', { error: 'Unauthorized: Invalid token' });
  }
};

