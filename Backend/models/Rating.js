// models/Rating.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Rating extends Model {
    static associate(models) {
      Rating.belongsTo(models.User, { foreignKey: 'userId' });
      Rating.belongsTo(models.Photo, { foreignKey: 'photoId' });
    }
  }
  Rating.init({ //Rating's db with corresponding attributes and their needed values
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    photoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Photos',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Rating',
  });
  return Rating;
};