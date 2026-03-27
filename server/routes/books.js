const express = require('express');
const router = express.Router();
const { getBooks, getBookBySlug } = require('../controllers/bookController');

// GET /api/books
router.get('/', getBooks);

// GET /api/books/:slug
router.get('/:slug', getBookBySlug);

module.exports = router;
