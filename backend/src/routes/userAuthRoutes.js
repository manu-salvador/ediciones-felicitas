const express = require('express');
const router = express.Router();
const { register, login, me, updateProfile } = require('../controllers/userAuthController');
const { verifyUserToken } = require('../middleware/userAuthMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', verifyUserToken, me);
router.put('/me', verifyUserToken, updateProfile);

module.exports = router;
