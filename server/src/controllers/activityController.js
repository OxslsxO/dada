const Activity = require('../models/Activity');
const User = require('../models/User');
const Application = require('../models/Application');
const OperationLog = require('../models/OperationLog');
const logService = require('../services/logService');
const cacheService = require('../services/cacheService');
const { success, paginate } = require('../utils/response');
const { AppError } = require('../middleware/errorHandler');

const formatActivity = (doc) => {
  if (!doc) return null;
  const activity = doc.toObject ? doc.toObject() : doc;
  return {
    id: activity._id,
    creatorId: activity.creatorId,
    title: activity.title,
    description: activity.description,
    categoryId: activity.categoryId,
    categoryName: activity.categoryName,
    images: activity.images,
    startTime: activity.startTime,
    endTime: activity.endTime,
    signupDeadline: activity.signupDeadline,
    address: activity.address,
    latitude: activity.latitude,
    longitude: activity.longitude,
    maxMembers: activity.maxMembers,
    currentMembers: activity.currentMembers,
    tags: activity.tags,
    status: activity.status,
    cover: activity.cover,
    requirements: activity.requirements,
    viewCount: activity.viewCount,
    createdAt: activity.createdAt,
    updatedAt: activity.updatedAt,
    creator: activity.creator ? {
      id: activity.creator._id,
      nickname: activity.creator.nickname,
      avatarUrl: activity.creator.avatarUrl
    } : null
  };
};

const createActivity = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      title, description, categoryId, categoryName,
      images, startTime, endTime, signupDeadline,
      address, latitude, longitude,
      maxMembers, tags, cover, requirements, status
    } = req.body;

    if (!title || title.trim().length === 0) throw new AppError('活动标题不能为空', 400);
    if (title.length > 50) throw new AppError('活动标题不能超过50个字符', 400);
    if (!description || description.trim().length === 0) throw new AppError('活动描述不能为空', 400);
    if (!maxMembers || maxMembers < 2) throw new AppError('参与人数至少为2人', 400);
    if (!startTime) throw new AppError('请选择活动开始时间', 400);
    if (!address) throw new AppError('请填写活动地址', 400);

    const validStatus = ['draft', 'published'];
    const activityStatus = validStatus.includes(status) ? status : 'draft';

    const activity = await Activity.create({
      creatorId: userId,
      title: title.trim(),
      description: description.trim(),
      categoryId,
      categoryName: categoryName || '',
      images: images || [],
      startTime,
      endTime,
      signupDeadline,
      address,
      latitude: latitude || 0,
      longitude: longitude || 0,
      maxMembers,
      currentMembers: 1,
      tags: tags || [],
      status: activityStatus,
      cover: cover || '',
      requirements: requirements || ''
    });

    await activity.populate('creatorId', 'nickname avatarUrl');
    const populated = activity.toObject();
    populated.creator = populated.creatorId;
    delete populated.creatorId;

    cacheService.invalidateActivityCache();

    await OperationLog.create({
      userId,
      action: 'create_activity',
      targetType: 'activity',
      targetId: activity._id,
      detail: `创建活动: ${title}`,
      ip: req.ip
    });

    return success(res, formatActivity(populated), activityStatus === 'draft' ? '活动已保存为草稿' : '活动发布成功');
  } catch (err) {
    next(err);
  }
};

