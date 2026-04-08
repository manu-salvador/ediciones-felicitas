/**
 * updateCatalog.js
 * Copies covers from webManu desktop folder → uploads/libros/
 * Updates all books with Excel data (title, author, genre, isbn, price, pages, imagen)
 * Run from: backend/   →   node scripts/updateCatalog.js
 */

const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

const WEBMANU = 'C:/Users/USUARIO/Desktop/webManu';
const UPLOADS  = path.join(__dirname, '../uploads/libros');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database.sqlite'),
  logging: false,
});

const Book = sequelize.define('Book', {
  titulo:       DataTypes.STRING,
  isbn:         DataTypes.STRING,
  precio:       DataTypes.DECIMAL(10, 2),
  autor:        DataTypes.STRING,
  categoria:    DataTypes.STRING,
  imagen:       DataTypes.STRING,
  activo:       DataTypes.BOOLEAN,
  paginas:      DataTypes.INTEGER,
  stock:        DataTypes.INTEGER,
  tieneDigital: DataTypes.BOOLEAN,
  archivoDigital: DataTypes.STRING,
}, { tableName: 'Books' });

// Book data from Excel + image filename mapping
const catalog = [
  { id: 1,  titulo: 'Macacha Güemes',            autor: 'Ana María Cabrera',                  categoria: 'Novela histórica',      isbn: '978-987-4986-10-8',    precio: 29000, paginas: 238, img: 'Machaca Güemes - Tejedora de la Paz.png' },
  { id: 2,  titulo: 'Felicitas Guerrero',          autor: 'Ana María Cabrera',                  categoria: 'Novela histórica',      isbn: '978-987-4986-08-5',    precio: 29000, paginas: 254, img: 'Felicitas Guerrero - Tramando.png' },
  { id: 3,  titulo: 'Árboles y Letras',            autor: 'Ana María Cabrera / Rafael R. Sirvén', categoria: 'Agronomía / Literatura', isbn: '978-987-4986-05-4',    precio: 12000, paginas: 154, img: 'Árboles y Letras - Un libro a dos voces.png' },
  { id: 4,  titulo: 'La Cartera de los Dioses',   autor: 'Patricia Julio',                     categoria: 'Historia antigua',      isbn: '978-987-4986-092',     precio: 19000, paginas: 111, img: 'Cartera de los dioses.png' },
  { id: 5,  titulo: 'El amor entre pandemias',    autor: 'Ana María Cabrera',                  categoria: 'Novela histórica',      isbn: '978-987-4986-07-8',    precio: 18000, paginas: 80,  img: 'El Amor Entre Pandemias.png' },
  { id: 6,  titulo: 'Rituales Peligrosos',        autor: 'Ana María Cabrera',                  categoria: 'Novela histórica',      isbn: '978-987-27829-7-9',    precio: 24000, paginas: 149, img: 'Rituales Peligrosos.png' },
  { id: 7,  titulo: 'Cristián Demaría',           autor: 'Ana María Cabrera',                  categoria: 'Novela histórica',      isbn: '978-987-27829-6-2',    precio: 25000, paginas: 198, img: 'Cristián Demaría.png' },
  { id: 8,  titulo: 'Regina y Marcelo',           autor: 'Ana María Cabrera',                  categoria: 'Novela histórica',      isbn: '978-987-27829-4-8',    precio: 28000, paginas: 237, img: 'Regina y Marcela - Un duetto de amor.png' },
  { id: 9,  titulo: 'El poder de la bruja',       autor: 'Salomé Suárez',                      categoria: 'Ensayo histórico',      isbn: '978-987-4986-05-4-b',  precio: 28000, paginas: 360, img: 'El Poder de la Bruja - El lado oculto de la transgresión feminista.png' },
  { id: 10, titulo: 'Rosario de mi vida',         autor: 'Javier Olavarría',                   categoria: 'Literatura argentina',  isbn: '978-987-4986-11-5',    precio: 17000, paginas: 120, img: 'Rosario de mi vida mockup (1).png' },
  { id: 11, titulo: 'Todos los viajes, un viaje', autor: 'Juan Ángel Sozio',                   categoria: 'Literatura argentina',  isbn: '978-987-4986-12-2',    precio: 17000, paginas: 56,  img: 'Todos los viajes un viaje - Tapa.jpg' },
  { id: 12, titulo: 'Mamá Antula',                autor: 'Ana María Cabrera',                  categoria: 'Novela histórica',      isbn: '978-950-075-914-4',    precio: 25000, paginas: 176, img: 'mama-antula.jpg' },
  // Book 13: 2nd Rituales Peligrosos — different ISBN, price/pages pending from client
  { id: null, titulo: 'Rituales Peligrosos (2a ed.)', autor: 'Ana María Cabrera', categoria: 'Novela histórica', isbn: '978-987-4986-14-6', precio: null, paginas: null, img: 'Rituales Peligrosos.png' },
];

function copyImage(src, destName) {
  const srcPath = path.join(WEBMANU, src);
  const ext = path.extname(src).toLowerCase();
  const destPath = path.join(UPLOADS, destName + ext);
  if (!fs.existsSync(srcPath)) {
    console.warn(`  ⚠ Image not found: ${src}`);
    return null;
  }
  fs.copyFileSync(srcPath, destPath);
  const type = 'libros';
  return `/uploads/${type}/${destName}${ext}`;
}

async function run() {
  fs.mkdirSync(UPLOADS, { recursive: true });
  await sequelize.authenticate();
  console.log('DB connected.\n');

  for (const entry of catalog) {
    // Copy image
    const slug = entry.titulo.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const imagenUrl = entry.img ? copyImage(entry.img, slug) : null;

    const updateData = {
      titulo:    entry.titulo,
      autor:     entry.autor,
      categoria: entry.categoria,
      isbn:      entry.isbn,
      ...(entry.precio  !== null && { precio: entry.precio }),
      ...(entry.paginas !== null && { paginas: entry.paginas }),
      ...(imagenUrl && { imagen: imagenUrl }),
    };

    if (entry.id) {
      await Book.update(updateData, { where: { id: entry.id } });
      console.log(`✓ Updated id=${entry.id}: ${entry.titulo}`);
    } else {
      // Check if already exists by ISBN
      const existing = await Book.findOne({ where: { isbn: entry.isbn } });
      if (existing) {
        await existing.update({ ...updateData, ...(imagenUrl && { imagen: imagenUrl }) });
        console.log(`✓ Updated (by isbn) id=${existing.id}: ${entry.titulo}`);
      } else {
        const created = await Book.create({ ...updateData, precio: 0, paginas: null, activo: false, stock: 0 });
        console.log(`✓ Created id=${created.id}: ${entry.titulo} — ⚠ price/pages pending from client`);
      }
    }
  }

  console.log('\nDone.');
  await sequelize.close();
}

run().catch(err => { console.error(err); process.exit(1); });
