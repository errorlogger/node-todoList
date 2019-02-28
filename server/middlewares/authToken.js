let { User } = require('./../models/user')


let authToken = (req, res, next) => {
    let token = req.header('x-auth');

    User.findByToken(token).then((user) => {
        if (!user) {
            res.status(400).send("error: no such user");
        }
        req.user = user;
        req.token = token;
        next();

    }).catch((err) => {
        res.status(401).send(err);
    });
};

module.exports = { authToken };