const updateActivity = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const activity = await Activity.findById(id);
    if (!activity) throw new AppError('活动不存在', 404);
    if (activity.creatorId.toString() !== userId) throw new AppError('无权编辑此活动', 403);
    if (activity.status === 'ended') throw new AppError('已结束的活动不能编辑', 400);

    const {
      title, description, categoryId, categoryName,
      images, startTime, endTime, signupDeadline,
      address, latitude, longitude,
      maxMembers, tags, cover, requirements
    } = req.body;

    if (title !== undefined) {
      if (!title.trim()) throw new AppError('活动标题不能为空', 400);
      if (title.length > 50) throw new AppError('活动标题不能超过50个字符', 400);
      activity.title = title.trim();
    }
    if (description !== undefined) {
      if (!description.trim()) throw new AppError('活动描述不能为空', 400);
      activity.description = description.trim();
    }
    if (categoryId !== undefined) activity.categoryId = categoryId;
    if (categoryName !== undefined) activity.categoryName = categoryName;
    if (images !== undefined) activity.images = images;
    if (startTime !== undefined) activity.startTime = startTime;
    if (endTime !== undefined) activity.endTime = endTime;
    if (signupDeadline !== undefined) activity.signupDeadline = signupDeadline;
    if (address !== undefined) activity.address = address;
    if (latitude !== undefined) activity.latitude = latitude;
    if (longitude !== undefined) activity.longitude = longitude;
    if (maxMembers !== undefined) {
      if (maxMembers < activity.currentMembers) throw new AppError('最大人数不能小于当前参与人数', 400);
      activity.maxMembers = maxMembers;
    }
    if (tags !== undefined) activity.tags = tags;
    if (cover !== undefined) activity.cover = cover;
    if (requirements !== undefined) activity.requirements = requirements;

    await activity.save();
    await activity.populate('creatorId', 'nickname avatarUrl');

    const populated = activity.toObject();
    populated.creator = populated.creatorId;
    delete populated.creatorId;

    cacheService.invalidateActivityCache(id);

    await OperationLog.create({
      userId, action: 'update_activity', targetType: 'activity', targetId: id,
      detail: `更新活动: ${activity.title}`, ip: req.ip
    });

    return success(res, formatActivity(populated), '更新成功');
  } catch (err) {
    next(err);
  }
};

const publishActivity = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const activity = await Activity.findById(id);
    if (!activity) throw new AppError('活动不存在', 404);
    if (activity.creatorId.toString() !== userId) throw new AppError('无权操作此活动', 403);
    if (activity.status === 'published') throw new AppError('活动已发布', 400);
    if (activity.status === 'ended') throw new AppError('已结束的活动不能重新发布', 400);

    if (!activity.title || !activity.description || !activity.startTime || !activity.address) {
      throw new AppError('请完善活动信息后再发布', 400);
    }

    activity.status = 'published';
    await activity.save();

    cacheService.invalidateActivityCache(id);

    await OperationLog.create({ userId, action: 'publish_activity', targetType: 'activity', targetId: id, ip: req.ip });

    return success(res, null, '活动发布成功');
  } catch (err) {
    next(err);
  }
};

const deleteActivity = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const activity = await Activity.findById(id);
    if (!activity) throw new AppError('活动不存在', 404);
    if (activity.creatorId.toString() !== userId) throw new AppError('无权删除此活动', 403);

    const approvedCount = await Application.countDocuments({ activityId: id, status: 'approved' });
    if (approvedCount > 1) throw new AppError('已有成员加入的活动不能删除，请先结束活动', 400);

    await Application.deleteMany({ activityId: id });
    await Activity.findByIdAndDelete(id);

    cacheService.invalidateActivityCache(id);

    await OperationLog.create({
      userId, action: 'delete_activity', targetType: 'activity', targetId: id,
      detail: `删除活动: ${activity.title}`, ip: req.ip
    });

    return success(res, null, '活动已删除');
  } catch (err) {
    next(err);
  }
};

const getActivityDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;

    const cached = cacheService.getDetailCache(id);
    if (cached) {
      if (userId) await Activity.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });
      return success(res, { ...cached, hasApplied: null });
    }

    const activity = await Activity.findById(id).populate('creatorId', 'nickname avatarUrl');

    if (!activity) throw new AppError('活动不存在', 404);

    await Activity.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });

    const populated = activity.toObject();
    populated.creator = populated.creatorId;
    delete populated.creatorId;

    const formatted = formatActivity(populated);

    let hasApplied = false;
    let applicationStatus = null;
    if (userId) {
      const app = await Application.findOne({ activityId: id, applicantId: userId });
      if (app) {
        hasApplied = true;
        applicationStatus = app.status;
      }
    }

    cacheService.setDetailCache(id, formatted);

    return success(res, { ...formatted, hasApplied, applicationStatus });
  } catch (err) {
    next(err);
  }
};

