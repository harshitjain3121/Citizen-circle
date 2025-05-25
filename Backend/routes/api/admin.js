const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/authController');
const auth = require('../../middleware/auth');
const adminAuth = require('../../middleware/adminAuth');

// @route   GET api/admin/users
// @desc    Get all users
// @access  Private (admin only)
router.get('/users', [auth, adminAuth], adminController.getAllUsers);

// @route   PUT api/admin/users/:id/role
// @desc    Update user role
// @access  Private (admin only)
router.put('/users/:id/role', [auth, adminAuth], adminController.updateUserRole);

// @route   GET api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private (admin only)
router.get('/dashboard', [auth, adminAuth], adminController.getDashboardData);

module.exports = router;