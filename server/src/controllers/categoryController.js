const db = require('../models/db');
const { success } = require('../utils/response');

const getCategories = async (req, res, next) => {
  try {
    const categories = db.all(`
      SELECT * FROM categories WHERE status = 1 ORDER BY sort_order ASC
    `);

    return success(res, categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      code: cat.code,
      icon: cat.icon,
      sortOrder: cat.sort_order
    })));
  } catch (err) {
    next(err);
  }
};

module.exports = { getCategories };
