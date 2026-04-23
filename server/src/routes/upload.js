const { Router } = require('express');
const router = Router();
const { auth } = require('../middleware/auth');
const { upload, uploadImages } = require('../controllers/uploadController');

router.post('/images', auth, upload.array('images', 9), uploadImages);

module.exports = router;
