/* =========================================================
   F-SQUARE — shared product catalog
   Used by shop.html (grid render), search.js (search bar
   suggestions) and cart.js (fashion orbit showcase).
========================================================= */

const PRODUCTS = [
  { id: 'p1', name: 'Adire Silk Wrap',            price: 12000, category: 'women', fabric: 'Adire',    img: 'Pics/Pics/Adire crack  price_12000.jpg' },
  { id: 'p2', name: 'Aso-Oke Kimono',              price: 25000, category: 'women', fabric: 'Aso-oke',  img: 'Pics/Pics/Colorful Aso-oke Fabric by the Metre_ Nigerian Woven Textile - Etsy.jpg' },
  { id: 'p3', name: 'Ankara Classic Dress',        price: 15000, category: 'women', fabric: 'Ankara',   img: 'Pics/Pics/236368680435312848.jpg' },
  { id: 'p4', name: 'Kente Wrap Tunic',            price: 18000, category: 'men',   fabric: 'Kente',    img: 'Pics/Pics/- Introducing our NEW DELUXE unisex RTW Aso-Oke….jpg' },
  { id: 'p5', name: 'Adire Indigo Bubu',           price: 20000, category: 'women', fabric: 'Adire',    img: 'Pics/Pics/236368680433761407.jpg' },
  { id: 'p6', name: 'Organza Evening Gown',        price: 32000, category: 'women', fabric: 'Organza',  img: 'Pics/Pics/281543724205090.jpg' },
  { id: 'p7', name: 'Aso-Oke Striped Kaftan',      price: 27000, category: 'men',   fabric: 'Aso-oke',  img: 'Pics/Pics/Our double threaded asooke mix with jawu jacket is….jpg' },
  { id: 'p8', name: 'Heritage Print Two-Piece',    price: 22000, category: 'women', fabric: 'Ankara',   img: 'Pics/Pics/1055599907027437.jpg' },
  { id: 'p9', name: 'Artisan Weave Tunic',         price: 16000, category: 'men',   fabric: 'Handwoven',img: 'Pics/Pics/8373949303637983.jpg' },
  { id: 'p10', name: 'Fabric Bundle — Ankara',     price: 8000,  category: 'fabric',fabric: 'Ankara',   img: 'Pics/Pics/Phoenix with Paulownia & Bamboo - 70cm x 300cm.jpg' },
  { id: 'p11', name: 'Fabric Bundle — Aso-Oke',    price: 9500,  category: 'fabric',fabric: 'Aso-oke',  img: 'Pics/Pics/Rodolph Fabric Search_.jpg' },
  { id: 'p12', name: 'Fabric Bundle — Adire',      price: 7500,  category: 'fabric',fabric: 'Adire',    img: 'Pics/Pics/Ivonne D 122D64W - Tulle Off-Shoulder Formal Gown - 20W _ Navy.jpg' },
];

// Expose to other scripts (search.js, cart.js, shop.html)
window.PRODUCTS = PRODUCTS;
