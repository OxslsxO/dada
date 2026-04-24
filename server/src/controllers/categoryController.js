const Category = require('../models/Category');
const { success } = require('../utils/response');

const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ status: 1 }).sort({ sortOrder: 1 });

    return success(res, categories.map(cat => ({
      id: cat._id,
      name: cat.name,
      code: cat.code,
      icon: cat.icon,
      sortOrder: cat.sortOrder
    })));
  } catch (err) {
    next(err);
  }
};

module.exports = { getCategories };
