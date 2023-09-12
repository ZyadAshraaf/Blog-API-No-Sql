/*==================Built in libraries=================*/


/*==================Third-Party libraries=================*/
const {
    validationResult
} = require('express-validator');

/*==================Models=================*/
const User = require("../models/users");

const getStatus = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId)

        if (!user) {
            const error = new Error("Not Authorized")
            error.statusCode = 403;
            throw error;
        }
        res.status(200).json({
            message: "User status fetched successfully",
            data: user.status
        })
    } catch (err) {

        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

const updateStatus = async (req, res, next) => {
    try {
        const status = req.body.status;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error("Please enter valid Data");
            error.statusCode = 422;
            error.data = errors.array();
            throw error;
        }
        const user = await User.findById(req.userId)
        if (!user) {
            const error = new Error("Not Authorized")
            error.statusCode = 403;
            throw error;
        }
        user.status = status;
        const result = await user.save();
        res.status(201).json({
            message: "status updated successfully",
            data: result
        })
    } catch (err) {

        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

module.exports = {
    getStatus: getStatus,
    updateStatus: updateStatus
}