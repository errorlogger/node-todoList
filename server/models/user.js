const mongoose = require('mongoose');
const validate = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

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
    let user = this;
    let userObject = user.toObject();

    return _.pick(userObject, ['_id', 'firstName', 'lastName', 'email'])
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


let User = mongoose.model('User', UserSchema);


module.exports = {
    User: User
};