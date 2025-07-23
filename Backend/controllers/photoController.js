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

//Strategy method

class MatchingStrategy {
  getName() {
    throw new Error("Method 'getName()' must be implemented.");
  }

  matches(hslColor) {
    throw new Error("Method 'matches()' must be implemented.");
  }
}

const between = (value, min, max, inclusive = true) =>
  inclusive ? value >= min && value <= max : value > min && value < max;


class AcePerryRoseCiderStrategy extends MatchingStrategy {
  getName() { return 'Ace Perry Rosé Cider'; }
  matches({ h, s, l }) {
    return (h >= 330 || h <= 30) && s >= 0.15 && l >= 0.55;
  }
}

class GuinnessStrategy extends MatchingStrategy {
  getName() { return 'Guinness'; }
  matches({ l }) {
    return l <= 0.17;
  }
}

class DeschutesPorterStrategy extends MatchingStrategy {
  getName() { return 'Deschutes Black Butte Porter'; }
  matches({ l }) {
    return between(l, 0.15, 0.27);
  }
}

class NegraModeloStrategy extends MatchingStrategy {
  getName() { return 'Negra Modelo'; }
  matches({ h, l }) {
    return between(l, 0.23, 0.42) && between(h, 5, 55);
  }
}

class NewcastleStrategy extends MatchingStrategy {
  getName() { return 'Newcastle Brown Ale'; }
  matches({ h, l }) {
    return between(l, 0.33, 0.52) && between(h, 10, 55);
  }
}

class ShinerBockStrategy extends MatchingStrategy {
  getName() { return 'Shiner Bock'; }
  matches({ h, l }) {
    return between(l, 0.38, 0.68) && between(h, 5, 45);
  }
}

class FatTireStrategy extends MatchingStrategy {
  getName() { return 'Fat Tire Amber Ale'; }
  matches({ h, l }) {
    return between(l, 0.43, 0.68) && between(h, 25, 55);
  }
}

class SmithwicksStrategy extends MatchingStrategy {
  getName() { return "Smithwick's Red Ale"; }
  matches({ h, l }) {
    return between(l, 0.43, 0.73) && between(h, 0, 30);
  }
}

class SierraNevadaStrategy extends MatchingStrategy {
  getName() { return 'Sierra Nevada Pale Ale'; }
  matches({ h, s, l }) {
    return between(l, 0.53, 0.82) && s >= 0.35 && between(h, 25, 60);
  }
}

class VoodooRangerStrategy extends MatchingStrategy {
  getName() { return 'Voodoo Ranger IPA'; }
  matches({ h, s, l }) {
    return between(l, 0.63, 0.88) && s >= 0.45 && between(h, 30, 65);
  }
}

class BlueMoonStrategy extends MatchingStrategy {
  getName() { return 'Blue Moon'; }
  matches({ h, s, l }) {
    return between(l, 0.68, 0.92) && s >= 0.45 && between(h, 30, 65);
  }
}

class HoegaardenStrategy extends MatchingStrategy {
  getName() { return 'Hoegaarden'; }
  matches({ h, s, l }) {
    return between(l, 0.82, 0.97) && s <= 0.65 && between(h, 35, 70);
  }
}

class PilsnerUrquellStrategy extends MatchingStrategy {
  getName() { return 'Pilsner Urquell'; }
  matches({ h, s, l }) {
    return between(l, 0.78, 0.97) && s >= 0.60 && between(h, 35, 70);
  }
}

class StandardCiderStrategy extends MatchingStrategy {
  getName() { return 'Angry Orchard / Strongbow Cider'; }
  matches({ h, s, l }) {
    return between(l, 0.78, 0.97) && s >= 0.50 && between(h, 35, 70);
  }
}

class CoronaStrategy extends MatchingStrategy {
  getName() { return 'Corona Extra'; }
  matches({ h, s, l }) {
    return l >= 0.88 && s >= 0.55 && between(h, 35, 70);
  }
}

class CoorsMillerStrategy extends MatchingStrategy {
  getName() { return 'Coors Light / Miller Lite'; }
  matches({ h, s, l }) {
    return l >= 0.91 && s <= 0.75 && between(h, 40, 75);
  }
}


class BeerColorMatcher {
  constructor(debug = false) {
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
    this.debug = debug;
  }

  match(hex) {
    const hslColor = tinycolor(hex).toHsl();
    return this.matchHSL(hslColor);
  }


  matchHSL(hslColor) {
    if (this.debug) {
      console.log(`Matching HSL: h=${hslColor.h.toFixed(1)}, s=${hslColor.s.toFixed(2)}, l=${hslColor.l.toFixed(2)}`);
    }

    for (const strategy of this.strategies) {
      if (strategy.matches(hslColor)) {
        if (this.debug) console.log(`Matched: ${strategy.getName()}`);
        return strategy.getName();
      }
    }

    if (this.debug) console.log('No match. Returning default.');
    return this.defaultBeverage;
  }
}

module.exports = BeerColorMatcher;