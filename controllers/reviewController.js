const Review = require('../models/review.model');
const Sentiment = require('sentiment');
const sentiment = new Sentiment();
const { spawn } = require('child_process');
const path = require('path');

// Simple English detector
function isEnglish(text) {
    const tagalogWords = ['ako', 'ikaw', 'siya', 'sila', 'maganda', 'pangit', 'ka', 'mo', 'natin', 'tayo'];
    const lower = text.toLowerCase();
    return !tagalogWords.some(word => lower.includes(word));
}

// GET: User reviews
exports.getUserReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.render('review-user', { reviews });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading reviews");
    }
};

// POST: Submit a new review
exports.postUserReview = async (req, res) => {
    try {
        const message = req.body.message;
        console.log('Message:', message);
        console.log('User:', req.user);

        if (!message) {
            req.flash('error', 'Review message is empty');
            return res.redirect('/user/reviews');
        }

        let sentimentResult = 'Neutral';

        if (isEnglish(message)) {
            // English sentiment using npm Sentiment
            const result = sentiment.analyze(message);
            sentimentResult = result.score > 0 ? 'Positive' : result.score < 0 ? 'Negative' : 'Neutral';
            console.log('English sentiment:', sentimentResult);
        } else {
            // Tagalog sentiment via Python RoBERTa
            // Tagalog sentiment via Python RoBERTa
console.log('Calling Python RoBERTa...');
try {
    let rawLabel = await analyzeSentiment(message);
    console.log('Raw Python sentiment:', rawLabel);

    // Map LABEL_0 / LABEL_1 / LABEL_2 to Negative / Neutral / Positive
    const labelMap = {
        'LABEL_0': 'Negative',
        'LABEL_1': 'Neutral',
        'LABEL_2': 'Positive'
    };
    sentimentResult = labelMap[rawLabel] || 'Neutral';
    console.log('Mapped sentiment:', sentimentResult);
} catch (pyErr) {
    console.error('Python sentiment error:', pyErr);
    sentimentResult = 'Neutral'; // fallback if Python fails
}

        }

        // Save review to DB
        const review = await Review.create({
            user: req.user._id,
            message,
            sentiment: sentimentResult
        });

        console.log('Review saved:', review);
        req.flash('success', 'Review submitted successfully');
        res.redirect('/user/reviews');

    } catch (err) {
        console.error('Error in postUserReview:', err);
        req.flash('error', 'Failed to submit review');
        res.redirect('/user/reviews');
    }
};

// GET: Admin reviews
exports.getAdminReviews = async (req, res) => {
    try {
        const reviews = await Review.find().populate('user').sort({ createdAt: -1 });
        res.render('review-admin', { reviews });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading admin reviews");
    }
};

// Helper: Call Python script for sentiment analysis (Tagalog/Roberta)
const analyzeSentiment = async (message) => {
    return new Promise((resolve, reject) => {
        const pythonExecutable = 'py'; // use 'py' for Windows
        const pythonArgs = ['-3', path.join(__dirname, '..', 'scripts', 'sentiment_analysis.py'), message];

        const pythonProcess = spawn(pythonExecutable, pythonArgs);

        let resultData = '';
        pythonProcess.stdout.on('data', (data) => {
            resultData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`Python Error: ${data}`);
        });

        pythonProcess.on('close', (code) => {
            if (code === 0) {
                resolve(resultData.trim());
            } else {
                reject('Python process exited with an error');
            }
        });
    });
};