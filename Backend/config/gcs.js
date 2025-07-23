const { Storage } = require('@google-cloud/storage');
const path = require('path');

const storage = new Storage({
  keyFilename: path.join(__dirname, '../sunsetranker-2b395cbaddb4.json'),
  projectId: 'sunsetranker'
});

const bucket = storage.bucket('sunset-photo-uploads');

module.exports = bucket;