const getActivityList = async (req, res, next) => {
  try {
    const {
      page = 1, pageSize = 10,
      category, status, keyword,
      location, sortBy = 'createdAt', sortOrder = 'desc',
      timeRange
    } = req.query;

    const cacheKey = cacheService.getListCacheKey(req.query);
    const cached = cacheService.getListCache(cacheKey);
    if (cached) {
      return paginate(res, { ...cached, page, pageSize }, '查询成功');
    }

    const query = { status: 'published' };

    if (category) {
      query.categoryName = category;
    }

    if (status && ['draft', 'published', 'ongoing', 'ended'].includes(status)) {
      query.status = status;
    }

    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { address: { $regex: keyword, $options: 'i' } }
      ];
    }

    if (location) {
      query.address = { $regex: location, $options: 'i' };
    }

    if (timeRange) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      switch (timeRange) {
        case 'today':
          query.startTime = {
            $gte: today,
            $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          };
          break;
        case 'tomorrow': {
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          const dayAfterTomorrow = new Date(tomorrow);
          dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
          query.startTime = { $gte: tomorrow, $lt: dayAfterTomorrow };
          break;
        }
        case 'thisWeek': {
          const weekEnd = new Date(now);
          weekEnd.setDate(weekEnd.getDate() + 7);
          query.startTime = { $gte: now, $lte: weekEnd };
          break;
        }
      }
    }

    const validSortColumns = ['createdAt', 'startTime', 'viewCount', 'currentMembers'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'createdAt';
    const sortDirection = sortOrder.toLowerCase() === 'asc' ? 1 : -1;

    const total = await Activity.countDocuments(query);

    const list = await Activity.find(query)
      .populate('creatorId', 'nickname avatarUrl')
      .sort({ [sortColumn]: sortDirection })
      .skip((page - 1) * pageSize)
      .limit(Number(pageSize));

    const formattedList = list.map(doc => {
      const obj = doc.toObject();
      obj.creator = obj.creatorId;
      delete obj.creatorId;
      return formatActivity(obj);
    });

    const result = { list: formattedList, total };
    cacheService.setListCache(cacheKey, result);

    return paginate(res, { ...result, page, pageSize });
  } catch (err) {
    next(err);
  }
};

const getHotActivities = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const cacheKey = `hot:${limit}`;
    const cached = cacheService.getHotCache(cacheKey);
    if (cached) return success(res, cached, '获取热门活动成功');

    const list = await Activity.find({ status: 'published' })
      .populate('creatorId', 'nickname avatarUrl')
      .limit(Number(limit));

    const formattedList = list.map(doc => {
      const obj = doc.toObject();
      obj.creator = obj.creatorId;
      delete obj.creatorId;
      return formatActivity(obj);
    }).sort((a, b) => {
      const ratioA = a.currentMembers / a.maxMembers;
      const ratioB = b.currentMembers / b.maxMembers;
      if (ratioB !== ratioA) return ratioB - ratioA;
      if (b.viewCount !== a.viewCount) return b.viewCount - a.viewCount;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    cacheService.setHotCache(cacheKey, formattedList);

    return success(res, formattedList, '获取热门活动成功');
  } catch (err) {
    next(err);
  }
};

const getMyActivities = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, pageSize = 10, status } = req.query;

    const query = { creatorId: userId };
    if (status) {
      query.status = status;
    }

    const total = await Activity.countDocuments(query);

    const list = await Activity.find(query)
      .populate('creatorId', 'nickname avatarUrl')
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(Number(pageSize));

    const formattedList = list.map(doc => {
      const obj = doc.toObject();
      obj.creator = obj.creatorId;
      delete obj.creatorId;
      return formatActivity(obj);
    });

    return paginate(res, {
      list: formattedList,
      total,
      page,
      pageSize
    });
  } catch (err) {
    next(err);
  }
};

const endActivity = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const activity = await Activity.findById(id);
    if (!activity) throw new AppError('活动不存在', 404);
    if (activity.creatorId.toString() !== userId) throw new AppError('无权操作此活动', 403);

    activity.status = 'ended';
    await activity.save();

    cacheService.invalidateActivityCache(id);

    await OperationLog.create({ userId, action: 'end_activity', targetType: 'activity', targetId: id, ip: req.ip });

    return success(res, null, '活动已结束');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createActivity,
  updateActivity,
  publishActivity,
  deleteActivity,
  getActivityDetail,
  getActivityList,
  getHotActivities,
  getMyActivities,
  endActivity
};
