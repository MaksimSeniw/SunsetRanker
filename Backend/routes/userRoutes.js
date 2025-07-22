const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');

router.get('/profile', auth, userController.getProfile);

router.post('/editprofile', auth, userController.updateProfile); //userController functions that or POSTed or GET, being redirected to /profile calls userController.getProfile

router.post('/delete', auth, userController.deleteAccount);

module.exports = router;
