// 数据库管理工具
const DB_KEY = 'dada_database';

// 初始化数据库
function initDB() {
  const db = wx.getStorageSync(DB_KEY);
  if (!db) {
    const initialDB = {
      grids: [],
      users: [],
      applications: [],
      messages: []
    };
    wx.setStorageSync(DB_KEY, initialDB);
    return initialDB;
  }
  return db;
}

// 获取数据库
function getDB() {
  return wx.getStorageSync(DB_KEY) || initDB();
}

// 保存数据库
function saveDB(db) {
  wx.setStorageSync(DB_KEY, db);
}

// 格子相关操作
const GridsDB = {
  // 获取所有格子
  getAll() {
    const db = getDB();
    return db.grids || [];
  },

  // 根据ID获取格子
  getById(id) {
    const db = getDB();
    return db.grids.find(grid => grid.id === id) || null;
  },

  // 添加格子
  add(grid) {
    const db = getDB();
    grid.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    grid.createTime = new Date().toISOString();
    grid.currentMembers = 1; // 初始创建者为1人
    db.grids.unshift(grid);
    saveDB(db);
    return grid;
  },

  // 更新格子
  update(id, data) {
    const db = getDB();
    const index = db.grids.findIndex(grid => grid.id === id);
    if (index !== -1) {
      db.grids[index] = { ...db.grids[index], ...data };
      saveDB(db);
      return db.grids[index];
    }
    return null;
  },

  // 删除格子
  delete(id) {
    const db = getDB();
    db.grids = db.grids.filter(grid => grid.id !== id);
    saveDB(db);
  },

  // 根据条件筛选
  filter(options = {}) {
    const { type, location, people, time, startTime, endTime } = options;
    let grids = this.getAll();

    if (type && type !== '全部') {
      grids = grids.filter(grid => grid.type === type || grid.type.includes(type));
    }

    if (location && location !== '全部') {
      grids = grids.filter(grid => grid.location.includes(location));
    }

    if (people && people !== '全部') {
      grids = grids.filter(grid => {
        const totalNum = grid.maxMembers;
        if (people === '2-3人') return totalNum >= 2 && totalNum <= 3;
        if (people === '4-6人') return totalNum >= 4 && totalNum <= 6;
        if (people === '7-10人') return totalNum >= 7 && totalNum <= 10;
        if (people === '10人以上') return totalNum > 10;
        return true;
      });
    }

    // 时间筛选
    if (startTime && endTime) {
      // 自定义时间范围筛选
      grids = grids.filter(grid => {
        const gridTime = new Date(grid.time).getTime();
        return gridTime >= startTime && gridTime <= endTime;
      });
    } else if (time && time !== '全部') {
      // 预设时间范围筛选
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);
      const weekendStart = new Date(today);
      weekendStart.setDate(today.getDate() + (6 - today.getDay()));
      const weekendEnd = new Date(weekendStart);
      weekendEnd.setDate(weekendStart.getDate() + 2);

      grids = grids.filter(grid => {
        const gridTime = new Date(grid.time).getTime();
        switch (time) {
          case '今天':
            return gridTime >= today.getTime() && gridTime < tomorrow.getTime();
          case '明天':
            return gridTime >= tomorrow.getTime() && gridTime < weekendStart.getTime();
          case '本周':
            return gridTime >= weekStart.getTime() && gridTime < weekEnd.getTime();
          case '周末':
            return gridTime >= weekendStart.getTime() && gridTime < weekendEnd.getTime();
          default:
            return true;
        }
      });
    }

    return grids;
  }
};

// 用户相关操作
const UsersDB = {
  getAll() {
    const db = getDB();
    return db.users || [];
  },

  getById(id) {
    const db = getDB();
    return db.users.find(user => user.id === id) || null;
  },

  add(user) {
    const db = getDB();
    user.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    user.createTime = new Date().toISOString();
    db.users.push(user);
    saveDB(db);
    return user;
  },

  update(id, data) {
    const db = getDB();
    const index = db.users.findIndex(user => user.id === id);
    if (index !== -1) {
      db.users[index] = { ...db.users[index], ...data };
      saveDB(db);
      return db.users[index];
    }
    return null;
  }
};

// 申请相关操作
const ApplicationsDB = {
  getAll() {
    const db = getDB();
    return db.applications || [];
  },

  getByGridId(gridId) {
    const db = getDB();
    return db.applications.filter(app => app.gridId === gridId) || [];
  },

  getByUserId(userId) {
    const db = getDB();
    return db.applications.filter(app => app.userId === userId) || [];
  },

  add(application) {
    const db = getDB();
    application.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    application.createTime = new Date().toISOString();
    application.status = 'pending';
    db.applications.push(application);
    saveDB(db);
    return application;
  },

  updateStatus(id, status, reason = '') {
    const db = getDB();
    const index = db.applications.findIndex(app => app.id === id);
    if (index !== -1) {
      db.applications[index].status = status;
      db.applications[index].reason = reason;
      db.applications[index].updateTime = new Date().toISOString();
      saveDB(db);
      return db.applications[index];
    }
    return null;
  }
};

// 消息相关操作
const MessagesDB = {
  getAll() {
    const db = getDB();
    return db.messages || [];
  },

  getByUserId(userId) {
    const db = getDB();
    return db.messages.filter(msg => msg.userId === userId) || [];
  },

  add(message) {
    const db = getDB();
    message.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    message.createTime = new Date().toISOString();
    message.read = false;
    db.messages.unshift(message);
    saveDB(db);
    return message;
  },

  markAsRead(id) {
    const db = getDB();
    const index = db.messages.findIndex(msg => msg.id === id);
    if (index !== -1) {
      db.messages[index].read = true;
      db.messages[index].readTime = new Date().toISOString();
      saveDB(db);
      return db.messages[index];
    }
    return null;
  },

  markAllAsRead(userId) {
    const db = getDB();
    db.messages.forEach(msg => {
      if (msg.userId === userId && !msg.read) {
        msg.read = true;
        msg.readTime = new Date().toISOString();
      }
    });
    saveDB(db);
  }
};

module.exports = {
  initDB,
  getDB,
  saveDB,
  GridsDB,
  UsersDB,
  ApplicationsDB,
  MessagesDB
};
