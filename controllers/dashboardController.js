const dashboardController = {
    getIndex: (req, res, next) => {
        res.render('index')
    }
};

module.exports = dashboardController;
