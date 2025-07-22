require('dotenv').config();

const config = {
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 5432,       
  dialect: 'postgres',                      
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,            
    },
  },
};

module.exports = config;