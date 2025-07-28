require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Sequelize } = require('sequelize'); //Getting the libraries I will use
const db = require('./models/index');
const session = require('express-session');
const methodOverride = require('method-override');
const photoController = require('./controllers/photoController');

const app = express();

app.set('trust proxy', true);

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://storage.googleapis.com", "https://*.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      scriptSrcAttr: ["'unsafe-inline'"],  
    },
  })
);

app.use(cors({
    origin: process.env.CORS_ORIGIN || '*'
}));

const limiter = rateLimit({ //Maximum requests someone can do in 15 min(10000)
    windowMs: 15 * 60 * 1000,
    max: 10000
});
app.use(limiter);
app.use(morgan('dev'));

app.use(express.static(path.join(__dirname, '../Frontend')));//css

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use(session({ //Token 
  secret: '12345',
  resave: false,
  saveUninitialized: true,
}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use((req, res, next) => { //Checking if the user is logged in 
  res.locals.user = req.session.user || null;
  next();
});

app.set('view engine', 'ejs'); //Using ejs

const viewsPath = path.join(__dirname, '../Frontend/views');//Setting the path
console.log('EJS views directory set to:', viewsPath); 
app.set('views', viewsPath);

app.get('/', photoController.getTopPhotos);

app.get('/home', photoController.getTopPhotos);

app.get('/login', (req, res) => {
    res.render('pages/Login');
});

app.get('/register', (req, res) => {
    res.render('pages/Register');
});

app.get('/upload', (req, res) => {
    res.render('pages/Upload', { user: req.session.user });
});

const userController = require('./controllers/userController');
const auth = require('./middleware/authMiddleware');

app.get('/profile', auth, userController.getProfile);


app.get('/editprofile', (req, res) => {
    res.render('pages/UpdateProfile', { user: req.session.user });
});

app.get('/new', photoController.getNewPhotos, (req, res) => {
  const message = req.query.message;  
  res.render('newPageTemplate', { photos: res.locals.photos, message, user:req.session.user });
});

const authRoutes = require('./routes/authRoutes');
const photoRoutes = require('./routes/photoRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/users', userRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
});

app.use((req, res, next) => {
    console.log(`404 Not Found for URL: ${req.originalUrl}`);
    res.status(404).json({ message: 'Not Found' });
});

app.use((err, req, res, next) => {
    console.error('Global Error Handler:', err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

const PORT = process.env.PORT || 3000; //localhost port

async function testDatabaseConnection() { //Testing 
    try {
        await db.sequelize.authenticate();
        console.log('Database connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
}

async function startServer() { //Starting 
    await testDatabaseConnection();
    await db.sequelize.sync({
        force: process.env.NODE_ENV === 'test',
        alter: process.env.NODE_ENV === 'development'
    });

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
}

startServer().catch(err => {
    console.error('Server startup failed:', err);
    process.exit(1);
});

module.exports = app;
