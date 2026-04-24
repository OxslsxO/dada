const Application = require('../models/Application');
const Activity = require('../models/Activity');
const User = require('../models/User');
const OperationLog = require('../models/OperationLog');
const logService = require('../services/logService');
const cacheService = require('../services/cacheService');
const { success, paginate } = require('../utils/response');
const { AppError } = require('../middleware/errorHandler');

const formatApplication = (doc) => {
  if (!doc) return null;
  const app = doc.toObject ? doc.toObject() : doc;
  return {
    id: app._id,
    activityId: app.activityId,
    applicantId: app.applicantId,
    reason: app.reason,
    status: app.status,
    handlerId: app.handlerId,
    handlerRemark: app.handlerRemark,
    handledAt: app.handledAt,
    createdAt: app.createdAt,
    updatedAt: app.updatedAt,
    applicant: app.applicant ? {
      id: app.applicant._id,
      nickname: app.applicant.nickname,
      avatarUrl: app.applicant.avatarUrl
    } : null,
    activity: app.activity ? {
      id: app.activity._id,
      title: app.activity.title,
      cover: app.activity.cover
    } : null
  };
};

const formatActivity = (doc) => {
  if (!doc) return null;
  const activity = doc.toObject ? doc.toObject() : doc;
  return {
    id: activity._id,
    creatorId: activity.creatorId,
    title: activity.title,
    description: activity.description,
    categoryName: activity.categoryName,
    images: activity.images,
    startTime: activity.startTime,
    endTime: activity.endTime,
    address: activity.address,
    maxMembers: activity.maxMembers,
    currentMembers: activity.currentMembers,
    tags: activity.tags,
    status: activity.status,
    cover: activity.cover,
    createdAt: activity.createdAt,
    creator: activity.creator ? {
      id: activity.creator._id,
      nickname: activity.creator.nickname,
      avatarUrl: activity.creator.avatarUrl
    } : null
  };
};

const applyActivity = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { activityId } = req.params;
    const { reason } = req.body;

    const activity = await Activity.findById(activityId);
    if (!activity) throw new AppError('活动不存在', 404);
    if (activity.status !== 'published') throw new AppError('该活动暂不可申请', 400);
    if (activity.creatorId.toString() === userId) throw new AppError('不能申请自己创建的活动', 400);

    if (activity.signupDeadline) {
      const deadline = new Date(activity.signupDeadline);
      if (deadline < new Date()) throw new AppError('报名已截止', 400);
    }

    if (activity.currentMembers >= activity.maxMembers) throw new AppError('活动人数已满', 400);

    const existingApp = await Application.findOne({ activityId, applicantId: userId });

    if (existingApp) {
      if (existingApp.status === 'pending') throw new AppError('您已提交申请，请等待审核', 400);
      if (existingApp.status === 'approved') throw new AppError('您已加入该活动', 400);
      if (existingApp.status === 'rejected') throw new AppError('您的申请已被拒绝，无法再次申请', 400);
    }

    if (!reason || reason.trim().length === 0) throw new AppError('请填写申请理由', 400);

    const application = await Application.create({
      activityId,
      applicantId: userId,
      reason: reason.trim()
    });

    await application.populate('applicantId', 'nickname avatarUrl');
    await application.populate('activityId', 'title cover');

    const populated = application.toObject();
    populated.applicant = populated.applicantId;
    populated.activity = populated.activityId;
    delete populated.applicantId;
    delete populated.activityId;

    cacheService.invalidateActivityCache(activityId);

    await OperationLog.create({
      userId, action: 'apply_activity', targetType: 'application', targetId: application._id,
      detail: `申请加入活动: ${activity.title}`, ip: req.ip
    });

    return success(res, formatApplication(populated), '申请提交成功');
  } catch (err) {
    next(err);
  }
};

