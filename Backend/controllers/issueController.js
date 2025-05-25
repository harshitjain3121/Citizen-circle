const { validationResult } = require('express-validator');
const Issue = require('../models/Issue');
const User = require('../models/User');
const cloudinary = require('cloudinary').v2;
const config = require('../config/default');

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret
});

// Get all issues
exports.getAllIssues = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const category = req.query.category;
    const status = req.query.status;
    const searchTerm = req.query.search;
    
    let query = {};
    
    if (category) query.category = category;
    if (status) query.status = status;
    if (searchTerm) {
      query.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    const issues = await Issue.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name avatar');

    const total = await Issue.countDocuments(query);

    res.json({
      issues,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get issue by ID
exports.getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('user', 'name avatar')
      .populate('officialResponseBy', 'name role');

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    res.json(issue);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Issue not found' });
    }
    res.status(500).send('Server error');
  }
};

// Create new issue
exports.createIssue = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, category, location, priority } = req.body;

    const newIssue = new Issue({
      user: req.user.id,
      title,
      description,
      category,
      location: {
        address: location.address,
        coordinates: location.coordinates
      },
      priority: priority || 'medium'
    });

    const issue = await newIssue.save();
    res.json(issue);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update issue
exports.updateIssue = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    if (issue.user.toString() !== req.user.id) {
      const user = await User.findById(req.user.id);
      if (user.role !== 'admin' && user.role !== 'official') {
        return res.status(401).json({ message: 'User not authorized' });
      }
    }

    const { title, description, category, priority } = req.body;

    issue.title = title || issue.title;
    issue.description = description || issue.description;
    issue.category = category || issue.category;
    issue.priority = priority || issue.priority;
    issue.updatedAt = Date.now();

    await issue.save();
    res.json(issue);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Issue not found' });
    }
    res.status(500).send('Server error');
  }
};

// Delete issue
exports.deleteIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    if (issue.user.toString() !== req.user.id) {
      const user = await User.findById(req.user.id);
      if (user.role !== 'admin' && user.role !== 'official') {
        return res.status(401).json({ message: 'User not authorized' });
      }
    }

    if (issue.images && issue.images.length > 0) {
      for (const image of issue.images) {
        if (image.publicId) {
          await cloudinary.uploader.destroy(image.publicId);
        }
      }
    }

    await issue.remove();
    res.json({ message: 'Issue removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Issue not found' });
    }
    res.status(500).send('Server error');
  }
};

// Get issues by user
exports.getIssuesByUser = async (req, res) => {
  try {
    const issues = await Issue.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .populate('user', 'name avatar');
    
    res.json(issues);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).send('Server error');
  }
};

// Get nearby issues
exports.getNearbyIssues = async (req, res) => {
  try {
    const { lng, lat, radius = 5000 } = req.query; // radius in meters, default 5km

    if (!lng || !lat) {
      return res.status(400).json({ message: 'Longitude and latitude are required' });
    }

    const issues = await Issue.find({
      'location.coordinates': {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius)
        }
      }
    })
      .sort({ createdAt: -1 })
      .populate('user', 'name avatar');

    res.json(issues);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Upload image for an issue
exports.uploadImage = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    if (issue.user.toString() !== req.user.id) {
      const user = await User.findById(req.user.id);
      if (user.role !== 'admin' && user.role !== 'official') {
        return res.status(401).json({ message: 'User not authorized' });
      }
    }

    if (!req.body.image) {
      return res.status(400).json({ message: 'No image provided' });
    }

    const result = await cloudinary.uploader.upload(req.body.image, {
      folder: 'citizencircle',
      resource_type: 'auto'
    });

    issue.images.push({
      url: result.secure_url,
      publicId: result.public_id
    });

    await issue.save();
    res.json(issue);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update issue status
exports.updateIssueStatus = async (req, res) => {
  try {
    const { status, officialResponse } = req.body;

    if (!['reported', 'under_review', 'in_progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const user = await User.findById(req.user.id);
    if (user.role !== 'admin' && user.role !== 'official') {
      return res.status(401).json({ message: 'User not authorized' });
    }

    issue.status = status;
    
    if (officialResponse) {
      issue.officialResponse = officialResponse;
      issue.officialResponseBy = req.user.id;
      issue.officialResponseDate = Date.now();
    }
    
    issue.updatedAt = Date.now();

    await issue.save();
    res.json(issue);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Issue not found' });
    }
    res.status(500).send('Server error');
  }
};