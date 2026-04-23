const { Router } = require('express');
const router = Router();
const activityController = require('../controllers/activityController');
const { auth, optionalAuth } = require('../middleware/auth');
const { createLimiter } = require('../middleware/rateLimit');

router.post('/', auth, createLimiter, activityController.createActivity);
router.put('/:id', auth, activityController.updateActivity);
router.put('/:id/publish', auth, activityController.publishActivity);
router.put('/:id/end', auth, activityController.endActivity);
router.delete('/:id', auth, activityController.deleteActivity);
router.get('/my', auth, activityController.getMyActivities);
router.get('/hot', activityController.getHotActivities);
router.get('/list', optionalAuth, activityController.getActivityList);
router.get('/:id', optionalAuth, activityController.getActivityDetail);

module.exports = router;
