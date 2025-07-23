const tinycolor = require('tinycolor2');


function hslDistance(c1, c2, weights = { h: 1, s: 1, l: 1 }) {
  let dh = Math.min(Math.abs(c1.h - c2.h), 360 - Math.abs(c1.h - c2.h)) / 180; 
  let ds = c1.s - c2.s;
  let dl = c1.l - c2.l;
  return Math.sqrt(
    weights.h * dh * dh +
    weights.s * ds * ds +
    weights.l * dl * dl
  );
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
  distance(hsl) {
    const center = { h: 0, s: 0.3, l: 0.7 };
    return hslDistance(hsl, center, { h: 1, s: 2, l: 2 });
  }
}

class GuinnessStrategy extends MatchingStrategy {
  getName() { return 'Guinness'; }
  matches({ l }) {
    return l <= 0.17;
  }
  distance(hsl) {
    const center = { h: 0, s: 0, l: 0.1 };
    return hslDistance(hsl, center, { h: 0.5, s: 0.5, l: 2 });
  }
}

class DeschutesPorterStrategy extends MatchingStrategy {
  getName() { return 'Deschutes Black Butte Porter'; }
  matches({ l }) {
    return between(l, 0.15, 0.27);
  }
  distance(hsl) {
    const center = { h: 20, s: 0.4, l: 0.21 };
    return hslDistance(hsl, center, { h: 1, s: 1, l: 2 });
  }
}

class NegraModeloStrategy extends MatchingStrategy {
  getName() { return 'Negra Modelo'; }
  matches({ h, l }) {
    return between(l, 0.23, 0.42) && between(h, 5, 55);
  }
  distance(hsl) {
    const center = { h: 30, s: 0.5, l: 0.33 };
    return hslDistance(hsl, center, { h: 1, s: 1, l: 1.5 });
  }
}

class NewcastleStrategy extends MatchingStrategy {
  getName() { return 'Newcastle Brown Ale'; }
  matches({ h, l }) {
    return between(l, 0.33, 0.52) && between(h, 10, 55);
  }
  distance(hsl) {
    const center = { h: 30, s: 0.5, l: 0.42 };
    return hslDistance(hsl, center, { h: 1, s: 1, l: 1.5 });
  }
}

class ShinerBockStrategy extends MatchingStrategy {
  getName() { return 'Shiner Bock'; }
  matches({ h, l }) {
    return between(l, 0.38, 0.68) && between(h, 5, 45);
  }
  distance(hsl) {
    const center = { h: 25, s: 0.55, l: 0.53 };
    return hslDistance(hsl, center, { h: 1, s: 1, l: 1.5 });
  }
}

class FatTireStrategy extends MatchingStrategy {
  getName() { return 'Fat Tire Amber Ale'; }
  matches({ h, l }) {
    return between(l, 0.43, 0.68) && between(h, 25, 55);
  }
  distance(hsl) {
    const center = { h: 40, s: 0.55, l: 0.55 };
    return hslDistance(hsl, center, { h: 1, s: 1, l: 1.5 });
  }
}

class SmithwicksStrategy extends MatchingStrategy {
  getName() { return "Smithwick's Red Ale"; }
  matches({ h, l }) {
    return between(l, 0.43, 0.73) && between(h, 0, 30);
  }
  distance(hsl) {
    const center = { h: 15, s: 0.55, l: 0.58 };
    return hslDistance(hsl, center, { h: 1, s: 1, l: 1.5 });
  }
}

class SierraNevadaStrategy extends MatchingStrategy {
  getName() { return 'Sierra Nevada Pale Ale'; }
  matches({ h, s, l }) {
    return between(l, 0.53, 0.82) && s >= 0.35 && between(h, 25, 60);
  }
  distance(hsl) {
    const center = { h: 40, s: 0.5, l: 0.65 };
    return hslDistance(hsl, center, { h: 1, s: 2, l: 2 });
  }
}

class VoodooRangerStrategy extends MatchingStrategy {
  getName() { return 'Voodoo Ranger IPA'; }
  matches({ h, s, l }) {
    return between(l, 0.63, 0.88) && s >= 0.45 && between(h, 30, 65);
  }
  distance(hsl) {
    const center = { h: 45, s: 0.6, l: 0.75 };
    return hslDistance(hsl, center, { h: 1, s: 2, l: 2 });
  }
}

class BlueMoonStrategy extends MatchingStrategy {
  getName() { return 'Blue Moon'; }
  matches({ h, s, l }) {
    return between(l, 0.68, 0.92) && s >= 0.45 && between(h, 30, 65);
  }
  distance(hsl) {
    const center = { h: 45, s: 0.55, l: 0.8 };
    return hslDistance(hsl, center, { h: 1, s: 2, l: 2 });
  }
}

class HoegaardenStrategy extends MatchingStrategy {
  getName() { return 'Hoegaarden'; }
  matches({ h, s, l }) {
    return between(l, 0.82, 0.97) && s <= 0.65 && between(h, 35, 70);
  }
  distance(hsl) {
    const center = { h: 50, s: 0.5, l: 0.9 };
    return hslDistance(hsl, center, { h: 1, s: 1, l: 2 });
  }
}

class PilsnerUrquellStrategy extends MatchingStrategy {
  getName() { return 'Pilsner Urquell'; }
  matches({ h, s, l }) {
    return between(l, 0.78, 0.97) && s >= 0.60 && between(h, 35, 70);
  }
  distance(hsl) {
    const center = { h: 50, s: 0.7, l: 0.85 };
    return hslDistance(hsl, center, { h: 1, s: 2, l: 2 });
  }
}

class StandardCiderStrategy extends MatchingStrategy {
  getName() { return 'Angry Orchard / Strongbow Cider'; }
  matches({ h, s, l }) {
    return between(l, 0.78, 0.97) && s >= 0.50 && between(h, 35, 70);
  }
  distance(hsl) {
    const center = { h: 50, s: 0.6, l: 0.85 };
    return hslDistance(hsl, center, { h: 1, s: 2, l: 2 });
  }
}

class CoronaStrategy extends MatchingStrategy {
  getName() { return 'Corona Extra'; }
  matches({ h, s, l }) {
    return l >= 0.88 && s >= 0.55 && between(h, 35, 70);
  }
  distance(hsl) {
    const center = { h: 50, s: 0.65, l: 0.9 };
    return hslDistance(hsl, center, { h: 1, s: 2, l: 2 });
  }
}

class CoorsMillerStrategy extends MatchingStrategy {
  getName() { return 'Coors Light / Miller Lite'; }
  matches({ h, s, l }) {
    return l >= 0.91 && s <= 0.75 && between(h, 40, 75);
  }
  distance(hsl) {
    const center = { h: 55, s: 0.4, l: 0.95 };
    return hslDistance(hsl, center, { h: 1, s: 1, l: 2 });
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

  let closestStrategy = null;
  let closestDistance = Infinity;

  for (const strategy of this.strategies) {
    if (strategy.matches(hslColor)) {
      if (this.debug) console.log(`Matched: ${strategy.getName()}`);
      return strategy.getName();
    }
    if (typeof strategy.distance === 'function') {
      const dist = strategy.distance(hslColor);
      if (dist < closestDistance) {
        closestDistance = dist;
        closestStrategy = strategy;
      }
    }
  }

  if (this.debug) {
    console.log(`No exact match. Closest match is: ${closestStrategy.getName()} (distance: ${closestDistance.toFixed(3)})`);
  }

  return closestStrategy ? closestStrategy.getName() : this.defaultBeverage;
}
}

module.exports = BeerColorMatcher;