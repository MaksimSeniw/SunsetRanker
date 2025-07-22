const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'superSecretKey';

const register = async (req, res) => {
  try {
    const { username, password, favoriteBeer, firstName, lastName } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      password: hashedPassword, //Updating db with corresponding user and attributes
      favoriteBeer,
      firstName,
      lastName
    });

    return res.redirect('/login');

  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).render('pages/Register', { error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).render('pages/Login', { error: 'Invalid username or password' }); //Checks
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).render('pages/Login', { error: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    req.session.user = { id: user.id, username: user.username };

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', //Creating a user token that lasts for one day
      sameSite: 'Strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.redirect('/profile');
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).render('pages/Login', { error: 'An internal server error occurred' });
  }
};

const logout = async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', //Clearing the token
    sameSite: 'Strict'
  });

  req.session?.destroy(() => { //Resetting the session so the navbar updates
    res.redirect('/login'); 
  });
};

module.exports = { //Exporting these fncs
  register,
  login,
  logout,
};
