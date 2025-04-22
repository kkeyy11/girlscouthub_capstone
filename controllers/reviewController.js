const Review = require('../models/review.model');
const Sentiment = require('sentiment');
const sentiment = new Sentiment();
const { spawn } = require('child_process');
const path = require('path');

// Simple language detector (improve this if needed)
function isEnglish(text) {
    const tagalogWords = ['ako', 'ikaw', 'siya', 'sila', 'maganda', 'pangit', 'ka', 'mo', 'natin', 'tayo'];
    const lower = text.toLowerCase();
    return !tagalogWords.some(word => lower.includes(word));
}

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

        let sentimentResult = 'Neutral';

        if (isEnglish(message)) {
            // English sentiment using npm package
            const result = sentiment.analyze(message);
            sentimentResult = result.score > 0 ? 'Positive' : result.score < 0 ? 'Negative' : 'Neutral';
        } else {
            // Tagalog/mixed sentiment using Python model
            sentimentResult = await analyzeSentiment(message);
        }

        // Save the review
        await Review.create({
            user: req.user._id,
            message,
            sentiment: sentimentResult
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

// Calls Python script for sentiment (Tagalog)
const analyzeSentiment = async (message) => {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', [path.join(__dirname, '..', 'scripts', 'sentiment_analysis.py'), message]);

        pythonProcess.stdout.on('data', (data) => {
            const sentimentResult = data.toString().trim();
            resolve(sentimentResult);
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`Error (Python): ${data}`);
            reject('Error analyzing sentiment (Python)');
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                reject(`Python process exited with code ${code}`);
            }
        });
    });
};
