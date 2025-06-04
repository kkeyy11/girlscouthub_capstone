const User = require('../models/user.model');
const { validationResult } = require('express-validator');
const passport = require('passport');

const authController = {
    getLogin: (req, res) => {
        res.render('login');
    },

    postLogin: passport.authenticate('local', {
        successReturnToOrRedirect: "/appointment",
        failureRedirect: "/auth/login",
        failureFlash: true,
    }),

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
                res.render('register', {
                    email: req.body.email,
                    messages: req.flash(),
                });
                return;
            }
            
            const { email } = req.body;
            const doesExist = await User.findOne({ email });
            if (doesExist) {
                req.flash('error', 'Email already exists');
                res.redirect('/auth/register');
                return;
            }

            const user = new User(req.body);
            await user.save();
            req.flash('success', `${user.email} registered successfully, you can now login`);
            res.redirect('/auth/login');
        } catch (error) {
            next(error);
        }
    },

    logout: (req, res, next) => {
        req.logout((err) => {
            if (err) {
                return next(err);
            }
            res.redirect('/');
        });
    }
};

module.exports = authController;
