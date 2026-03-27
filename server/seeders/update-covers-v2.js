/**
 * update-covers-v2.js
 * Actualiza las portadas en la DB con los nombres de archivo simplificados
 * (sin espacios ni caracteres especiales), que coinciden con los PNGs en client/public/covers/
 * Ejecutar: node seeders/update-covers-v2.js
 */
require('dotenv').config();
const { sequelize, Book } = require('../models');

// slug → nombre de archivo en client/public/covers/ (ya sin espacios ni caracteres raros)
const coverMap = {
  'macacha-guemes-tejedora-de-la-paz':              'macacha-guemes.png',
  'felicitas-guerrero-tramando':                    'felicitas-guerrero.png',
  'arboles-y-letras':                               'arboles-y-letras.png',
  'la-cartera-de-los-dioses':                       'cartera-de-los-dioses.png',
  'el-amor-entre-pandemias':                        'amor-entre-pandemias.png',
  'rituales-peligrosos':                            'rituales-peligrosos.png',
  'cristian-demaria-por-los-derechos-de-la-mujer':  'cristian-demaria.png',
  'el-poder-de-la-bruja':                           'el-poder-de-la-bruja.png',
  'bienvenido-al-mundo':                            'bienvenido-al-mundo.png',
  'rosario-de-mi-vida':                             'rosario-de-mi-vida.png',
};

const run = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a la BD');

    let updated = 0;

    for (const [slug, filename] of Object.entries(coverMap)) {
      const book = await Book.findOne({ where: { slug } });
      if (!book) { console.warn(`⚠️  No encontrado: ${slug}`); continue; }

      // Guardamos como "covers/nombre.png" → el BookCard construye "/covers/nombre.png"
      await book.update({ coverImage: `covers/${filename}` });
      console.log(`✅  ${book.title} → covers/${filename}`);
      updated++;
    }

    console.log(`\n🎉 ${updated} portadas actualizadas.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

run();
