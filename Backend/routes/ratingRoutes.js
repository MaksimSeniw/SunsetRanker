const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const auth = require('../middleware/authMiddleware');

router.post('/:photoId', auth, ratingController.submitRating); //rating function that it called whenver a user clicks a rating on new/home

module.exports = router;
