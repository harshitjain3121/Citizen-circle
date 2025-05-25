const express = require('express');
const router = express.Router();

const authRoutes = require('./api/auth');
const issueRoutes = require('./api/issues');
const commentRoutes = require('./api/comments');
const voteRoutes = require('./api/votes');
const adminRoutes = require('./api/admin');

router.use('/auth', authRoutes);
router.use('/issues', issueRoutes);
router.use('/comments', commentRoutes);
router.use('/votes', voteRoutes);
router.use('/admin', adminRoutes);

module.exports = router;