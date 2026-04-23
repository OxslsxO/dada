const { Router } = require('express');
const router = Router();
const applicationController = require('../controllers/applicationController');
const { auth } = require('../middleware/auth');
const { applyLimiter } = require('../middleware/rateLimit');

router.post('/:activityId/apply', auth, applyLimiter, applicationController.applyActivity);
router.get('/:activityId/applications', auth, applicationController.getApplicationsByActivity);
router.put('/:id/handle', auth, applicationController.handleApplication);
router.get('/my', auth, applicationController.getMyApplications);
router.get('/joined', auth, applicationController.getJoinedActivities);
router.post('/:activityId/quit', auth, applicationController.quitActivity);

module.exports = router;
