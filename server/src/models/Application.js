const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  activityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity',
    required: true
  },
  applicantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    default: 'pending'
  },
  handlerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  handlerRemark: {
    type: String,
    default: ''
  },
  handledAt: {
    type: Date
  }
}, {
  timestamps: true
});

applicationSchema.index({ activityId: 1 });
applicationSchema.index({ applicantId: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ activityId: 1, applicantId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
