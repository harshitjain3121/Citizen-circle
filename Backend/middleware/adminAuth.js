const User = require('../models/User');

module.exports = async function(req, res, next) {
  try {
    const user = await User.findById(req.user.id);

    if (!user || (user.role !== 'admin' && user.role !== 'official')) {
      return res.status(403).json({ message: 'Access denied, admin privileges required' });
    }

    next();
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};