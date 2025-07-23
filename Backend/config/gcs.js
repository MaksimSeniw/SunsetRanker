const { Storage } = require('@google-cloud/storage');

const serviceAccount = JSON.parse(process.env.GCS_KEY_JSON);

const rawKey = JSON.parse(process.env.GCS_KEY_JSON);

rawKey.private_key = rawKey.private_key.replace(/\\n/g, '\n');

const storage = new Storage({
  projectId: rawKey.project_id,
  credentials: rawKey,
});

const bucket = storage.bucket('sunset-photo-uploads');

module.exports = bucket;