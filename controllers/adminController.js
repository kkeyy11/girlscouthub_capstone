const User = require('../models/user.model');

const adminController = {
    getUsers: async (req, res, next) => {
        try {
            const users = await User.find();
            // res.send(users);
            res.render('manage-users', {users});
        } catch (error) {
            next(error);
        }
    }
};

module.exports = adminController;
