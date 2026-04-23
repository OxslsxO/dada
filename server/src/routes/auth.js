const { Router } = require('express');
const router = Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');

router.post('/login', authLimiter, authController.login);
router.get('/userinfo', auth, authController.getUserInfo);
router.put('/userinfo', auth, authController.updateUserInfo);
router.post('/bind-phone', auth, authController.bindPhone);
router.post('/authenticate', auth, authController.authenticate);

module.exports = router;
