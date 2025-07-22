'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Photo extends Model {
    static associate(models) {
      Photo.belongsTo(models.User, { foreignKey: 'userId' });
      Photo.hasMany(models.Rating, { foreignKey: 'photoId' });
    }
  }
  Photo.init({ //Photo's db with corresponding attributes and their needed values
  filePath: {
    type: DataTypes.STRING,
    allowNull: false
  },
  matchedBeer: DataTypes.STRING,
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Untitled'
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Untitled'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
     field: 'UserId',
    references: {
      model: 'Users',
      key: 'id'
    }
  }
  }, {
    sequelize,
    modelName: 'Photo',
  });
  return Photo;
};