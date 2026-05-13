const BASE_URL = 'http://localhost:3000/api';
// const BASE_URL = 'https://intercounty-distastefully-shanelle.ngrok-free.dev/api';

function getToken() {
  const app = getApp();
  let token = app && app.globalData ? app.globalData.token : null;

  if (!token) {
    token = wx.getStorageSync('token');
    if (token && app && app.globalData) {
      app.globalData.token = token;
    }
  }

  return token;
}

function buildHeaders(extra = {}) {
  const token = getToken();
  const header = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    ...extra
  };

  if (token) {
    header.Authorization = 'Bearer ' + token;
  }

  return header;
}

function handleAuthExpired(reject, data = {}) {
  const app = getApp();
  if (app && app.logout) {
    app.logout();
  }

  wx.showToast({ title: '登录已过期，请重新登录', icon: 'none' });
  setTimeout(() => {
    wx.reLaunch({ url: '/pages/login/login' });
  }, 1500);

  reject({ ...data, isAuthError: true });
}

function request(options) {
  return new Promise((resolve, reject) => {
    if (options.showLoading !== false) {
      wx.showLoading({
        title: options.loadingText || '加载中...',
        mask: options.mask !== false
      });
    }

    wx.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: buildHeaders(options.header),
      success: (res) => {
        if (options.showLoading !== false) {
          wx.hideLoading();
        }

        if (res.statusCode === 200) {
          if (typeof res.data === 'string') {
            wx.showToast({ title: '接口返回异常，请检查 ngrok 服务', icon: 'none' });
            reject(res.data);
            return;
          }

          if (res.data.code === 0) {
            resolve(res.data.data);
          } else {
            wx.showToast({ title: res.data.message || '请求失败', icon: 'none' });
            reject(res.data);
          }
          return;
        }

        if (res.statusCode === 401) {
          if (options.skipAuthRedirect) {
            reject({ ...(res.data || {}), isAuthError: true });
          } else {
            handleAuthExpired(reject, res.data || {});
          }
          return;
        }

        if (res.statusCode === 403) {
          wx.showToast({ title: '权限不足', icon: 'none' });
          reject(res.data);
          return;
        }

        wx.showToast({
          title: (res.data && res.data.message) || '请求失败',
          icon: 'none'
        });
        reject(res.data || res);
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
    wx.uploadFile({
      url: BASE_URL + '/upload/images',
      filePath,
      name: 'images',
      header: buildHeaders({ 'Content-Type': 'multipart/form-data' }),
      success: (res) => {
        let data;
        try {
          data = JSON.parse(res.data);
        } catch (err) {
          wx.showToast({ title: '接口返回异常，请检查 ngrok 服务', icon: 'none' });
          reject(res.data);
          return;
        }

        if (data.code === 0) {
          resolve(data.data.urls);
        } else if (data.code === 401) {
          handleAuthExpired(reject, data);
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
