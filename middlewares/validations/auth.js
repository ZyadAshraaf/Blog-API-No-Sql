const {
    body
} = require('express-validator');

const User = require("../../models/users")

const signUp = [
    body("email").isEmail().withMessage("Unvalid Email")
    .custom((value,{req})=>{
        return User.findOne({email : value})
        .then(userDoc=>{
            if(userDoc){
                return Promise.reject("Email already existed");
            }
        })
    }),
    body("name").trim().isString().isLength({min:3}),
    body("password").trim().isAlphanumeric().isLength({min:8}),
]

module.exports ={
    signUp : signUp
}