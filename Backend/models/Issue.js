const mongoose = require('mongoose');

const IssueSchema = new mongoose.Schema({
  user: {
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
    required: true
  },
  category: {
    type: String,
    required: true
  },
  location: {
    address: {
      type: String,
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  status: {
    type: String,
    enum: ['reported', 'under_review', 'in_progress', 'resolved', 'closed'],
    default: 'reported'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  images: [
    {
      url: {
        type: String
      },
      publicId: {
        type: String
      }
    }
  ],
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  officialResponse: {
    type: String
  },
  officialResponseBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  officialResponseDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create a 2dsphere index for location.coordinates
IssueSchema.index({ "location.coordinates": "2dsphere" });

module.exports = mongoose.model('Issue', IssueSchema);