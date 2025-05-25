const express = require('express');
const router = express.Router();
const voteController = require('../../controllers/voteController');
const auth = require('../../middleware/auth');

// @route   POST api/votes/issue/:issueId
// @desc    Vote on an issue
// @access  Private
router.post('/issue/:issueId', auth, voteController.voteOnIssue);

// @route   GET api/votes/issue/:issueId
// @desc    Get all votes for an issue
// @access  Public
router.get('/issue/:issueId', voteController.getVotesByIssue);

// @route   GET api/votes/user
// @desc    Get issues voted by the authenticated user
// @access  Private
router.get('/user', auth, voteController.getUserVotes);

module.exports = router;