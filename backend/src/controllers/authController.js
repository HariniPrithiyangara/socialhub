const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
    return true;
  }
  return false;
};

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const { username, email, password } = req.body;

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }

    const existingUsername = await User.findOne({
      username: { $regex: new RegExp(`^${username}$`, 'i') },
    });
    if (existingUsername) {
      return res.status(409).json({ success: false, message: 'Username is already taken' });
    }

    const user = await User.create({ username, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    if (handleValidationErrors(req, res)) return;

    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/users
const getAllUsers = async (req, res, next) => {
  try {
    // Exclude current user from the list
    const users = await User.find({ _id: { $ne: req.user.id } })
      .select('username avatar bio')
      .limit(15);
    res.json({ success: true, users });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/notifications
const getNotifications = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('notifications')
      .populate('notifications.sender', 'username avatar');
    
    const notifications = user.notifications ? [...user.notifications].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    ) : [];
    
    res.json({ success: true, notifications });
  } catch (err) {
    next(err);
  }
};

// PUT /api/auth/notifications/read
const markNotificationsRead = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.notifications) {
      user.notifications.forEach((n) => {
        n.read = true;
      });
      await user.save();
    }
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, getAllUsers, getNotifications, markNotificationsRead };
