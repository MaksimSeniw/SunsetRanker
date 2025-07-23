const db = require('../models');

const Photo = db.Photo;
const User = db.User;
const Rating = db.Rating;

const { fn, col, literal } = require('sequelize');

const getColors = require('get-image-colors');
const BeerColorMatcher = require('./beerColorMatcher');

const axios = require('axios');
const tmp = require('tmp');
const fs = require('fs');
const { promisify } = require('util');

const tmpFile = promisify(tmp.file);
const writeFile = promisify(fs.writeFile);

exports.uploadPhoto = async (req, res) => {
  try {
    const gcsUrl = req.file.gcsUrl;
    const response = await axios.get(gcsUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');

    const tmpFilePath = await tmpFile();
    await writeFile(tmpFilePath, buffer);

    const mimeType = req.file.mimetype || 'image/png';
    const colors = await getColors(tmpFilePath, { type: mimeType });

    const topColors = colors.slice(0, 3);
    const averageHsl = averageHSL(topColors.map(c => c.hex()));

    console.log(`Avg HSL: h=${averageHsl.h.toFixed(1)}, s=${averageHsl.s.toFixed(2)}, l=${averageHsl.l.toFixed(2)}`);

    const beerMatcher = new BeerColorMatcher(true); 
    const matchedBeer = beerMatcher.matchHSL(averageHsl); 

    const photo = await Photo.create({
      filePath: gcsUrl,
      userId: req.userId,
      title: req.body.title,
      location: req.body.location,
      matchedBeer,
    });

    return res.redirect(
      `/new?message=A+good+beer+for+your+sunset+is+${encodeURIComponent(photo.matchedBeer)}+!`
    );
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).render('pages/Upload', {
      error: 'Upload failed',
      details: err.message,
    });
  }
};

exports.getTopPhotos = async (req, res) => {
  try {
    const photos = await Photo.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'username']
        }
      ],
      attributes: {
        include: [
          [
            literal(`(
              SELECT AVG(score)
              FROM "Ratings"
              WHERE "Ratings"."photoId" = "Photo"."id"
            )`),
            'averageRating'
          ],
          [
            literal(`(
              SELECT COUNT(*)
              FROM "Ratings"
              WHERE "Ratings"."photoId" = "Photo"."id"
            )`),
            'ratingCount'
          ]
        ]
      },
      where: literal(`(
        SELECT COUNT(*)
        FROM "Ratings"
        WHERE "Ratings"."photoId" = "Photo"."id"
      ) >= 1`),
      order: [
        [literal(`(
          SELECT AVG(score)
          FROM "Ratings"
          WHERE "Ratings"."photoId" = "Photo"."id"
        )`), 'DESC']
      ],
      limit: 5
    });

    res.render('pages/Home', {
      user: req.session.user || null,
      photos
    });
  } catch (err) {
    console.error('Failed to fetch top rated photos:', err);
    res.status(500).render('pages/Home', {
      error: 'Failed to get top rated photos',
      user: req.session.user || null,
      photos: []
    });
  }
};

exports.getNewPhotos = async (req, res) => {
  try {
    const photos = await Photo.findAll({
      include: [
        User,
        {
          model: Rating,
          attributes: ['score']  
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    const photosWithRatings = photos.map(photo => { //Getting avg rating
      const ratings = photo.Ratings || [];
      const averageRating = ratings.length
        ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
        : 0;

      return {
        ...photo.toJSON(),
        averageRating
      };
    });

    const message = req.query.message || null;
    res.render('pages/New', { photos: photosWithRatings, message });
  } catch (err) {
    console.error(err);
    res.status(500).render('pages/New', { error: 'Failed to get new photos' });
  }
};


function averageHSL(hexColors) {
  const hslValues = hexColors.map(hex => tinycolor(hex).toHsl());
  const total = hslValues.reduce(
    (acc, hsl) => {
      acc.h += hsl.h;
      acc.s += hsl.s;
      acc.l += hsl.l;
      return acc;
    },
    { h: 0, s: 0, l: 0 }
  );
  const len = hslValues.length;
  return {
    h: total.h / len,
    s: total.s / len,
    l: total.l / len
  };
}