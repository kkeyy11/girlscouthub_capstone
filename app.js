    const express = require('express');


    
    const createHttpErrors = require('http-errors');
    const morgan = require('morgan');
    const mongoose = require('mongoose');
    require('dotenv').config();
    const session = require('express-session');
    const connectFlash = require('connect-flash');
    const passport = require('passport');
    const MongoStore = require('connect-mongo');
    const connectEnsureLogin = require('connect-ensure-login')
    const districtRoutes = require('./routes/districtRoutes');
    const troopMemberRoutes = require('./routes/troopMemberRoutes');

    const app = express();
    app.use(morgan('dev'));
    app.set('view engine', 'ejs');
    app.use(express.static('public'));
    app.use(express.json());
    app.use(express.urlencoded({extended: false}));

    app.use(session({
        secret: process.env.SESSION_SECRET, 
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URI,
            dbName: process.env.DB_NAME,
        }),
        cookie: {
            httpOnly: true,
        }
    }));

    //passport js auth
    app.use(passport.initialize());
    app.use(passport.session());
    require('./utils/passport.auth');

    app.use((req, res, next) => {
        res.locals.user = req.user;
        next();
    });

    app.use(connectFlash());
    app.use((req, res, next) => {
        res.locals.messages = req.flash();
        next();
    });

    //routes
    app.use('/districts', districtRoutes);

    app.use('/troopmembers', troopMemberRoutes);



    app.use('/', require('./routes/index.route'));
    app.use('/auth', require('./routes/auth.route'));
    app.use('/user', connectEnsureLogin.ensureLoggedIn({redirectTo: "/auth/login"}), require('./routes/user.route'));
    app.use('/admin',connectEnsureLogin.ensureLoggedIn({redirectTo: "/auth/login"}), 
    ensureAdmin,
    require('./routes/admin.route'));

    app.use((req, res, next) => {
        next(createHttpErrors.NotFound());
    });

    app.use((error, req, res, next) => {
        error.status = error.status || 500;
        res.status(error.status);
        res.render('error_40x', {error});
    });

    const PORT = process.env.PORT || 3000;

    mongoose.connect(process.env.MONGO_URI, {
        dbName: process.env.DB_NAME,
    }).then(() => {
        console.log('Database connected...');
        app.listen(PORT, () => console.log(`Running on port ${PORT}`));
    }).catch(err => console.log(err.message));

    // function ensureAuthenticated(req, res, next){
    //     if (req.isAuthenticated()) {
    //         next();
    //     } else {
    //         res.redirect('/auth/login');
    //     }
    // };

    function ensureAdmin(req, res, next) {
        if (req.user && req.user.role === "ADMIN") { // Direct string comparison
            next();
        } else {
            req.flash('warning', 'You are not authorized');
            res.redirect('/');
        }
    };
    