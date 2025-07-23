const { Storage } = require('@google-cloud/storage');

const decodedKey = Buffer.from(process.env.GCS_KEY_B64, 'base64').toString('utf-8');
const credentials = JSON.parse(decodedKey);

const storage = new Storage({
  projectId: credentials.project_id,
  credentials,
});

const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);

module.exports = bucket;