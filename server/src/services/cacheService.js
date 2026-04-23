const NodeCache = require('node-cache');

const activityListCache = new NodeCache({ stdTTL: 60, checkperiod: 120 });
const activityDetailCache = new NodeCache({ stdTTL: 120, checkperiod: 180 });
const hotActivitiesCache = new NodeCache({ stdTTL: 300, checkperiod: 300 });

const getListCacheKey = (params) => {
  return `list:${JSON.stringify(params)}`;
};

const getDetailCacheKey = (id) => {
  return `detail:${id}`;
};

const setListCache = (key, data) => {
  activityListCache.set(key, data);
};

const getListCache = (key) => {
  return activityListCache.get(key);
};

const setDetailCache = (id, data) => {
  activityDetailCache.set(id, data);
};

const getDetailCache = (id) => {
  return activityDetailCache.get(id);
};

const setHotCache = (key, data) => {
  hotActivitiesCache.set(key, data);
};

const getHotCache = (key) => {
  return hotActivitiesCache.get(key);
};

const invalidateActivityCache = (activityId) => {
  if (activityId) {
    activityDetailCache.del(activityId);
  }
  activityListCache.flushAll();
  hotActivitiesCache.flushAll();
};

module.exports = {
  getListCacheKey,
  getDetailCacheKey,
  setListCache,
  getListCache,
  setDetailCache,
  getDetailCache,
  setHotCache,
  getHotCache,
  invalidateActivityCache
};
