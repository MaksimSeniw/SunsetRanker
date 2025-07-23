const { Storage } = require('@google-cloud/storage');

const serviceAccount = JSON.parse(process.env.GCS_KEY_JSON);

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: JSON.parse(process.env.GCS_KEY_JSON),
});

const bucket = storage.bucket('sunset-photo-uploads');

module.exports = bucket;