const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const controller = require('../controllers/photoController');

router.post('/upload', auth, upload.single('image'), controller.uploadPhoto);

router.get('/top', controller.getTopPhotos);//photoController functions that or POSTed or GET, being redirected to /upload calls photoController.uploadPhoto with an image

router.get('/new', controller.getNewPhotos);

module.exports = router;