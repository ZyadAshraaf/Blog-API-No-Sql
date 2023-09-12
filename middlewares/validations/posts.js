const {body} = require('express-validator');

let addProduct = [
    body('title').isString().trim().isLength({min:5, max: 20}),
    body('content').isString().trim().isLength({min:5, max: 200})

]

module.exports = addProduct