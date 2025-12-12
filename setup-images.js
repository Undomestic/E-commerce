const fs = require('fs');
const path = require('path');

// Product mapping with their image filenames
const products = {
  'T-Shirts': [
    'Demon Slayer Tee',
    'Attack on Titan Shirt',
    'Naruto Shippuden Tee',
    'One Piece Casual',
    'My Hero Academia Sports Tee',
    'Death Note Classic',
    'Jujutsu Kaisen Graphic',
    'Bleach Striped Shirt'
  ],
  'Pants': [
    'Sword Art Online Jeans',
    'Steins;Gate Trousers',
    'Code Geass Chinos',
    'Tokyo Ghoul Shorts',
    'Fullmetal Alchemist Formal Pants',
    'Mob Psycho Sports Shorts',
    'Ergo Proxy Khaki Pants',
    'Cowboy Bebop Cargo Shorts'
  ],
  'Accessories': [
    'Haikyuu Socks',
    'Spy x Family Cap',
    'Chainsaw Man Beanie',
    'Vinland Saga Belt',
    'Evangelion Sunglasses',
    'Gintama Sports Watch',
    'Natsume Yuujinchou Wallet',
    'A Place Further Keychain'
  ]
};

// Function to check if image exists
function imageExists(category, productName) {
  const imageDir = path.join(__dirname, 'Backend', 'public_images', category);
  const imageName = `${productName}.jpg`;
  const fullPath = path.join(imageDir, imageName);
  return fs.existsSync(fullPath);
}

// Function to verify all images are in place
function verifyImages() {
  console.log('🔍 Checking for product images...\n');
  let missingCount = 0;

  Object.entries(products).forEach(([category, productList]) => {
    console.log(`📁 ${category}:`);
    productList.forEach(product => {
      if (imageExists(category, product)) {
        console.log(`  ✅ ${product}.jpg`);
      } else {
        console.log(`  ❌ ${product}.jpg (MISSING)`);
        missingCount++;
      }
    });
    console.log('');
  });

  if (missingCount === 0) {
    console.log('✨ All images found! Website is ready to display products.\n');
    return true;
  } else {
    console.log(`⚠️  Found ${missingCount} missing images.\n`);
    console.log('📝 Please copy all product images to:');
    console.log('   Backend/public_images/<Category>/\n');
    return false;
  }
}

// Main execution
console.log('╔═══════════════════════════════════════╗');
console.log('║  Infinity Castle Image Setup Checker  ║');
console.log('╚═══════════════════════════════════════╝\n');

const allReady = verifyImages();

if (allReady) {
  console.log('🚀 Your website is ready to serve images!');
  console.log('   Frontend: http://localhost:5500');
  console.log('   Backend API: http://localhost:4000/api');
} else {
  console.log('📚 Follow the IMAGE_SETUP_GUIDE.md for detailed instructions.');
}