const getApplicationsByActivity = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { activityId } = req.params;
    const { page = 1, pageSize = 20, status } = req.query;

    const activity = await Activity.findById(activityId);
    if (!activity) throw new AppError('活动不存在', 404);
    if (activity.creatorId.toString() !== userId) throw new AppError('无权查看此活动的申请列表', 403);

    const query = { activityId };
    if (status) {
      query.status = status;
    }

    const total = await Application.countDocuments(query);

    const list = await Application.find(query)
      .populate('applicantId', 'nickname avatarUrl')
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(Number(pageSize));

    const formattedList = list.map(doc => {
      const obj = doc.toObject();
      obj.applicant = obj.applicantId;
      delete obj.applicantId;
      return formatApplication(obj);
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

const handleApplication = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { action, remark } = req.body;

    if (!['approve', 'reject'].includes(action)) throw new AppError('操作类型无效', 400);

    const application = await Application.findById(id);
    if (!application) throw new AppError('申请不存在', 404);
    if (application.status !== 'pending') throw new AppError('该申请已处理', 400);

    const activity = await Activity.findById(application.activityId);
    if (!activity) throw new AppError('关联活动不存在', 404);
    if (activity.creatorId.toString() !== userId) throw new AppError('无权处理此申请', 403);

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    application.status = newStatus;
    application.handlerId = userId;
    application.handlerRemark = remark || '';
    application.handledAt = new Date();
    await application.save();

    if (newStatus === 'approved') {
      activity.currentMembers += 1;
      await activity.save();
    }

    cacheService.invalidateActivityCache(application.activityId);

    await OperationLog.create({
      userId,
      action: action === 'approve' ? 'approve_application' : 'reject_application',
      targetType: 'application', targetId: id,
      detail: `${action === 'approve' ? '通过' : '拒绝'}申请: ${activity.title}`,
      ip: req.ip
    });

    await application.populate('applicantId', 'nickname avatarUrl');

    const populated = application.toObject();
    populated.applicant = populated.applicantId;
    delete populated.applicantId;

    return success(res, formatApplication(populated), action === 'approve' ? '已通过申请' : '已拒绝申请');
  } catch (err) {
    next(err);
  }
};

const getMyApplications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, pageSize = 20, status } = req.query;

    const query = { applicantId: userId };
    if (status) {
      query.status = status;
    }

    const total = await Application.countDocuments(query);

    const list = await Application.find(query)
      .populate('activityId', 'title cover status')
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(Number(pageSize));

    const formattedList = list.map(doc => {
      const obj = doc.toObject();
      obj.activity = obj.activityId;
      delete obj.activityId;
      return formatApplication(obj);
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

const quitActivity = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { activityId } = req.params;

    const application = await Application.findOne({ activityId, applicantId: userId, status: 'approved' });

    if (!application) throw new AppError('您未加入该活动', 400);

    const activity = await Activity.findById(activityId);
    if (!activity) throw new AppError('活动不存在', 404);
    if (activity.status === 'ended') throw new AppError('活动已结束，无法退出', 400);

    application.status = 'quit';
    await application.save();

    activity.currentMembers = Math.max(1, activity.currentMembers - 1);
    await activity.save();

    cacheService.invalidateActivityCache(activityId);

    await OperationLog.create({
      userId, action: 'quit_activity', targetType: 'application', targetId: application._id,
      detail: `退出活动: ${activity.title}`, ip: req.ip
    });

    return success(res, null, '已退出活动');
  } catch (err) {
    next(err);
  }
};

const getJoinedActivities = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, pageSize = 10 } = req.query;

    const approvedApps = await Application.find({
      applicantId: userId,
      status: 'approved'
    }).select('activityId');

    const activityIds = approvedApps.map(app => app.activityId);

    const total = activityIds.length;

    const list = await Activity.find({ _id: { $in: activityIds } })
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

module.exports = {
  applyActivity,
  getApplicationsByActivity,
  handleApplication,
  getMyApplications,
  quitActivity,
  getJoinedActivities
};
