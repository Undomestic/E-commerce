CREATE DATABASE IF NOT EXISTS store_db;
USE store_db;

-- PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(50),
  tags VARCHAR(255),
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(200),
  customer_email VARCHAR(200),
  total DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50),
  stripe_session_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT,
  product_id INT,
  qty INT DEFAULT 1,
  price DECIMAL(10,2),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- SIMPLE USERS TABLE FOR AUTH (OPTIONAL BUT READY)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SAMPLE PRODUCTS
INSERT INTO products (title, description, price, category, tags, image_url)
VALUES
('Demon Slayer T-Shirt', 'Anime oversized T-shirt', 499.00, 'T-Shirts', 't-shirts,anime,oversized', '/images/rengoku.jpg'),
('Attack on Titan T-Shirt', 'Anime oversized T-shirt', 399.00, 'T-Shirts', 't-shirts,anime,oversized', '/images/attackontitan.jpg'),
('Dragon Ball Z T-Shirt', 'Anime oversized T-shirt', 799.00, 'T-Shirts', 't-shirts,anime,oversized', '/images/dragonballz.jpg'),
('Sukuna x Itadori Yuuji Jujutsu Kaisen T-Shirt', 'Anime oversized T-shirt', 349.00, 'T-Shirts', 't-shirts,anime,oversized', '/images/jujutsukaisen.jpg'),
('My Hero Academia - All Mighty T-Shirt', 'Anime oversized T-shirt', 599.00, 'T-Shirts', 't-shirts,anime,oversized', '/images/myheroacademia.jpg'),
('Itachi Uchiha Naruto Shippuden T-Shirt', 'Anime oversized T-shirt', 799.00, 'T-Shirts', 't-shirts,anime,oversized', '/images/narutopirate.jpg'),
('Chainsaw Man Denji T-Shirt', 'Anime oversized T-shirt', 449.00, 'T-Shirts', 't-shirts,anime,oversized', '/images/chainsawman.jpg'),
('Bleach Vasto Lorde Ichigo T-Shirt', 'Anime oversized T-shirt', 379.00, 'T-Shirts', 't-shirts,anime,oversized', '/images/bleach.jpg');
-- SAMPLE PANTS PRODUCTS
INSERT INTO products (title, description, price, category, tags, image_url)
VALUES
('Naruto Ninja Joggers', 'Anime-themed lowerwear joggers', 899.00, 'Pants', 'pants,anime,joggers', '/images/narutojoggers.jpg'),
('One Piece Cargo Pants', 'Straw Hat Crew inspired cargo pants', 999.00, 'Pants', 'pants,anime,cargo', '/images/onepiecepants.jpg'),
('Attack on Titan Scout Regiment Pants', 'AOT scout uniform pants', 1099.00, 'Pants', 'pants,anime,scout,uniform', '/images/aotpants.jpg'),
('Dragon Ball Z Saiyan Training Shorts', 'Orange DBZ training shorts', 599.00, 'Pants', 'pants,anime,shorts,training', '/images/dbzshorts.jpg'),
('Jujutsu Kaisen Uniform Pants', 'Jujutsu High uniform pants', 849.00, 'Pants', 'pants,anime,uniform', '/images/jujutsupants.jpg'),
('Tokyo Revengers Denim Jeans', 'Tokyo Revengers inspired jeans', 949.00, 'Pants', 'pants,anime,jeans,denim', '/images/tokyorevengerspants.jpg'),
('My Hero Academia Sport Shorts', 'UA sports club shorts', 499.00, 'Pants', 'pants,anime,shorts,sports', '/images/mhadeiasports.jpg'),
('Bleach Soul Society Hakama Pants', 'Soul Reaper hakama-style pants', 1150.00, 'Pants', 'pants,anime,hakama', '/images/bleachpants.jpg');
-- SAMPLE ACCESSORIES PRODUCTS
INSERT INTO products (title, description, price, category, tags, image_url)
VALUES
('Attack on Titan Scout Regiment Cap', 'AOT scout regiment cap', 1099.00, 'Accessories', 'accessories,anime,cap,scout', '/images/aotcap.jpg'),
('Dragon Ball Z Saiyan Headband', 'Orange DBZ Saiyan headband', 599.00, 'Accessories', 'accessories,anime,headband,saiyan', '/images/dbzheadband.jpg'),
('Jujutsu Kaisen Cursed Socks', 'Jujutsu High cursed socks', 849.00, 'Accessories', 'accessories,anime,socks,cursed', '/images/jujutsucursed.jpg'),
('Tokyo Revengers Belt', 'Tokyo Revengers belt', 949.00, 'Accessories', 'accessories,anime,belt,tokyorevengers', '/images/tokyorevengersbelt.jpg'),
('My Hero Academia - Deku Beanie', 'My Hero Academia Deku beanie', 499.00, 'Accessories', 'accessories,anime,beanie,deku', '/images/mhadeiabeanie.jpg'),
('Bleach Vasto Lorde Ichigo Beanie', 'Bleach Vasto Lorde Ichigo beanie', 1150.00, 'Accessories', 'accessories,anime,beanie,bleach', '/images/bleachbeanie.jpg');
