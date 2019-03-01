const mongoose = require('mongoose');
const validate = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

let UserSchema = new mongoose.Schema(
    {
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
            trim: true,
            unique: true,
            validate: {
                validator: validate.isEmail,
                message: '{mail} n\'est pas un email valide'
            }
        },
        password: {
            type: String,
            require: true,
            trim: true,
            minlength: 6
        },
        tokens: [{
            access: {
                type: String,
                required: true
            },
            token: {
                type: String,
                required: true
            }
        }]
    }
)

UserSchema.methods.toJSON = function () {

    return _.pick(this.toObject(), ['_id', 'firstName', 'lastName', 'email'])
}

UserSchema.methods.generateAuthToken = function () {

    let user = this;
    let access = 'auth';
    let token = jwt.sign({ _id: user._id.toHexString(), access }, 'mySecret').toString();
    console.log("token")
    console.dir(UserSchema)

    user.tokens.push({ access, token });
    console.log("etat apres creation token de user")
    console.log(user._id)
    console.log(user.tokens)
    return user.save(user).then((res) => {
        console.log("etat apres update token de user")
        console.log(res)

        return token;
    })
}

UserSchema.statics.findByToken = function (token) {
    let decoded;

    try {
        decoded = jwt.verify(token, 'mySecret')
    } catch (err) {
        return Promise.reject('Le token ne correspond pas')
    }
    return User.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'

    })
}

UserSchema.pre('save', function (next) {

    if (this.isModified('password')) {
        this.password = bcrypt.genSalt(10).then((salt) => {
            bcrypt.hash(this.password, salt, (err, res) => {
                if (err) {
                    console.log(err)
                } else {
                    this.password = res;
                    next();
                }
            })
        })
    } else {
        next();
    }
})

let User = mongoose.model('User', UserSchema);


module.exports = {
    User: User
};