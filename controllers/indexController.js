const indexController = {
    getIndex: (req, res, next) => {
        res.render('index')
    }
};

module.exports = indexController;
