/*============ Built in libraries ================*/

/*============ Third-party libraries ================*/
const express = require('express');

/*============ Controllers ================*/
const feedController = require('../controllers/feed')

/*============ Middlewares ================*/
const AddProductValidator = require('../middlewares/validations/posts');
const isAuthenticated = require("../middlewares/auth/is-auth")


const router = express.Router();





/*===============All routes has /feed as a prefix (namespace)================*/
//Posts routes
router.get("/posts", isAuthenticated, feedController.getPosts)
router.get("/posts/:postId", isAuthenticated, feedController.getPost)
router.post("/posts", isAuthenticated, AddProductValidator, feedController.createPost)
router.put("/posts/:postId", isAuthenticated, AddProductValidator, feedController.updatePost)
router.delete("/posts/:postId", isAuthenticated, feedController.deletePost)


module.exports = router;