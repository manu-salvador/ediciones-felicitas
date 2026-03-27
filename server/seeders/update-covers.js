/**
 * update-covers.js
 * Vincula las imágenes de portada de webManu con los libros en la BD
 * Ejecutar: node seeders/update-covers.js
 */
require('dotenv').config();
const { sequelize, Book } = require('../models');

// Mapa slug → nombre de archivo PNG (copiadas en uploads/covers/)
const coverMap = {
  'macacha-guemes-tejedora-de-la-paz':          'Macacha-Guemes-mockup.png',
  'felicitas-guerrero-tramando':                 'Felicitas-Guerrero-mockup (2).png',
  'arboles-y-letras':                            'Arboles-y-letras-3D.png',
  'la-cartera-de-los-dioses':                    'Cartera de los dioses mockup.png',
  'el-amor-entre-pandemias':                     'Amor-entre-pandemias-mockup-ok.png',
  'rituales-peligrosos':                         'Rituales Peligrosos.png',
  'cristian-demaria-por-los-derechos-de-la-mujer': 'Cristián Demaría.png',
  'el-poder-de-la-bruja':                        'El-poder-de-la-bruja-mockup (1).png',
  'bienvenido-al-mundo':                         'Bienvenido al mundo mockup.png',
  'rosario-de-mi-vida':                          'Rosario de mi vida mockup (1).png',
};

const run = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a la BD');

    let updated = 0;
    let notFound = 0;

    for (const [slug, filename] of Object.entries(coverMap)) {
      const book = await Book.findOne({ where: { slug } });

      if (!book) {
        console.warn(`⚠️  Libro no encontrado: ${slug}`);
        notFound++;
        continue;
      }

      await book.update({ coverImage: `covers/${filename}` });
      console.log(`✅  ${book.title} → covers/${filename}`);
      updated++;
    }

    console.log(`\n🎉 ${updated} portadas vinculadas. ${notFound} libros no encontrados.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

run();
