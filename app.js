require('dotenv').config();
const express = require('express');
const createHttpErrors = require('http-errors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');
const connectFlash = require('connect-flash');
const passport = require('passport');
const MongoStore = require('connect-mongo');
const connectEnsureLogin = require('connect-ensure-login');
const path = require('path');
const siteContentRoutes = require('./routes/siteContent.route');
const productRoutes = require('./routes/productRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// ----------------------
// Middleware
// ----------------------
app.use(morgan('dev'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ----------------------
// Handle favicon automatically
// ----------------------
app.get('/favicon.ico', (req, res) => res.sendStatus(204));

// ----------------------
// Session
// ----------------------
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI || process.env.MONGO_URL,
      dbName: process.env.DB_NAME,
    }),
    cookie: { httpOnly: true },
  })
);

// ----------------------
// Passport
// ----------------------
app.use(passport.initialize());
app.use(passport.session());
require('./utils/passport.auth');

// ----------------------
// Flash & user locals
// ----------------------
app.use(connectFlash());
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  res.locals.user = req.user;
  next();
});

// ----------------------
// Routes
// ----------------------
app.use('/', require('./routes/index.route'));
app.use('/auth', require('./routes/auth.route'));
app.use('/products', require('./routes/productRoutes'));
app.use('/', require('./routes/cartRoutes'));
app.use('/', require('./routes/troop.route'));
app.use("/", require("./routes/testMail"));
app.use('/', siteContentRoutes);

app.use(
  '/user',
  connectEnsureLogin.ensureLoggedIn({ redirectTo: '/auth/login' }),
  require('./routes/user.route')
);
app.use(
  '/admin',
  connectEnsureLogin.ensureLoggedIn({ redirectTo: '/auth/login' }),
  ensureAdmin,
  require('./routes/admin.route')
);

// ----------------------
// Healthcheck route
// ----------------------
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// ----------------------
// Landing page route
// ----------------------
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Girl Scout Hub</title>
      </head>
      <body style="font-family: sans-serif; text-align: center; margin-top: 100px;">
        <h1>✅ Girl Scout Hub is Running!</h1>
        <p>Welcome to your deployed app.</p>
      </body>
    </html>
  `);
});

const { google } = require('googleapis');

// ----------------------
// OAuth2 callback route (for Google API token exchange)
// ----------------------
app.get('/oauth2callback', async (req, res) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI // dapat ito yung nasa .env (Railway domain)
  );

  const code = req.query.code;

  if (!code) {
    return res.send("❌ No code received. Try logging in with Google again.");
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log("✅ TOKENS:", tokens);

    // Ipakita sa browser para makopya mo
    res.send(`
      <h2>✅ Success! Copy your tokens:</h2>
      <pre>${JSON.stringify(tokens, null, 2)}</pre>
      <p>👉 Save the <b>refresh_token</b> into your .env file as REFRESH_TOKEN</p>
    `);
  } catch (err) {
    console.error("❌ Error exchanging code:", err);
    res.send("Error exchanging code. Check console.");
  }
});



// ----------------------
// 404 handler
// ----------------------
app.use((req, res, next) => next(createHttpErrors.NotFound()));
app.use((err, req, res, next) => {
  err.status = err.status || 500;
  res.status(err.status);
  res.render('error_40x', { error: err });
});

// ----------------------
// Ensure admin middleware
// ----------------------
function ensureAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    req.flash('warning', 'You are not authorized');
    res.redirect('/');
  }
}

// ----------------------
// Connect to MongoDB & start server
// ----------------------
const mongoUri = process.env.MONGO_URI || process.env.MONGO_URL;
mongoose
  .connect(mongoUri, { dbName: process.env.DB_NAME })
  .then(() => {
    console.log('✅ Database connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ DB connection failed:', err.message);
    process.exit(1); // lets Railway restart the instance
  });
