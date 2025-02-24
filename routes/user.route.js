const router = require('express').Router();

router.get('/profile', async(req, res, next) => {
    
    res.render('profile', { person: req.user });
});


module.exports = router;