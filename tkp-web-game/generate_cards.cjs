const fs = require('fs');
const path = require('path');

const cardsFilePath = path.join(__dirname, 'src', 'data', 'cards.json');

// Read existing cards
const existingCards = JSON.parse(fs.readFileSync(cardsFilePath, 'utf8'));

// Data pools for generating cards
const locations = ['Tokyo', 'Osaka', 'Fukuoka', 'Nagoya', 'Sapporo', 'Sendai', 'Hiroshima', 'Yokohama', 'Kyoto', 'Kobe'];
const types = ['conference', 'hall', 'office', 'banquet'];
const prefixes = ['TKPガーデンシティ', 'TKPカンファレンスセンター', 'TKP貸会議室', 'TKPホール', 'TKPビジネスセンター'];
const suffixes = ['本館', 'アネックス', 'プレミアム', 'タワー', 'EAST', 'WEST', 'SOUTH', 'NORTH', '駅前'];

const rarities = ['R', 'SR', 'SSR'];

const generateCard = (idIndex) => {
  const loc = locations[Math.floor(Math.random() * locations.length)];
  const type = types[Math.floor(Math.random() * types.length)];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.random() > 0.5 ? suffixes[Math.floor(Math.random() * suffixes.length)] : '';
  
  // Decide rarity probabilities: 60% R, 30% SR, 10% SSR
  const r = Math.random();
  let rarity = 'R';
  if (r > 0.9) rarity = 'SSR';
  else if (r > 0.6) rarity = 'SR';

  // Base stats on rarity
  let capacity = 0;
  let knowledge = 0;
  let sales = 0;
  let satisfaction = 0;

  if (rarity === 'R') {
    capacity = Math.floor(Math.random() * 50) + 10;
    knowledge = Math.floor(Math.random() * 10) + 5;
    satisfaction = Math.floor(Math.random() * 10) + 5;
    sales = Math.floor(Math.random() * 100000) + 50000;
  } else if (rarity === 'SR') {
    capacity = Math.floor(Math.random() * 150) + 50;
    knowledge = Math.floor(Math.random() * 20) + 10;
    satisfaction = Math.floor(Math.random() * 20) + 10;
    sales = Math.floor(Math.random() * 300000) + 150000;
  } else { // SSR
    capacity = Math.floor(Math.random() * 500) + 200;
    knowledge = Math.floor(Math.random() * 40) + 20;
    satisfaction = Math.floor(Math.random() * 40) + 20;
    sales = Math.floor(Math.random() * 800000) + 400000;
  }

  const name = `${prefix}${loc}${suffix}`;
  
  // Reuse existing images
  const existingImages = existingCards.map(c => c.image);
  const image = existingImages[Math.floor(Math.random() * existingImages.length)];

  return {
    id: `tkp_gen_${idIndex}`,
    name,
    rarity,
    type,
    capacity,
    location: loc,
    image,
    stats: {
      knowledge,
      satisfaction,
      sales
    }
  };
};

const numToGenerate = 100 - existingCards.length;
const newCards = [];

for (let i = 0; i < numToGenerate; i++) {
  newCards.push(generateCard(i + 1));
}

const allCards = [...existingCards, ...newCards];

fs.writeFileSync(cardsFilePath, JSON.stringify(allCards, null, 2), 'utf8');
console.log(`Generated ${newCards.length} cards. Total cards: ${allCards.length}`);
