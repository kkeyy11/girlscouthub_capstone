const userController = {
    getProfile: async (req, res, next) => {
        try {
            res.render('profile', { person: req.user });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = userController;
