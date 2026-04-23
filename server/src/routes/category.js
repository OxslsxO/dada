const { Router } = require('express');
const router = Router();
const categoryController = require('../controllers/categoryController');

router.get('/', categoryController.getCategories);

module.exports = router;
