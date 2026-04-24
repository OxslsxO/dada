const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  categoryName: {
    type: String,
    default: ''
  },
  images: {
    type: [String],
    default: []
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  signupDeadline: {
    type: Date
  },
  address: {
    type: String,
    default: ''
  },
  latitude: {
    type: Number,
    default: 0
  },
  longitude: {
    type: Number,
    default: 0
  },
  maxMembers: {
    type: Number,
    default: 0
  },
  currentMembers: {
    type: Number,
    default: 1
  },
  tags: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    default: 'draft'
  },
  cover: {
    type: String,
    default: ''
  },
  requirements: {
    type: String,
    default: ''
  },
  viewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

activitySchema.index({ creatorId: 1 });
activitySchema.index({ categoryId: 1 });
activitySchema.index({ status: 1 });
activitySchema.index({ startTime: 1 });
activitySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
