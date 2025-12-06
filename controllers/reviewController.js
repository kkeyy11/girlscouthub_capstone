const Review = require('../models/review.model');
const Sentiment = require('sentiment');
const sentiment = new Sentiment();
const { spawn } = require('child_process');
const path = require('path');

/* ---------- Helper ---------- */
function isEnglish(text) {
    const tagalogWords = ['ako','ikaw','siya','sila','maganda','pangit','ka','mo','natin','tayo'];
    return !tagalogWords.some(word => text.toLowerCase().includes(word));
}

/* ---------- USER: View Reviews ---------- */
exports.getUserReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ user: req.user._id })
            .populate('product', 'name')
            .sort({ createdAt: -1 });

        res.render('review-user', { reviews });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error loading reviews');
    }
};

/* ---------- USER: Submit Review ---------- */
exports.postUserReview = async (req, res) => {
    try {
        const { message, productId } = req.body;

        if (!message || !productId) {
            req.flash('error', 'Missing review information');
            return res.redirect('/user/reviews');
        }

        let sentimentResult = 'Neutral';

        if (isEnglish(message)) {
            const result = sentiment.analyze(message);
            sentimentResult = result.score > 0 ? 'Positive' : result.score < 0 ? 'Negative' : 'Neutral';
        } else {
            try {
                const rawLabel = await analyzeSentiment(message);
                const labelMap = {
                    'LABEL_0': 'Negative',
                    'LABEL_1': 'Neutral',
                    'LABEL_2': 'Positive'
                };
                sentimentResult = labelMap[rawLabel] || 'Neutral';
            } catch {
                sentimentResult = 'Neutral';
            }
        }

        await Review.create({
            user: req.user._id,
            product: productId,
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

/* ---------- ADMIN: Review Dashboard ---------- */
exports.getAdminReviews = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate('user', 'username email')
            .populate('product', 'name')
            .sort({ createdAt: -1 });

        res.render('review-admin', { reviews });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error loading admin reviews');
    }
};

/* ---------- Python Sentiment ---------- */
const analyzeSentiment = (message) => {
    return new Promise((resolve, reject) => {
        const pythonExecutable = 'py';
        const pythonArgs = ['-3', path.join(__dirname, '..', 'scripts', 'sentiment_analysis.py'), message];
        const pythonProcess = spawn(pythonExecutable, pythonArgs);

        let resultData = '';
        pythonProcess.stdout.on('data', data => resultData += data.toString());
        pythonProcess.stderr.on('data', err => console.error('Python Error:', err));

        pythonProcess.on('close', code => {
            code === 0 ? resolve(resultData.trim()) : reject('Python error');
        });
    });
};
