const {
    body
} = require('express-validator');

const status = [
    body("status", "Please insert valid status with length between 5 to 20 charchters").trim().isLength({
        min: 5,
        max: 20
    })
]

module.exports = status