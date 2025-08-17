const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorMiddleware');

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
], asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: errors.array()[0].msg
    });
  }

  const { name, email, password } = req.body;

  const userExists = await User.emailExists(email);
  if (userExists) {
    return res.status(409).json({
      success: false,
      error: 'User with this email already exists'
    });
  }


  const user = await User.create({
    name,
    email,
    password
  });

  if (user) {
    const token = generateToken(user._id);

    await user.updateLastLogin();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.profile,
        token
      }
    });
  } else {
    res.status(400).json({
      success: false,
      error: 'Invalid user data'
    });
  }
}));


router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: errors.array()[0].msg
    });
  }

  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Invalid email or password'
    });
  }

  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      error: 'Account is deactivated'
    });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      error: 'Invalid email or password'
    });
  }

  const token = generateToken(user._id);

  await user.updateLastLogin();

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: user.profile,
      token
    }
  });
}));

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', asyncHandler(async (req, res) => {
  
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized'
    });
  }

  res.json({
    success: true,
    data: {
      user: req.user.profile
    }
  });
}));

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', asyncHandler(async (req, res) => {
  
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
}));

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Private
router.post('/refresh', asyncHandler(async (req, res) => {
  
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized'
    });
  }

  const token = generateToken(req.user._id);

  res.json({
    success: true,
    data: {
      token
    }
  });
}));


router.post('/forgot-password', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: errors.array()[0].msg
    });
  }

  const { email } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  
  if (!user) {
    return res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = resetTokenExpiry;
  await user.save();

  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

  try {
    console.log('Password reset URL:', resetUrl);
    
    // const transporter = nodemailer.createTransporter({
    //   service: 'gmail',
    //   auth: {
    //     user: process.env.EMAIL_USER,
    //     pass: process.env.EMAIL_PASS
    //   }
    // });
    
    // await transporter.sendMail({
    //   to: user.email,
    //   subject: 'Password Reset Request',
    //   html: `
    //     <h1>Password Reset Request</h1>
    //     <p>You requested a password reset. Click the link below to reset your password:</p>
    //     <a href="${resetUrl}">Reset Password</a>
    //     <p>This link will expire in 10 minutes.</p>
    //     <p>If you didn't request this, please ignore this email.</p>
    //   `
    // });

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  } catch (error) {
    console.error('Email send error:', error);
    
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(500).json({
      success: false,
      error: 'Email could not be sent'
    });
  }
}));

router.post('/reset-password', [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: errors.array()[0].msg
    });
  }

  const { token, password } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      error: 'Invalid or expired reset token'
    });
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({
    success: true,
    message: 'Password has been reset successfully'
  });
}));

router.get('/reset-password/:token', asyncHandler(async (req, res) => {
  const { token } = req.params;

  // Find user by reset token and check if it's not expired
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      error: 'Invalid or expired reset token'
    });
  }

  res.json({
    success: true,
    message: 'Reset token is valid'
  });
}));


router.put('/profile', [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: errors.array()[0].msg
    });
  }

  const { name, avatar } = req.body;
  const updateData = {};

  if (name !== undefined) updateData.name = name;
  if (avatar !== undefined) updateData.avatar = avatar;

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No valid fields to update'
    });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.profile
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
}));


router.put('/password', [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: errors.array()[0].msg
    });
  }

  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update password'
    });
  }
}));

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: user.profile
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get profile'
    });
  }
}));

module.exports = router;

