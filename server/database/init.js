require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../src/config');
const Category = require('../src/models/Category');

const defaultCategories = [
  { name: '饭搭子', code: 'food', icon: '🍜', sortOrder: 1 },
  { name: '运动搭子', code: 'sports', icon: '🏃', sortOrder: 2 },
  { name: '游戏搭子', code: 'game', icon: '🎮', sortOrder: 3 },
  { name: '探店搭子', code: 'shopping', icon: '🛍️', sortOrder: 4 },
  { name: '学习搭子', code: 'study', icon: '📚', sortOrder: 5 },
  { name: '出行搭子', code: 'travel', icon: '✈️', sortOrder: 6 },
  { name: '娱乐搭子', code: 'entertainment', icon: '🎬', sortOrder: 7 },
  { name: '健身搭子', code: 'fitness', icon: '💪', sortOrder: 8 },
  { name: '宠物搭子', code: 'pet', icon: '🐾', sortOrder: 9 },
  { name: '其他', code: 'other', icon: '📌', sortOrder: 10 }
];

async function initDatabase() {
  try {
    await mongoose.connect(config.db.uri);
    console.log('MongoDB 连接成功');

    for (const cat of defaultCategories) {
      const existing = await Category.findOne({ code: cat.code });
      if (!existing) {
        await Category.create(cat);
        console.log(`创建分类: ${cat.name}`);
      } else {
        console.log(`分类已存在: ${cat.name}`);
      }
    }

    console.log('数据库初始化完成');
    process.exit(0);
  } catch (err) {
    console.error('数据库初始化失败:', err);
    process.exit(1);
  }
}

initDatabase();
