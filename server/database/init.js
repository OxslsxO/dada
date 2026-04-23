const initSQLJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const config = require('../src/config');
const logger = require('../src/utils/logger');

const dbDir = path.dirname(config.db.path);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

async function initDatabase() {
  const SQL = await initSQLJs();

  let db;
  const dbPath = path.resolve(config.db.path);
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run('PRAGMA foreign_keys = ON');

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      openid TEXT UNIQUE NOT NULL,
      session_key TEXT,
      nickname TEXT DEFAULT '',
      avatar_url TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      gender INTEGER DEFAULT 0,
      is_authenticated INTEGER DEFAULT 0,
      real_name TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime')),
      last_login_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_users_openid ON users(openid)`);

  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      code TEXT UNIQUE NOT NULL,
      icon TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0,
      status INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      creator_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      category_id INTEGER,
      category_name TEXT DEFAULT '',
      images TEXT DEFAULT '[]',
      start_time TEXT,
      end_time TEXT,
      signup_deadline TEXT,
      address TEXT DEFAULT '',
      latitude REAL DEFAULT 0,
      longitude REAL DEFAULT 0,
      max_members INTEGER DEFAULT 0,
      current_members INTEGER DEFAULT 1,
      tags TEXT DEFAULT '[]',
      status TEXT DEFAULT 'draft',
      cover TEXT DEFAULT '',
      requirements TEXT DEFAULT '',
      view_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (creator_id) REFERENCES users(id),
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_activities_creator ON activities(creator_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_activities_category ON activities(category_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_activities_start_time ON activities(start_time)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at)`);

  db.run(`
    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      activity_id TEXT NOT NULL,
      applicant_id TEXT NOT NULL,
      reason TEXT DEFAULT '',
      status TEXT DEFAULT 'pending',
      handler_id TEXT,
      handler_remark TEXT DEFAULT '',
      handled_at TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (activity_id) REFERENCES activities(id),
      FOREIGN KEY (applicant_id) REFERENCES users(id),
      FOREIGN KEY (handler_id) REFERENCES users(id)
    )
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_applications_activity ON applications(activity_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_applications_applicant ON applications(applicant_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status)`);
  db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_applications_unique ON applications(activity_id, applicant_id)`);

  db.run(`
    CREATE TABLE IF NOT EXISTS operation_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      action TEXT NOT NULL,
      target_type TEXT,
      target_id TEXT,
      detail TEXT DEFAULT '',
      ip TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_operation_logs_user ON operation_logs(user_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_operation_logs_action ON operation_logs(action)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_operation_logs_created_at ON operation_logs(created_at)`);

  const defaultCategories = [
    { name: '饭搭子', code: 'food', icon: '🍜', sort_order: 1 },
    { name: '运动搭子', code: 'sports', icon: '🏃', sort_order: 2 },
    { name: '游戏搭子', code: 'game', icon: '🎮', sort_order: 3 },
    { name: '探店搭子', code: 'shopping', icon: '🛍️', sort_order: 4 },
    { name: '学习搭子', code: 'study', icon: '📚', sort_order: 5 },
    { name: '出行搭子', code: 'travel', icon: '✈️', sort_order: 6 },
    { name: '娱乐搭子', code: 'entertainment', icon: '🎬', sort_order: 7 },
    { name: '健身搭子', code: 'fitness', icon: '💪', sort_order: 8 },
    { name: '宠物搭子', code: 'pet', icon: '🐾', sort_order: 9 },
    { name: '其他', code: 'other', icon: '📌', sort_order: 10 }
  ];

  for (const cat of defaultCategories) {
    const existing = db.exec(`SELECT id FROM categories WHERE code = '${cat.code}'`);
    if (!existing.length || !existing[0].values.length) {
      db.run(`INSERT INTO categories (name, code, icon, sort_order) VALUES (?, ?, ?, ?)`,
        [cat.name, cat.code, cat.icon, cat.sort_order]);
    }
  }

  saveDb(db, dbPath);

  console.log('数据库初始化完成');
  console.log('- users 表已创建');
  console.log('- categories 表已创建（已插入10个默认分类）');
  console.log('- activities 表已创建');
  console.log('- applications 表已创建');
  console.log('- operation_logs 表已创建');

  db.close();
}

function saveDb(db, dbPath) {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

initDatabase().catch(err => {
  console.error('数据库初始化失败:', err);
  process.exit(1);
});
