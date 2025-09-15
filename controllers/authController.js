const User = require('../models/user.model');
const { validationResult } = require('express-validator');
const passport = require('passport');
const crypto = require('crypto');
const { transporter } = require('../utils/mailer'); // import transporter

const authController = {
  getLogin: (req, res) => res.render('login'),
  getRegister: (req, res) => res.render('register'),

  postRegister: async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        errors.array().forEach(error => req.flash('error', error.msg));
        return res.render('register', { email: req.body.email, messages: req.flash() });
      }

      const { firstName, middleName, lastName, email, password } = req.body;
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        req.flash('error', 'Email already registered.');
        return res.redirect('/auth/register');
      }

      const user = new User({ firstName, middleName, lastName, email, password });
      if (req.file) user.profileImage = req.file.filename;

      user.verificationToken = crypto.randomBytes(32).toString('hex');
      user.isVerified = false;
      await user.save();

      // Send email verification with debug logging
      const verifyUrl = `${req.protocol}://${req.get('host')}/auth/verify-email/${user.verificationToken}`;
      try {
        const info = await transporter.sendMail({
          from: `"GSP System" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: 'Verify your email',
          text: `Click to verify: ${verifyUrl}`
        });
        console.log(`Verification email sent to ${user.email}:`, info.response);
      } catch (err) {
        console.error('Error sending verification email:', err);
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

  getForgotPassword: (req, res) => res.render('forgot-password'),

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

      const resetUrl = `${req.protocol}://${req.get('host')}/auth/reset-password/${user.resetToken}`;
      try {
        const info = await transporter.sendMail({
          from: `"GSP System" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: 'Reset Password',
          text: `Reset your password: ${resetUrl}`
        });
        console.log(`Reset password email sent to ${user.email}:`, info.response);
      } catch (err) {
        console.error('Error sending reset password email:', err);
      }

      req.flash('success', 'Reset link sent to your email.');
      res.redirect('/auth/login');
    } catch (err) {
      console.error('Forgot password error:', err);
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
