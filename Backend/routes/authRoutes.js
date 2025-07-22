const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);

router.post('/login', authController.login); //authController functions that or POSTed or GET, being redirected to /register calls authController.register

router.get('/logout', authController.logout);

module.exports = router;
