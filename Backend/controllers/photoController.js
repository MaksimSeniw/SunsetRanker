const db = require('../models');

const Photo = db.Photo;
const User = db.User;
const Rating = db.Rating;

const { fn, col, literal } = require('sequelize');

const getColors = require('get-image-colors');
const tinycolor = require('tinycolor2');


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
    const dominantColor = colors[0].hex();

    const beerMatcher = new BeerColorMatcher();
    const matchedBeer = beerMatcher.match(dominantColor);

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

    res.render('pages/Home', { photos });
  } catch (err) {
    console.error('Failed to fetch top rated photos:', err);
    res.status(500).render('pages/Home', { error: 'Failed to get top rated photos', photos: [] });
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

//Strategy method

class MatchingStrategy {
  getName() {
    throw new Error("Method 'getName()' must be implemented.");
  }

  matches(hslColor) {
    throw new Error("Method 'matches()' must be implemented.");
  }
}

class AcePerryRoseCiderStrategy extends MatchingStrategy {
  getName() { return 'Ace Perry Rosé Cider'; }
  matches({ h, s, l }) { return (h >= 340 || h < 15) && s > 0.25 && l > 0.6; }
}

class GuinnessStrategy extends MatchingStrategy {
  getName() { return 'Guinness'; }
  matches({ l }) { return l < 0.12; }
}

class DeschutesPorterStrategy extends MatchingStrategy {
  getName() { return 'Deschutes Black Butte Porter'; }
  matches({ l }) { return l >= 0.12 && l < 0.20; }
}

class NegraModeloStrategy extends MatchingStrategy {
  getName() { return 'Negra Modelo'; }
  matches({ h, l }) { return l >= 0.20 && l < 0.35 && h > 15 && h < 40; }
}

class NewcastleStrategy extends MatchingStrategy {
  getName() { return 'Newcastle Brown Ale'; }
  matches({ h, l }) { return l >= 0.35 && l < 0.45 && h > 20 && h < 40; }
}

class ShinerBockStrategy extends MatchingStrategy {
  getName() { return 'Shiner Bock'; }
  matches({ h, l }) { return l >= 0.45 && l < 0.60 && h > 15 && h < 30; }
}

class FatTireStrategy extends MatchingStrategy {
  getName() { return 'Fat Tire Amber Ale'; }
  matches({ h, l }) { return l >= 0.45 && l < 0.60 && h >= 30 && h < 45; }
}

class SmithwicksStrategy extends MatchingStrategy {
  getName() { return "Smithwick's Red Ale"; }
  matches({ h, l }) { return l >= 0.50 && l < 0.65 && h >= 5 && h < 20; }
}

class SierraNevadaStrategy extends MatchingStrategy {
  getName() { return 'Sierra Nevada Pale Ale'; }
  matches({ h, s, l }) { return l >= 0.60 && l < 0.75 && s > 0.5 && h > 35 && h < 50; }
}

class VoodooRangerStrategy extends MatchingStrategy {
  getName() { return 'Voodoo Ranger IPA'; }
  matches({ h, s, l }) { return l >= 0.70 && l < 0.85 && s > 0.6 && h > 40 && h < 55; }
}

class BlueMoonStrategy extends MatchingStrategy {
  getName() { return 'Blue Moon'; }
  matches({ h, s, l }) { return l >= 0.80 && l < 0.90 && s > 0.6 && h > 40 && h < 55; }
}

class HoegaardenStrategy extends MatchingStrategy {
  getName() { return 'Hoegaarden'; }
  matches({ h, s, l }) { return l >= 0.88 && l < 0.95 && s < 0.6 && h > 45 && h < 60; }
}

class PilsnerUrquellStrategy extends MatchingStrategy {
  getName() { return 'Pilsner Urquell'; }
  matches({ h, s, l }) { return l >= 0.85 && l < 0.92 && s > 0.7 && h > 45 && h < 60; }
}

class StandardCiderStrategy extends MatchingStrategy {
  getName() { return 'Angry Orchard / Strongbow Cider'; }
  matches({ h, s, l }) { return l >= 0.85 && l < 0.94 && s > 0.6 && h > 45 && h < 60; }
}

class CoronaStrategy extends MatchingStrategy {
  getName() { return 'Corona Extra'; }
  matches({ h, s, l }) { return l >= 0.92 && s > 0.8 && h > 48 && h < 60; }
}

class CoorsMillerStrategy extends MatchingStrategy {
  getName() { return 'Coors Light / Miller Lite'; }
  matches({ h, s, l }) { return l >= 0.94 && s < 0.8 && h > 50 && h < 65; }
}
class BeerColorMatcher {
  constructor() {
    this.strategies = [
      new AcePerryRoseCiderStrategy(),
      new GuinnessStrategy(),
      new DeschutesPorterStrategy(),
      new NegraModeloStrategy(),
      new NewcastleStrategy(),
      new ShinerBockStrategy(),
      new FatTireStrategy(),
      new SmithwicksStrategy(),
      new SierraNevadaStrategy(),
      new VoodooRangerStrategy(),
      new BlueMoonStrategy(),
      new HoegaardenStrategy(),
      new PilsnerUrquellStrategy(),
      new StandardCiderStrategy(),
      new CoronaStrategy(),
      new CoorsMillerStrategy(),
    ];
    this.defaultBeverage = 'Bud Light';
  }

  match(hex) {
    const hslColor = tinycolor(hex).toHsl();

    for (const strategy of this.strategies) {
      if (strategy.matches(hslColor)) {
        return strategy.getName();
      }
    }
    return this.defaultBeverage;
  }
}
