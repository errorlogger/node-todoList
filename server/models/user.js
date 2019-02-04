var mongoose = require('mongoose');

var User = mongoose.model('User', {
    firstName: {
        type: String,
        minlength: 2,
        require: true,
        trim: true
    },
    lastName: {
        type: String,
        minlength: 2,
        require: true,
        trim: true
    },
    email: {
        type: String,
        require: true,
        minlength: 7,
        trim: true
    },
    password: {
        type: String,
        require: true,
        trim: true,
        minlength: 5
    }
});

module.exports = {
    User: User
};