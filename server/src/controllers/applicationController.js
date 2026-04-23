const db = require('../models/db');
const logService = require('../services/logService');
const cacheService = require('../services/cacheService');
const { success, paginate } = require('../utils/response');
const { AppError } = require('../middleware/errorHandler');

const formatApplication = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    activityId: row.activity_id,
    applicantId: row.applicant_id,
    reason: row.reason,
    status: row.status,
    handlerId: row.handler_id,
    handlerRemark: row.handler_remark,
    handledAt: row.handled_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    applicant: row.applicant_nickname ? {
      id: row.applicant_id,
      nickname: row.applicant_nickname,
      avatarUrl: row.applicant_avatar
    } : null,
    activity: row.activity_title ? {
      id: row.activity_id,
      title: row.activity_title,
      cover: row.activity_cover
    } : null
  };
};

const formatActivity = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    creatorId: row.creator_id,
    title: row.title,
    description: row.description,
    categoryName: row.category_name,
    images: JSON.parse(row.images || '[]'),
    startTime: row.start_time,
    endTime: row.end_time,
    address: row.address,
    maxMembers: row.max_members,
    currentMembers: row.current_members,
    tags: JSON.parse(row.tags || '[]'),
    status: row.status,
    cover: row.cover,
    createdAt: row.created_at,
    creator: row.creator_nickname ? {
      id: row.creator_id,
      nickname: row.creator_nickname,
      avatarUrl: row.creator_avatar
    } : null
  };
};

const applyActivity = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { activityId } = req.params;
    const { reason } = req.body;

    const activity = db.get('SELECT * FROM activities WHERE id = ?', [activityId]);
    if (!activity) throw new AppError('活动不存在', 404);
    if (activity.status !== 'published') throw new AppError('该活动暂不可申请', 400);
    if (activity.creator_id === userId) throw new AppError('不能申请自己创建的活动', 400);

    if (activity.signup_deadline) {
      const deadline = new Date(activity.signup_deadline);
      if (deadline < new Date()) throw new AppError('报名已截止', 400);
    }

    if (activity.current_members >= activity.max_members) throw new AppError('活动人数已满', 400);

    const existingApp = db.get(
      'SELECT * FROM applications WHERE activity_id = ? AND applicant_id = ?',
      [activityId, userId]
    );

    if (existingApp) {
      if (existingApp.status === 'pending') throw new AppError('您已提交申请，请等待审核', 400);
      if (existingApp.status === 'approved') throw new AppError('您已加入该活动', 400);
      if (existingApp.status === 'rejected') throw new AppError('您的申请已被拒绝，无法再次申请', 400);
    }

    if (!reason || reason.trim().length === 0) throw new AppError('请填写申请理由', 400);

    const appId = 'app_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);

    db.run(`
      INSERT INTO applications (id, activity_id, applicant_id, reason)
      VALUES (?, ?, ?, ?)
    `, [appId, activityId, userId, reason.trim()]);

    const application = db.get(`
      SELECT ap.*, u.nickname as applicant_nickname, u.avatar_url as applicant_avatar,
             a.title as activity_title, a.cover as activity_cover
      FROM applications ap
      LEFT JOIN users u ON ap.applicant_id = u.id
      LEFT JOIN activities a ON ap.activity_id = a.id
      WHERE ap.id = ?
    `, [appId]);

    cacheService.invalidateActivityCache(activityId);

    logService.log({
      userId, action: 'apply_activity', targetType: 'application', targetId: appId,
      detail: `申请加入活动: ${activity.title}`, ip: req.ip
    });

    return success(res, formatApplication(application), '申请提交成功');
  } catch (err) {
    next(err);
  }
};

