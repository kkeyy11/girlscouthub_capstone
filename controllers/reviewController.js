const Review = require('../models/review.model');
const Sentiment = require('sentiment');
const sentiment = new Sentiment();

exports.getUserReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.render('review-user', { reviews });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading reviews");
    }
};

exports.postUserReview = async (req, res) => {
    try {
        const message = req.body.message;
        const result = sentiment.analyze(message);
        let sentimentType = 'Neutral';

        if (result.score > 0) sentimentType = 'Positive';
        else if (result.score < 0) sentimentType = 'Negative';

        await Review.create({
            user: req.user._id,
            message,
            sentiment: sentimentType
        });

        req.flash('success', 'Review submitted successfully');
        res.redirect('/user/reviews');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Failed to submit review');
        res.redirect('/user/reviews');
    }
};

exports.getAdminReviews = async (req, res) => {
    try {
        const reviews = await Review.find().populate('user').sort({ createdAt: -1 });
        res.render('review-admin', { reviews });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading admin reviews");
    }
};
