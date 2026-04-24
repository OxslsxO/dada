const BASE_URL = 'http://localhost:3001/api';

function request(options) {
  return new Promise((resolve, reject) => {
    if (options.showLoading !== false) {
      wx.showLoading({
        title: options.loadingText || '加载中...',
        mask: options.mask !== false
      });
    }

    const app = getApp();
    const token = app ? app.globalData.token : null;
    const header = {
      'Content-Type': 'application/json',
      ...options.header
    };
    if (token) {
      header['Authorization'] = 'Bearer ' + token;
    }

    wx.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header,
      success: (res) => {
        if (options.showLoading !== false) {
          wx.hideLoading();
        }
        if (res.statusCode === 200) {
          if (res.data.code === 0) {
            resolve(res.data.data);
          } else {
            wx.showToast({
              title: res.data.message || '请求失败',
              icon: 'none'
            });
            reject(res.data);
          }
        } else if (res.statusCode === 401) {
          const app = getApp();
          if (app && app.logout) {
            app.logout();
          }
          wx.showToast({
            title: '登录已过期，请重新登录',
            icon: 'none'
          });
          setTimeout(() => {
            wx.reLaunch({ url: '/pages/login/login' });
          }, 1500);
          reject(res.data);
        } else if (res.statusCode === 403) {
          wx.showToast({ title: '权限不足', icon: 'none' });
          reject(res.data);
        } else {
          wx.showToast({
            title: (res.data && res.data.message) || '请求失败',
            icon: 'none'
          });
          reject(res.data || res);
        }
      },
      fail: (err) => {
        if (options.showLoading !== false) {
          wx.hideLoading();
        }
        wx.showToast({ title: '网络错误', icon: 'none' });
        reject(err);
      }
    });
  });
}

function get(url, data = {}, options = {}) {
  return request({ method: 'GET', url, data, ...options });
}

function post(url, data = {}, options = {}) {
  return request({ method: 'POST', url, data, ...options });
}

function put(url, data = {}, options = {}) {
  return request({ method: 'PUT', url, data, ...options });
}

function del(url, data = {}, options = {}) {
  return request({ method: 'DELETE', url, data, ...options });
}

function uploadFile(filePath) {
  return new Promise((resolve, reject) => {
    const app = getApp();
    const token = app ? app.globalData.token : null;
    wx.uploadFile({
      url: BASE_URL + '/upload/images',
      filePath,
      name: 'images',
      header: {
        'Authorization': 'Bearer ' + token
      },
      success: (res) => {
        const data = JSON.parse(res.data);
        if (data.code === 0) {
          resolve(data.data.urls);
        } else {
          wx.showToast({ title: data.message || '上传失败', icon: 'none' });
          reject(data);
        }
      },
      fail: (err) => {
        wx.showToast({ title: '上传失败', icon: 'none' });
        reject(err);
      }
    });
  });
}

function uploadFiles(filePaths) {
  return Promise.all(filePaths.map(path => uploadFile(path)));
}

module.exports = {
  BASE_URL,
  request,
  get,
  post,
  put,
  del,
  uploadFile,
  uploadFiles
};
