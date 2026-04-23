// utils.js

/**
 * 格式化日期
 * @param {Date|string|number} date - 日期
 * @param {string} format - 格式
 * @returns {string}
 */
export function formatDate(date, format = 'YYYY-MM-DD HH:mm') {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const seconds = d.getSeconds().toString().padStart(2, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * 验证手机号
 * @param {string} phone - 手机号
 * @returns {boolean}
 */
export function validatePhone(phone) {
  const reg = /^1[3-9]\d{9}$/;
  return reg.test(phone);
}

/**
 * 验证身份证号
 * @param {string} idCard - 身份证号
 * @returns {boolean}
 */
export function validateIdCard(idCard) {
  const reg = /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[0-9Xx]$/;
  return reg.test(idCard);
}

/**
 * 验证邮箱
 * @param {string} email - 邮箱
 * @returns {boolean}
 */
export function validateEmail(email) {
  const reg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return reg.test(email);
}

/**
 * 防抖函数
 * @param {Function} func - 函数
 * @param {number} wait - 等待时间
 * @returns {Function}
 */
export function debounce(func, wait) {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

/**
 * 节流函数
 * @param {Function} func - 函数
 * @param {number} wait - 等待时间
 * @returns {Function}
 */
export function throttle(func, wait) {
  let lastTime = 0;
  return function() {
    const now = Date.now();
    if (now - lastTime >= wait) {
      func.apply(this, arguments);
      lastTime = now;
    }
  };
}

/**
 * 本地存储封装
 * @param {string} key - 键
 * @param {any} value - 值
 */
export function setStorage(key, value) {
  try {
    wx.setStorageSync(key, value);
  } catch (error) {
    console.error('存储失败:', error);
  }
}

/**
 * 获取本地存储
 * @param {string} key - 键
 * @param {any} defaultValue - 默认值
 * @returns {any}
 */
export function getStorage(key, defaultValue = null) {
  try {
    const value = wx.getStorageSync(key);
    return value !== '' ? value : defaultValue;
  } catch (error) {
    console.error('获取存储失败:', error);
    return defaultValue;
  }
}

/**
 * 移除本地存储
 * @param {string} key - 键
 */
export function removeStorage(key) {
  try {
    wx.removeStorageSync(key);
  } catch (error) {
    console.error('移除存储失败:', error);
  }
}

/**
 * 清空本地存储
 */
export function clearStorage() {
  try {
    wx.clearStorageSync();
  } catch (error) {
    console.error('清空存储失败:', error);
  }
}

/**
 * 生成随机字符串
 * @param {number} length - 长度
 * @returns {string}
 */
export function randomString(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