const getApplicationsByActivity = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { activityId } = req.params;
    const { page = 1, pageSize = 20, status } = req.query;
    const offset = (page - 1) * pageSize;

    const activity = db.get('SELECT * FROM activities WHERE id = ?', [activityId]);
    if (!activity) throw new AppError('活动不存在', 404);
    if (activity.creator_id !== userId) throw new AppError('无权查看此活动的申请列表', 403);

    let whereClause = 'WHERE ap.activity_id = ?';
    const params = [activityId];

    if (status) {
      whereClause += ' AND ap.status = ?';
      params.push(status);
    }

    const countResult = db.get(`SELECT COUNT(*) as total FROM applications ap ${whereClause}`, params);

    const list = db.all(`
      SELECT ap.*, u.nickname as applicant_nickname, u.avatar_url as applicant_avatar
      FROM applications ap
      LEFT JOIN users u ON ap.applicant_id = u.id
      ${whereClause}
      ORDER BY ap.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, Number(pageSize), Number(offset)]);

    return paginate(res, {
      list: list.map(formatApplication),
      total: countResult.total,
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

    const application = db.get('SELECT * FROM applications WHERE id = ?', [id]);
    if (!application) throw new AppError('申请不存在', 404);
    if (application.status !== 'pending') throw new AppError('该申请已处理', 400);

    const activity = db.get('SELECT * FROM activities WHERE id = ?', [application.activity_id]);
    if (!activity) throw new AppError('关联活动不存在', 404);
    if (activity.creator_id !== userId) throw new AppError('无权处理此申请', 403);

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    db.transaction(() => {
      db.run(`
        UPDATE applications
        SET status = ?, handler_id = ?, handler_remark = ?, handled_at = datetime('now', 'localtime'),
            updated_at = datetime('now', 'localtime')
        WHERE id = ?
      `, [newStatus, userId, remark || '', id]);

      if (newStatus === 'approved') {
        db.run(`
          UPDATE activities
          SET current_members = current_members + 1, updated_at = datetime('now', 'localtime')
          WHERE id = ?
        `, [application.activity_id]);
      }
    });

    cacheService.invalidateActivityCache(application.activity_id);

    logService.log({
      userId,
      action: action === 'approve' ? 'approve_application' : 'reject_application',
      targetType: 'application', targetId: id,
      detail: `${action === 'approve' ? '通过' : '拒绝'}申请: ${activity.title}`,
      ip: req.ip
    });

    const updated = db.get(`
      SELECT ap.*, u.nickname as applicant_nickname, u.avatar_url as applicant_avatar
      FROM applications ap
      LEFT JOIN users u ON ap.applicant_id = u.id
      WHERE ap.id = ?
    `, [id]);

    return success(res, formatApplication(updated), action === 'approve' ? '已通过申请' : '已拒绝申请');
  } catch (err) {
    next(err);
  }
};

const getMyApplications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, pageSize = 20, status } = req.query;
    const offset = (page - 1) * pageSize;

    let whereClause = 'WHERE ap.applicant_id = ?';
    const params = [userId];

    if (status) {
      whereClause += ' AND ap.status = ?';
      params.push(status);
    }

    const countResult = db.get(`SELECT COUNT(*) as total FROM applications ap ${whereClause}`, params);

    const list = db.all(`
      SELECT ap.*, a.title as activity_title, a.cover as activity_cover, a.status as activity_status
      FROM applications ap
      LEFT JOIN activities a ON ap.activity_id = a.id
      ${whereClause}
      ORDER BY ap.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, Number(pageSize), Number(offset)]);

    return paginate(res, {
      list: list.map(formatApplication),
      total: countResult.total,
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

    const application = db.get(
      "SELECT * FROM applications WHERE activity_id = ? AND applicant_id = ? AND status = 'approved'",
      [activityId, userId]
    );

    if (!application) throw new AppError('您未加入该活动', 400);

    const activity = db.get('SELECT * FROM activities WHERE id = ?', [activityId]);
    if (!activity) throw new AppError('活动不存在', 404);
    if (activity.status === 'ended') throw new AppError('活动已结束，无法退出', 400);

    db.transaction(() => {
      db.run(`
        UPDATE applications SET status = 'quit', updated_at = datetime('now', 'localtime')
        WHERE id = ?
      `, [application.id]);

      db.run(`
        UPDATE activities
        SET current_members = CASE WHEN current_members > 1 THEN current_members - 1 ELSE 1 END,
            updated_at = datetime('now', 'localtime')
        WHERE id = ?
      `, [activityId]);
    });

    cacheService.invalidateActivityCache(activityId);

    logService.log({
      userId, action: 'quit_activity', targetType: 'application', targetId: application.id,
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
    const offset = (page - 1) * pageSize;

    const countResult = db.get(`
      SELECT COUNT(*) as total
      FROM applications ap
      WHERE ap.applicant_id = ? AND ap.status = 'approved'
    `, [userId]);

    const list = db.all(`
      SELECT a.*, u.nickname as creator_nickname, u.avatar_url as creator_avatar
      FROM applications ap
      JOIN activities a ON ap.activity_id = a.id
      LEFT JOIN users u ON a.creator_id = u.id
      WHERE ap.applicant_id = ? AND ap.status = 'approved'
      ORDER BY ap.created_at DESC
      LIMIT ? OFFSET ?
    `, [userId, Number(pageSize), Number(offset)]);

    return paginate(res, {
      list: list.map(formatActivity),
      total: countResult.total,
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
