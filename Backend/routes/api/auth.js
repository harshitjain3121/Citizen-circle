const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../../controllers/authController');
const auth = require('../../middleware/auth');

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 })
  ],
  authController.registerUser
);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  authController.loginUser
);

// @route   GET api/auth
// @desc    Get authenticated user
// @access  Private
router.get('/', auth, authController.getAuthUser);

// @route   PUT api/auth/profile
// @desc    Update user profile
// @access  Private
router.put(
  '/profile',
  [auth, [check('name', 'Name is required').not().isEmpty()]],
  authController.updateProfile
);

// @route   PUT api/auth/password
// @desc    Change password
// @access  Private
router.put(
  '/password',
  [
    auth,
    [
      check('currentPassword', 'Current password is required').not().isEmpty(),
      check('newPassword', 'New password must be at least 6 characters').isLength({ min: 6 })
    ]
  ],
  authController.changePassword
);

module.exports = router;