/*============ Built in libraries ================*/

/*============ Third-party libraries ================*/
const express = require('express');

/*============ Controllers ================*/
const authController = require("../controllers/auth")

/*============ Middlewares ================*/
const authValidator = require("../middlewares/validations/auth")

const router = express.Router();

/*===============All routes has /auth as a prefix (namespace)================*/
router.put('/signup', authValidator.signUp, authController.signup);
router.post('/login', authValidator.signUp, authController.login);

module.exports = router;