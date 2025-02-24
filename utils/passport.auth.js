const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy
const User = require('../models/user.model')

passport.use(
    new LocalStrategy({
       usernameField: "email",
       passwordField: "password"
    }, 
    async(email, password, done) => {
        try {
            const user = await User.findOne({email});
            //email does not exist
            if (!user) {
                return done(null, false, {message: "Email not registered"});
            }
            //if email exist, verify password
            const isMatch = await user.isValidPassword(password);
            if (isMatch) {
                return done(null, user)
            } 
            else {
                return done(null, false, {message: "Incorrect password"});
            }
        } catch (error) {
            done(error);
        }
    })
)