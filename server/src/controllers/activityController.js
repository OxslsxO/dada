const db = require('../models/db');
const logService = require('../services/logService');
const cacheService = require('../services/cacheService');
const { success, paginate } = require('../utils/response');
const { AppError } = require('../middleware/errorHandler');

const formatActivity = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    creatorId: row.creator_id,
    title: row.title,
    description: row.description,
    categoryId: row.category_id,
    categoryName: row.category_name,
    images: JSON.parse(row.images || '[]'),
    startTime: row.start_time,
    endTime: row.end_time,
    signupDeadline: row.signup_deadline,
    address: row.address,
    latitude: row.latitude,
    longitude: row.longitude,
    maxMembers: row.max_members,
    currentMembers: row.current_members,
    tags: JSON.parse(row.tags || '[]'),
    status: row.status,
    cover: row.cover,
    requirements: row.requirements,
    viewCount: row.view_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    creator: row.creator_nickname ? {
      id: row.creator_id,
      nickname: row.creator_nickname,
      avatarUrl: row.creator_avatar
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

    const activityId = 'act_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);

    db.run(`
      INSERT INTO activities (
        id, creator_id, title, description, category_id, category_name,
        images, start_time, end_time, signup_deadline,
        address, latitude, longitude,
        max_members, current_members, tags, status, cover, requirements
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      activityId, userId, title.trim(), description.trim(),
      categoryId || null, categoryName || '',
      JSON.stringify(images || []), startTime, endTime || null, signupDeadline || null,
      address, latitude || 0, longitude || 0,
      maxMembers, 1, JSON.stringify(tags || []),
      activityStatus, cover || '', requirements || ''
    ]);

    const activity = db.get(`
      SELECT a.*, u.nickname as creator_nickname, u.avatar_url as creator_avatar
      FROM activities a
      LEFT JOIN users u ON a.creator_id = u.id
      WHERE a.id = ?
    `, [activityId]);

    cacheService.invalidateActivityCache();

    logService.log({
      userId,
      action: 'create_activity',
      targetType: 'activity',
      targetId: activityId,
      detail: `创建活动: ${title}`,
      ip: req.ip
    });

    return success(res, formatActivity(activity), activityStatus === 'draft' ? '活动已保存为草稿' : '活动发布成功');
  } catch (err) {
    next(err);
  }
};

const updateActivity = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const activity = db.get('SELECT * FROM activities WHERE id = ?', [id]);
    if (!activity) throw new AppError('活动不存在', 404);
    if (activity.creator_id !== userId) throw new AppError('无权编辑此活动', 403);
    if (activity.status === 'ended') throw new AppError('已结束的活动不能编辑', 400);

    const {
      title, description, categoryId, categoryName,
      images, startTime, endTime, signupDeadline,
      address, latitude, longitude,
      maxMembers, tags, cover, requirements
    } = req.body;

    const updates = [];
    const values = [];

    if (title !== undefined) {
      if (!title.trim()) throw new AppError('活动标题不能为空', 400);
      if (title.length > 50) throw new AppError('活动标题不能超过50个字符', 400);
      updates.push('title = ?'); values.push(title.trim());
    }
    if (description !== undefined) {
      if (!description.trim()) throw new AppError('活动描述不能为空', 400);
      updates.push('description = ?'); values.push(description.trim());
    }
    if (categoryId !== undefined) { updates.push('category_id = ?'); values.push(categoryId); }
    if (categoryName !== undefined) { updates.push('category_name = ?'); values.push(categoryName); }
    if (images !== undefined) { updates.push('images = ?'); values.push(JSON.stringify(images)); }
    if (startTime !== undefined) { updates.push('start_time = ?'); values.push(startTime); }
    if (endTime !== undefined) { updates.push('end_time = ?'); values.push(endTime); }
    if (signupDeadline !== undefined) { updates.push('signup_deadline = ?'); values.push(signupDeadline); }
    if (address !== undefined) { updates.push('address = ?'); values.push(address); }
    if (latitude !== undefined) { updates.push('latitude = ?'); values.push(latitude); }
    if (longitude !== undefined) { updates.push('longitude = ?'); values.push(longitude); }
    if (maxMembers !== undefined) {
      if (maxMembers < activity.current_members) throw new AppError('最大人数不能小于当前参与人数', 400);
      updates.push('max_members = ?'); values.push(maxMembers);
    }
    if (tags !== undefined) { updates.push('tags = ?'); values.push(JSON.stringify(tags)); }
    if (cover !== undefined) { updates.push('cover = ?'); values.push(cover); }
    if (requirements !== undefined) { updates.push('requirements = ?'); values.push(requirements); }

    if (updates.length === 0) throw new AppError('没有需要更新的字段', 400);

    updates.push("updated_at = datetime('now', 'localtime')");
    values.push(id);

    db.run(`UPDATE activities SET ${updates.join(', ')} WHERE id = ?`, values);

    const updated = db.get(`
      SELECT a.*, u.nickname as creator_nickname, u.avatar_url as creator_avatar
      FROM activities a
      LEFT JOIN users u ON a.creator_id = u.id
      WHERE a.id = ?
    `, [id]);

    cacheService.invalidateActivityCache(id);

    logService.log({
      userId, action: 'update_activity', targetType: 'activity', targetId: id,
      detail: `更新活动: ${updated.title}`, ip: req.ip
    });

    return success(res, formatActivity(updated), '更新成功');
  } catch (err) {
    next(err);
  }
};

const publishActivity = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const activity = db.get('SELECT * FROM activities WHERE id = ?', [id]);
    if (!activity) throw new AppError('活动不存在', 404);
    if (activity.creator_id !== userId) throw new AppError('无权操作此活动', 403);
    if (activity.status === 'published') throw new AppError('活动已发布', 400);
    if (activity.status === 'ended') throw new AppError('已结束的活动不能重新发布', 400);

    if (!activity.title || !activity.description || !activity.start_time || !activity.address) {
      throw new AppError('请完善活动信息后再发布', 400);
    }

    db.run(`
      UPDATE activities SET status = 'published', updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `, [id]);

    cacheService.invalidateActivityCache(id);

    logService.log({ userId, action: 'publish_activity', targetType: 'activity', targetId: id, ip: req.ip });

    return success(res, null, '活动发布成功');
  } catch (err) {
    next(err);
  }
};

const deleteActivity = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const activity = db.get('SELECT * FROM activities WHERE id = ?', [id]);
    if (!activity) throw new AppError('活动不存在', 404);
    if (activity.creator_id !== userId) throw new AppError('无权删除此活动', 403);

    const approvedCount = db.get("SELECT COUNT(*) as count FROM applications WHERE activity_id = ? AND status = 'approved'", [id]).count;
    if (approvedCount > 1) throw new AppError('已有成员加入的活动不能删除，请先结束活动', 400);

    db.transaction(() => {
      db.run('DELETE FROM applications WHERE activity_id = ?', [id]);
      db.run('DELETE FROM activities WHERE id = ?', [id]);
    });

    cacheService.invalidateActivityCache(id);

    logService.log({
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
      if (userId) db.run('UPDATE activities SET view_count = view_count + 1 WHERE id = ?', [id]);
      return success(res, { ...cached, hasApplied: null });
    }

    const activity = db.get(`
      SELECT a.*, u.nickname as creator_nickname, u.avatar_url as creator_avatar
      FROM activities a
      LEFT JOIN users u ON a.creator_id = u.id
      WHERE a.id = ?
    `, [id]);

    if (!activity) throw new AppError('活动不存在', 404);

    db.run('UPDATE activities SET view_count = view_count + 1 WHERE id = ?', [id]);

    const formatted = formatActivity(activity);

    let hasApplied = false;
    let applicationStatus = null;
    if (userId) {
      const app = db.get('SELECT status FROM applications WHERE activity_id = ? AND applicant_id = ?', [id, userId]);
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
      location, sortBy = 'created_at', sortOrder = 'DESC',
      timeRange
    } = req.query;

    const offset = (page - 1) * pageSize;

    const cacheKey = cacheService.getListCacheKey(req.query);
    const cached = cacheService.getListCache(cacheKey);
    if (cached) {
      return paginate(res, { ...cached, page, pageSize }, '查询成功');
    }

    let whereClause = "WHERE a.status = 'published'";
    const params = [];

    if (category) {
      whereClause += ' AND a.category_name = ?';
      params.push(category);
    }

    if (status && ['draft', 'published', 'ongoing', 'ended'].includes(status)) {
      whereClause += ' AND a.status = ?';
      params.push(status);
    }

    if (keyword) {
      whereClause += ' AND (a.title LIKE ? OR a.description LIKE ? OR a.address LIKE ?)';
      const likeKeyword = `%${keyword}%`;
      params.push(likeKeyword, likeKeyword, likeKeyword);
    }

    if (location) {
      whereClause += ' AND a.address LIKE ?';
      params.push(`%${location}%`);
    }

    if (timeRange) {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      switch (timeRange) {
        case 'today':
          whereClause += " AND date(a.start_time) = date(?)";
          params.push(today);
          break;
        case 'tomorrow': {
          const tomorrow = new Date(now);
          tomorrow.setDate(tomorrow.getDate() + 1);
          whereClause += " AND date(a.start_time) = date(?)";
          params.push(tomorrow.toISOString().split('T')[0]);
          break;
        }
        case 'thisWeek': {
          const weekEnd = new Date(now);
          weekEnd.setDate(weekEnd.getDate() + 7);
          whereClause += " AND a.start_time >= ? AND a.start_time <= ?";
          params.push(now.toISOString(), weekEnd.toISOString());
          break;
        }
      }
    }

    const validSortColumns = ['created_at', 'start_time', 'view_count', 'current_members'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const sortDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const countResult = db.get(`SELECT COUNT(*) as total FROM activities a ${whereClause}`, params);

    const list = db.all(`
      SELECT a.*, u.nickname as creator_nickname, u.avatar_url as creator_avatar
      FROM activities a
      LEFT JOIN users u ON a.creator_id = u.id
      ${whereClause}
      ORDER BY a.${sortColumn} ${sortDirection}
      LIMIT ? OFFSET ?
    `, [...params, Number(pageSize), Number(offset)]);

    const formattedList = list.map(formatActivity);

    const result = { list: formattedList, total: countResult.total };
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

    const list = db.all(`
      SELECT a.*, u.nickname as creator_nickname, u.avatar_url as creator_avatar
      FROM activities a
      LEFT JOIN users u ON a.creator_id = u.id
      WHERE a.status = 'published'
      ORDER BY (a.current_members * 1.0 / a.max_members) DESC, a.view_count DESC, a.created_at DESC
      LIMIT ?
    `, [Number(limit)]);

    const formattedList = list.map(formatActivity);
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
    const offset = (page - 1) * pageSize;

    let whereClause = 'WHERE a.creator_id = ?';
    const params = [userId];

    if (status) {
      whereClause += ' AND a.status = ?';
      params.push(status);
    }

    const countResult = db.get(`SELECT COUNT(*) as total FROM activities a ${whereClause}`, params);

    const list = db.all(`
      SELECT a.*, u.nickname as creator_nickname, u.avatar_url as creator_avatar
      FROM activities a
      LEFT JOIN users u ON a.creator_id = u.id
      ${whereClause}
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, Number(pageSize), Number(offset)]);

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

const endActivity = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const activity = db.get('SELECT * FROM activities WHERE id = ?', [id]);
    if (!activity) throw new AppError('活动不存在', 404);
    if (activity.creator_id !== userId) throw new AppError('无权操作此活动', 403);

    db.run(`
      UPDATE activities SET status = 'ended', updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `, [id]);

    cacheService.invalidateActivityCache(id);

    logService.log({ userId, action: 'end_activity', targetType: 'activity', targetId: id, ip: req.ip });

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
