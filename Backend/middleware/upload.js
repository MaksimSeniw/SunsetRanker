// middleware/upload.js
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const path = require('path');

const storage = new Storage({
  keyFilename: path.join(__dirname, '../gcs-key.json'), // your downloaded JSON
  projectId: 'your-project-id',
});

const bucket = storage.bucket('your-bucket-name'); // GCS bucket name

const multerStorage = multer.memoryStorage(); // Upload to memory first

const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

const uploadToGCS = async (req, res, next) => {
  if (!req.file) return next();

  const blob = bucket.file(Date.now() + '-' + req.file.originalname);
  const blobStream = blob.createWriteStream({
    resumable: false,
    contentType: req.file.mimetype,
    public: true,
  });

  blobStream.on('error', (err) => next(err));

  blobStream.on('finish', () => {
    req.file.gcsUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
    next();
  });

  blobStream.end(req.file.buffer);
};

module.exports = {
  upload,
  uploadToGCS,
};
