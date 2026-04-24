const mongoose = require('mongoose');

const operationLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  action: {
    type: String,
    required: true
  },
  targetType: {
    type: String
  },
  targetId: {
    type: String
  },
  detail: {
    type: String,
    default: ''
  },
  ip: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

operationLogSchema.index({ userId: 1 });
operationLogSchema.index({ action: 1 });
operationLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('OperationLog', operationLogSchema);
