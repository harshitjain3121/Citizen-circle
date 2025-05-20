const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const issueController = require('../../controllers/issueController');
const auth = require('../../middleware/auth');

// @route   GET api/issues
// @desc    Get all issues
// @access  Public
router.get('/', issueController.getAllIssues);

// @route   GET api/issues/:id
// @desc    Get issue by ID
// @access  Public
router.get('/:id', issueController.getIssueById);

// @route   POST api/issues
// @desc    Create a new issue
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
      check('location', 'Location is required').not().isEmpty(),
      check('category', 'Category is required').not().isEmpty()
    ]
  ],
  issueController.createIssue
);

// @route   PUT api/issues/:id
// @desc    Update an issue
// @access  Private (only creator)
router.put(
  '/:id',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty()
    ]
  ],
  issueController.updateIssue
);

// @route   DELETE api/issues/:id
// @desc    Delete an issue
// @access  Private (only creator or admin)
router.delete('/:id', auth, issueController.deleteIssue);

// @route   GET api/issues/user/:userId
// @desc    Get issues created by a specific user
// @access  Public
router.get('/user/:userId', issueController.getIssuesByUser);

// @route   GET api/issues/nearby
// @desc    Get issues near a location
// @access  Public
router.get('/nearby', issueController.getNearbyIssues);

// @route   POST api/issues/:id/image
// @desc    Upload image for an issue
// @access  Private
router.post('/:id/image', auth, issueController.uploadImage);

// @route   PUT api/issues/:id/status
// @desc    Update issue status
// @access  Private (admin only)
router.put('/:id/status', auth, issueController.updateIssueStatus);

module.exports = router;