require('dotenv').config();
const bcrypt = require('bcrypt');
const { sequelize, Book, Category, BookCategory, Admin } = require('../models');

const categories = [
  { name: 'Historia', slug: 'historia' },
  { name: 'Novela', slug: 'novela' },
  { name: 'Poesía', slug: 'poesia' },
  { name: 'Cuentos', slug: 'cuentos' },
  { name: 'Biografía', slug: 'biografia' },
  { name: 'Derechos Humanos', slug: 'derechos-humanos' },
  { name: 'Feminismo', slug: 'feminismo' },
  { name: 'Espiritualidad', slug: 'espiritualidad' },
];

const books = [
  {
    title: 'Macacha Güemes Tejedora de la Paz',
    slug: 'macacha-guemes-tejedora-de-la-paz',
    author: 'Ana María Cabrera',
    isbn: '978-987-4986-10-8',
    physicalPrice: 29000,
    hasPhysical: true,
    hasDigital: false,
    physicalStock: 50,
  },
  {
    title: 'Felicitas Guerrero - Tramando',
    slug: 'felicitas-guerrero-tramando',
    author: 'Ana María Cabrera',
    isbn: '978-987-4986-08-5',
    physicalPrice: 29000,
    hasPhysical: true,
    hasDigital: false,
    physicalStock: 50,
  },
  {
    title: 'Árboles y Letras',
    slug: 'arboles-y-letras',
    author: 'Ana María Cabrera',
    isbn: '978-987-4986-05-4',
    physicalPrice: 12000,
    hasPhysical: true,
    hasDigital: false,
    physicalStock: 50,
  },
  {
    title: 'La Cartera de los Dioses',
    slug: 'la-cartera-de-los-dioses',
    author: 'Ana María Cabrera',
    isbn: '978-987-4986-092',
    physicalPrice: 19000,
    hasPhysical: true,
    hasDigital: false,
    physicalStock: 50,
  },
  {
    title: 'El Amor Entre Pandemias',
    slug: 'el-amor-entre-pandemias',
    author: 'Ana María Cabrera',
    isbn: '978-987-4986-07-8',
    physicalPrice: 18000,
    hasPhysical: true,
    hasDigital: false,
    physicalStock: 50,
  },
  {
    title: 'Rituales Peligrosos',
    slug: 'rituales-peligrosos',
    author: 'Ana María Cabrera',
    isbn: '978-987-27829-7-9',
    physicalPrice: 24000,
    hasPhysical: true,
    hasDigital: false,
    physicalStock: 50,
  },
  {
    title: 'Cristián Demaría por los Derechos de la Mujer',
    slug: 'cristian-demaria-por-los-derechos-de-la-mujer',
    author: 'Ana María Cabrera',
    isbn: '978-987-27829-6-2',
    physicalPrice: 25000,
    hasPhysical: true,
    hasDigital: false,
    physicalStock: 50,
  },
  {
    title: 'Regina y Marcelo - Un duetto de amor',
    slug: 'regina-y-marcelo-un-duetto-de-amor',
    author: 'Ana María Cabrera',
    isbn: '978-987-27829-4-8',
    physicalPrice: 28000,
    hasPhysical: true,
    hasDigital: false,
    physicalStock: 50,
  },
  {
    title: 'El poder de la bruja',
    slug: 'el-poder-de-la-bruja',
    author: 'Ana María Cabrera',
    isbn: '978-987-4986-05-4',
    physicalPrice: 28000,
    hasPhysical: true,
    hasDigital: false,
    physicalStock: 50,
  },
  {
    title: 'Rosario de mi Vida',
    slug: 'rosario-de-mi-vida',
    author: 'Ana María Cabrera',
    isbn: '978-987-4986-11-5',
    physicalPrice: 17000,
    hasPhysical: true,
    hasDigital: false,
    physicalStock: 50,
  },
  {
    title: 'Todos los viajes un viaje',
    slug: 'todos-los-viajes-un-viaje',
    author: 'Ana María Cabrera',
    isbn: '978-987-4986-12-2',
    physicalPrice: 17000,
    hasPhysical: true,
    hasDigital: false,
    physicalStock: 50,
  },
  {
    title: 'Mamá Antula',
    slug: 'mama-antula',
    author: 'Ana María Cabrera',
    isbn: '978-950-075-914-4',
    physicalPrice: 25000,
    hasPhysical: true,
    hasDigital: false,
    physicalStock: 50,
  },
  {
    title: 'Bienvenido al mundo',
    slug: 'bienvenido-al-mundo',
    author: 'Ana María Cabrera',
    isbn: null, // ⚠️ TBD
    physicalPrice: null, // ⚠️ TBD
    hasPhysical: true,
    hasDigital: false,
    physicalStock: 0,
    isActive: false, // Inactivo hasta tener datos completos
  },
];

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos');

    await sequelize.sync({ force: true });
    console.log('✅ Tablas recreadas');

    // Crear categorías
    const createdCategories = await Category.bulkCreate(categories, { returning: true });
    console.log(`✅ ${createdCategories.length} categorías creadas`);

    // Crear libros
    const createdBooks = await Book.bulkCreate(
      books.map((b) => ({ ...b, editorial: 'Ediciones Felicitas', language: 'Español' })),
      { returning: true }
    );
    console.log(`✅ ${createdBooks.length} libros creados`);

    // Vincular libros aleatoriamente con 1 o 2 categorías para que el filtro funcione
    for (const book of createdBooks) {
      // Tomamos 1 o 2 categorías aleatorias para simular data real
      const randomCount = Math.floor(Math.random() * 2) + 1; 
      const shuffledCategories = createdCategories.sort(() => 0.5 - Math.random());
      const selectedCategories = shuffledCategories.slice(0, randomCount);
      await book.setCategories(selectedCategories);
    }
    console.log('✅ Libros vinculados a categorías exitosamente');

    // Crear admin por defecto
    const adminPassword = await bcrypt.hash('admin123456', 12);
    await Admin.create({
      email: 'manu@edicionesfelicitas.com.ar',
      passwordHash: adminPassword,
      name: 'Manu Salvador',
    });
    console.log('✅ Admin creado (email: manu@edicionesfelicitas.com.ar / pass: admin123456)');
    console.log('⚠️  IMPORTANTE: Cambiar la contraseña del admin en producción');

    console.log('\n🎉 Seed completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en el seed:', error);
    process.exit(1);
  }
};

seed();
