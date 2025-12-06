const Review = require('../models/review.model');
const Sentiment = require('sentiment');
const sentiment = new Sentiment();
const { spawn } = require('child_process');
const path = require('path');

// English detector
function isEnglish(text) {
    const tagalogWords = ['ako', 'ikaw', 'siya', 'sila', 'maganda', 'pangit', 'ka', 'mo', 'natin', 'tayo'];
    return !tagalogWords.some(word => text.toLowerCase().includes(word));
}

// GET user reviews
exports.getUserReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate('reservation');
        res.render('review-user', { reviews });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading reviews");
    }
};

// POST user review
exports.postUserReview = async (req, res) => {
    try {
        const message = req.body.message;
        if (!message) {
            req.flash('error', 'Review message is empty');
            return res.redirect('/user/reviews');
        }

        let sentimentResult = 'Neutral';

        if (isEnglish(message)) {
            const result = sentiment.analyze(message);
            sentimentResult = result.score > 0 ? 'Positive' : result.score < 0 ? 'Negative' : 'Neutral';
        } else {
            try {
                const rawLabel = await analyzeSentiment(message);
                const labelMap = { 'LABEL_0': 'Negative', 'LABEL_1': 'Neutral', 'LABEL_2': 'Positive' };
                sentimentResult = labelMap[rawLabel] || 'Neutral';
            } catch (pyErr) {
                console.error('Python error:', pyErr);
                sentimentResult = 'Neutral';
            }
        }

        await Review.create({ user: req.user._id, message, sentiment: sentimentResult });
        req.flash('success', 'Review submitted successfully');
        res.redirect('/user/reviews');

    } catch (err) {
        console.error(err);
        req.flash('error', 'Failed to submit review');
        res.redirect('/user/reviews');
    }
};

// GET admin reviews
exports.getAdminReviews = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate('user', 'firstName lastName username email') // populate user info
            .populate('reservation', 'total _id') // optional reservation info
            .sort({ createdAt: -1 });
        res.render('review-admin', { reviews });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading admin reviews");
    }
};

// Python sentiment helper
const analyzeSentiment = async (message) => {
    return new Promise((resolve, reject) => {
        const pythonExecutable = 'py';
        const pythonArgs = ['-3', path.join(__dirname, '..', 'scripts', 'sentiment_analysis.py'), message];
        const pythonProcess = spawn(pythonExecutable, pythonArgs);

        let resultData = '';
        pythonProcess.stdout.on('data', (data) => resultData += data.toString());
        pythonProcess.stderr.on('data', (data) => console.error(`Python Error: ${data}`));

        pythonProcess.on('close', (code) => {
            code === 0 ? resolve(resultData.trim()) : reject('Python exited with error');
        });
    });
};
