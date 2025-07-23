const { Storage } = require('@google-cloud/storage');

const serviceAccount = JSON.parse(process.env.GCS_KEY_JSON);

const storage = new Storage({
  credentials: serviceAccount,
  projectId: 'sunsetranker'
});

const bucket = storage.bucket('sunset-photo-uploads');

module.exports = bucket;