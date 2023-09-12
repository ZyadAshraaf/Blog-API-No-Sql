/*==================Built in libraries=================*/


/*==================Third-Party libraries=================*/
const {
    validationResult
} = require("express-validator")
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/*==================Models=================*/
const User = require('../models/users')


const signup = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error("Please enter valid Data");
            error.statusCode = 422;
            error.data = errors.array();
            throw error;
        }
        const email = req.body.email;
        const password = req.body.password;
        const name = req.body.name;
        const hashedPw = await bcrypt.hash(password, 12)
        const user = new User({
            email: email,
            password: hashedPw,
            name: name
        });
        const userResault = await user.save();

        res.status(201).json({
            message: "User created",
            userId: userResault._id
        })
    } catch (err) {

        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }

}

const login = async (req, res, next) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        let loadedUser;
        const user = await User.findOne({
            email: email
        })

        if (!user) {
            const error = new Error('Wrong email or password');
            error.statusCode = 401
            throw error;
        }
        loadedUser = user;
        const isEqual = await bcrypt.compare(password, user.password)

        if (!isEqual) {
            const error = new Error('Wrong email or password');
            error.statusCode = 401
            throw error;
        }
        const token = jwt.sign({
            email: loadedUser.email,
            userId: loadedUser._id.toString()
        }, 'hellospongbob', {
            expiresIn: "1h"
        });

        res.status(200).json({
            token: token,
            userId: loadedUser._id.toString()
        })
    } catch (err) {

        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }

}

module.exports = {
    signup: signup,
    login: login
}