const initSQLJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const config = require('../config');
const logger = require('../utils/logger');

const dbDir = path.dirname(config.db.path);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.resolve(config.db.path);

let db = null;
let saveTimer = null;

async function connect() {
  const SQL = await initSQLJs();

  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run('PRAGMA foreign_keys = ON');

  logger.info('数据库连接成功');
  return db;
}

function save() {
  if (!db) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  } catch (err) {
    logger.error('数据库保存失败', { error: err.message });
  }
}

function delayedSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    save();
    saveTimer = null;
  }, 500);
}

function getDb() {
  return db;
}

function run(sql, params) {
  if (!db) throw new Error('数据库未初始化');
  try {
    db.run(sql, params);
    delayedSave();
    return { changes: db.getRowsModified() };
  } catch (err) {
    logger.error('SQL执行错误', { sql, params, error: err.message });
    throw err;
  }
}

function get(sql, params) {
  if (!db) throw new Error('数据库未初始化');
  try {
    const stmt = db.prepare(sql);
    stmt.bind(params || []);
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return row;
    }
    stmt.free();
    return null;
  } catch (err) {
    logger.error('SQL查询错误', { sql, params, error: err.message });
    throw err;
  }
}

function all(sql, params) {
  if (!db) throw new Error('数据库未初始化');
  try {
    const stmt = db.prepare(sql);
    stmt.bind(params || []);
    const rows = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();
    return rows;
  } catch (err) {
    logger.error('SQL查询错误', { sql, params, error: err.message });
    throw err;
  }
}

function exec(sql) {
  if (!db) throw new Error('数据库未初始化');
  try {
    db.exec(sql);
    delayedSave();
  } catch (err) {
    logger.error('SQL执行错误', { sql, error: err.message });
    throw err;
  }
}

function transaction(fn) {
  run('BEGIN TRANSACTION');
  try {
    const result = fn();
    run('COMMIT');
    return result;
  } catch (err) {
    run('ROLLBACK');
    throw err;
  }
}

function close() {
  if (db) {
    save();
    db.close();
    db = null;
  }
}

process.on('exit', close);
process.on('SIGINT', () => {
  close();
  process.exit(0);
});

module.exports = {
  connect,
  getDb,
  run,
  get,
  all,
  exec,
  save,
  transaction,
  close
};
