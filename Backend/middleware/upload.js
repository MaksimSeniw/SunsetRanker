const multer = require('multer');
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (_, file, cb) => cb(null, Date.now() + '-' + file.originalname), //Putting the uploads into my uploads folder
});
module.exports = multer({ storage });