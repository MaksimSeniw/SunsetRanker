const { User, Photo } = require('../models');
const bcrypt = require('bcrypt');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(404).render('pages/Error', { error: 'User not found' }); //Checking if the user exists
    }

    res.render('pages/Profile', { //Creating the page
      username: user.username,
      favoriteBeer: user.favoriteBeer,
      createdAt: user.createdAt,
      firstName: user.firstName,
      lastName: user.lastName
    });

  } catch (err) {
    console.error(err);
    res.status(500).render('pages/Error', { error: 'Could not fetch user profile' });
  }
};



exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { username, favoriteBeer, oldPassword, newPassword } = req.body; //Any item that was put into form will update the corresponding attribute

    if (username) user.username = username;

    if (favoriteBeer) user.favoriteBeer = favoriteBeer;

    if (oldPassword && newPassword) {
      const match = await bcrypt.compare(oldPassword, user.password);
      if (!match) return res.status(401).json({ error: 'Incorrect current password' });

      const hashed = await bcrypt.hash(newPassword, 10);
      user.password = hashed;
    }

    await user.save();
    res.redirect('/profile');

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Profile update failed' });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: missing user ID' });
    }


  const photos = await Photo.findAll({ where: { UserId: userId } });

    await Photo.destroy({ where: { UserId: userId } });

    res.clearCookie('token', { //Deleting token
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict'
    });

    
    await User.destroy({ where: { id: userId } }); //Removing the user from the db
    req.session?.destroy(() => { //Resetting session 
      res.redirect('/login'); 
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account', details: error.message });
  }
};