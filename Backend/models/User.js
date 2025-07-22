'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Photo, { foreignKey: 'userId' });
      User.hasMany(models.Rating, { foreignKey: 'userId' });
    }
  }
  User.init({//Users' db with corresponding attributes and their needed values
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    favoriteBeer: DataTypes.STRING,
    firstName:{
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName:{
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};