const { validationResult } = require('express-validator');
const Comment = require('../models/Comment');
const Issue = require('../models/Issue');
const User = require('../models/User');

// Get comments by issue
exports.getCommentsByIssue = async (req, res) => {
  try {
    const comments = await Comment.find({ issue: req.params.issueId })
      .sort({ createdAt: 1 })
      .populate('user', 'name avatar role');
    
    res.json(comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Add comment to an issue
exports.addComment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const issue = await Issue.findById(req.params.issueId);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const user = await User.findById(req.user.id).select('-password');
    const isOfficial = user.role === 'admin' || user.role === 'official';

    const newComment = new Comment({
      text: req.body.text,
      user: req.user.id,
      issue: req.params.issueId,
      isOfficial
    });

    const comment = await newComment.save();
    
    await comment.populate('user', 'name avatar role').execPopulate();
    
    res.json(comment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update comment
exports.updateComment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    comment.text = req.body.text;
    comment.updatedAt = Date.now();

    await comment.save();
    
    await comment.populate('user', 'name avatar role').execPopulate();
    
    res.json(comment);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Comment not found' });
    }
    res.status(500).send('Server error');
  }
};

// Delete comment
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.user.toString() !== req.user.id) {
      const user = await User.findById(req.user.id);
      if (user.role !== 'admin' && user.role !== 'official') {
        return res.status(401).json({ message: 'User not authorized' });
      }
    }

    await comment.remove();
    res.json({ message: 'Comment removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Comment not found' });
    }
    res.status(500).send('Server error');
  }
};