const tinycolor = require('tinycolor2');


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