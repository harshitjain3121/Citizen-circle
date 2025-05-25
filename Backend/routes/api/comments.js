const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const commentController = require('../../controllers/commentController');
const auth = require('../../middleware/auth');

// @route   GET api/comments/issue/:issueId
// @desc    Get all comments for an issue
// @access  Public
router.get('/issue/:issueId', commentController.getCommentsByIssue);

// @route   POST api/comments/issue/:issueId
// @desc    Add a comment to an issue
// @access  Private
router.post(
  '/issue/:issueId',
  [auth, [check('text', 'Comment text is required').not().isEmpty()]],
  commentController.addComment
);

// @route   PUT api/comments/:id
// @desc    Update a comment
// @access  Private (only creator)
router.put(
  '/:id',
  [auth, [check('text', 'Comment text is required').not().isEmpty()]],
  commentController.updateComment
);

// @route   DELETE api/comments/:id
// @desc    Delete a comment
// @access  Private (only creator or admin)
router.delete('/:id', auth, commentController.deleteComment);

module.exports = router;