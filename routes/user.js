/*============ Built in libraries ================*/

/*============ Third-party libraries ================*/
const express = require('express');
/*============ Controllers ================*/
const userController = require("../controllers/user")
/*============ Middlewares ================*/
const userValidator = require("../middlewares/validations/user");
const isAuthenticated = require("../middlewares/auth/is-auth");


const router = express.Router();


/*===============All routes has /user as a prefix (namespace)================*/
router.get("/status", isAuthenticated, userValidator, userController.getStatus)
router.put("/status", isAuthenticated, userValidator, userController.updateStatus)

module.exports= router;