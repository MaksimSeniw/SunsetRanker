const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { upload, uploadToGCS } = require('../middleware/upload');
const controller = require('../controllers/photoController');

router.post(
  '/upload',
  auth,
  upload.single('image'),
  uploadToGCS,
  controller.uploadPhoto
);

router.get('/top', controller.getTopPhotos);
router.get('/new', controller.getNewPhotos);

module.exports = router;
