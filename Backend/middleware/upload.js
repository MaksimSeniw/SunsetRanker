const multer = require('multer');
const { Storage } = require('@google-cloud/storage');

// ✅ Decode base64 service account key
const raw = Buffer.from(process.env.GCS_KEY_JSON, 'base64').toString('utf-8');
const credentials = JSON.parse(raw);
credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');

const storage = new Storage({
  projectId: credentials.project_id,
  credentials,
});

const bucket = storage.bucket(process.env.GCS_BUCKET_NAME); // e.g. 'sunset-photo-uploads'

const multerStorage = multer.memoryStorage();

const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const uploadToGCS = async (req, res, next) => {
  if (!req.file) return next();

  const gcsFileName = `${Date.now()}-${req.file.originalname}`;
  const blob = bucket.file(gcsFileName);

  const blobStream = blob.createWriteStream({
    resumable: false,
    contentType: req.file.mimetype,
  });

  blobStream.on('error', (err) => {
    console.error('Error uploading to GCS:', err);
    next(err);
  });

  blobStream.on('finish', async () => {
    try {
      await blob.makePublic(); // make the file publicly readable
      req.file.gcsUrl = `https://storage.googleapis.com/${bucket.name}/${gcsFileName}`;
      next();
    } catch (err) {
      console.error('Error making file public:', err);
      next(err);
    }
  });

  blobStream.end(req.file.buffer);
};

module.exports = {
  upload,
  uploadToGCS,
};
