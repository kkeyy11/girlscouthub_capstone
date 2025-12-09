const Review = require('../models/review.model');
const Sentiment = require('sentiment');
const sentiment = new Sentiment();
const { spawn } = require('child_process');
const path = require('path');
const Event = require('../models/Event');

/* Simple English detector */
function isEnglish(text) {
  const tagalogWords = ['ako','ikaw','siya','sila','maganda','pangit','ka','mo','natin','tayo'];
  const lower = text.toLowerCase();
  return !tagalogWords.some(word => lower.includes(word));
}

/* USER: GET REVIEWS */
exports.getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id });
    const events = await Event.find().sort({ date: 1 }); // upcoming events
    res.render('review-user', { reviews, events });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading reviews");
  }
};

/* USER: SUBMIT / UPDATE REVIEW */
exports.postUserReview = async (req, res) => {
  try {
    const { message, rating } = req.body;

    if (!message) {
      req.flash('error', 'Review message is empty');
      return res.redirect('/user/reviews');
    }

    const parsedRating = parseInt(rating);
    if (!parsedRating || parsedRating < 1 || parsedRating > 5) {
      req.flash('error', 'Please provide a valid rating');
      return res.redirect('/user/reviews');
    }

    let sentimentResult = 'Neutral';

    if (isEnglish(message)) {
      const result = sentiment.analyze(message);
      sentimentResult =
        result.score > 0 ? 'Positive' :
        result.score < 0 ? 'Negative' : 'Neutral';
    } else {
      try {
        const rawLabel = await analyzeSentiment(message);
        const labelMap = {
          LABEL_0: 'Negative',
          LABEL_1: 'Neutral',
          LABEL_2: 'Positive'
        };
        sentimentResult = labelMap[rawLabel] || 'Neutral';
      } catch (err) {
        console.error('Python sentiment error:', err);
      }
    }

    // ✅ ONE REVIEW PER USER (UPDATE OR CREATE)
    const existingReview = await Review.findOne({ user: req.user._id });

    if (existingReview) {
      existingReview.message = message;
      existingReview.rating = parsedRating;
      existingReview.sentiment = sentimentResult;
      await existingReview.save();

      req.flash('success', 'Review updated successfully');
    } else {
      await Review.create({
        user: req.user._id,
        message,
        rating: parsedRating,
        sentiment: sentimentResult
      });

      req.flash('success', 'Review submitted successfully');
    }

    res.redirect('/user/reviews');

  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to submit review');
    res.redirect('/user/reviews');
  }
};

/* ADMIN: GET ALL REVIEWS */
exports.getAdminReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user')
      .sort({ createdAt: -1 });

    res.render('review-admin', { reviews });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading admin reviews");
  }
};

/* Python Sentiment Helper */
const analyzeSentiment = async (message) => {
  return new Promise((resolve, reject) => {
    const py = spawn(
      'py',
      ['-3', path.join(__dirname,'..','scripts','sentiment_analysis.py'), message]
    );

    let output = '';
    py.stdout.on('data', d => output += d.toString());
    py.stderr.on('data', e => console.error(e.toString()));

    py.on('close', code => {
      code === 0 ? resolve(output.trim()) : reject();
    });
  });
};
