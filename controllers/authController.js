const User = require('../models/user.model');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const { sendAppointmentEmail } = require('../utils/mailer'); // reuse your mailer.js

const authController = {
  getLogin: (req, res) => {
    res.render('login');
  },

  getRegister: (req, res) => {
    res.render('register');
  },

  postRegister: async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        errors.array().forEach(error => {
          req.flash('error', error.msg);
        });
        return res.render('register', {
          email: req.body.email,
          messages: req.flash(),
        });
      }

      const { firstName, middleName, lastName, email, password } = req.body;
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        req.flash('error', 'Email already registered.');
        return res.redirect('/auth/register');
      }

      const user = new User({
        firstName,
        middleName,
        lastName,
        email,
        password
      });

      if (req.file) {
        user.profileImage = req.file.filename;
      }

      user.verificationToken = crypto.randomBytes(32).toString('hex');
      user.isVerified = false;
      await user.save();

      // Build verification link (use BASE_URL from env)
      const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
      const verifyUrl = `${baseUrl}/auth/verify-email/${user.verificationToken}`;

      // Try sending email but don't block registration
      try {
        await sendAppointmentEmail(
          user.email,
          'Verify your email',
          `Click the link to verify your account: ${verifyUrl}`
        );
        console.log(`Verification email sent to ${user.email}`);
      } catch (emailErr) {
        console.error("Email send failed:", emailErr.message);
      }

      req.flash('success', 'Registered successfully. Check your email to verify.');
      res.redirect('/auth/login');
    } catch (err) {
      next(err);
    }
  },

  verifyEmail: async (req, res) => {
    try {
      const user = await User.findOne({ verificationToken: req.params.token });
      if (!user) {
        req.flash('error', 'Invalid or expired verification token.');
        return res.redirect('/auth/login');
      }

      user.isVerified = true;
      user.verificationToken = undefined;
      await user.save();

      req.flash('success', 'Email verified. You can now log in.');
      res.redirect('/auth/login');
    } catch (err) {
      res.status(500).send('Server error');
    }
  },

  logout: (req, res, next) => {
    req.logout(err => {
      if (err) return next(err);
      res.redirect('/');
    });
  },

  getForgotPassword: (req, res) => {
    res.render('forgot-password');
  },

  postForgotPassword: async (req, res) => {
    try {
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        req.flash('error', 'Email not found.');
        return res.redirect('/auth/forgot-password');
      }

      user.resetToken = crypto.randomBytes(32).toString('hex');
      user.resetTokenExpire = Date.now() + 3600000; // 1 hour
      await user.save();

      const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
      const resetUrl = `${baseUrl}/auth/reset-password/${user.resetToken}`;

      try {
        await sendAppointmentEmail(
          user.email,
          'Reset Password',
          `Click the link to reset your password: ${resetUrl}`
        );
        console.log(`Password reset email sent to ${user.email}`);
      } catch (emailErr) {
        console.error("Reset email send failed:", emailErr.message);
      }

      req.flash('success', 'Reset link sent to your email.');
      res.redirect('/auth/login');
    } catch (err) {
      res.status(500).send('Server error');
    }
  },

  getResetPassword: async (req, res) => {
    const user = await User.findOne({
      resetToken: req.params.token,
      resetTokenExpire: { $gt: Date.now() }
    });

    if (!user) {
      req.flash('error', 'Token expired or invalid.');
      return res.redirect('/auth/forgot-password');
    }

    res.render('reset-password', { token: req.params.token });
  },

  postResetPassword: async (req, res) => {
    const { password, password2 } = req.body;

    if (password !== password2) {
      req.flash('error', 'Passwords do not match.');
      return res.redirect('back');
    }

    const user = await User.findOne({
      resetToken: req.params.token,
      resetTokenExpire: { $gt: Date.now() }
    });

    if (!user) {
      req.flash('error', 'Invalid or expired token.');
      return res.redirect('/auth/forgot-password');
    }

    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    await user.save();

    req.flash('success', 'Password reset. Please log in.');
    res.redirect('/auth/login');
  }
};

module.exports = authController;
