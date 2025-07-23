const { Storage } = require('@google-cloud/storage');

const raw = Buffer.from(process.env.GCS_KEY_JSON, 'base64').toString('utf-8');
const credentials = JSON.parse(raw);

credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');

const storage = new Storage({
  projectId: credentials.project_id,
  credentials,
});

const bucket = storage.bucket('sunset-photo-uploads');

module.exports = bucket;