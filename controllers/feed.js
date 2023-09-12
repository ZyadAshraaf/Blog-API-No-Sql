/*==================Built in libraries=================*/
const fs = require('fs');
const path = require('path');
/*==================Third-Party libraries=================*/
const {
    validationResult
} = require('express-validator');

/*==================Models=================*/
const Post = require('../models/post');
const User = require('../models/users');


/*======================Socket=================*/
const io = require('../socket');

//Read All Posts
const getPosts = async (req, res, next) => {
    try {

        let currentPage = req.query.page || 1;
        let perPage = 2;
        let totalItems;
        const count = await Post.find().countDocuments()
        totalItems = count
        const posts = await Post.find()
        .populate("creator")
        .sort({createdAt : -1})
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
        res.status(200).json({
            posts: posts,
            totalItems: totalItems
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

//Read One Post by _id
const getPost = async (req, res, next) => {
    try {
        postId = req.params.postId
        post = await Post.findById(postId)
        if (!post) {
            let error = new Error("There is no post with that ID")
            error.statusCode = 404;
            throw error;
        } else {
            res.status(200).json({
                message: "post found successfully",
                post: post
            })
        }
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

//Create Post
const createPost = async (req, res, next) => {
    try {
        const title = req.body.title;
        const content = req.body.content;
        const image = req.file;
        let creator;
        const errors = validationResult(req);
        if (!req.file) {
            const error = new Error("No image provided, Please insert valid image(png, jpg, jpeg)");
            error.statusCode = 422;
            throw error;
        }
        if (!errors.isEmpty()) {
            fs.unlink(image.path, err => {
                console.log(err);
            })

            const error = new Error('title or content are not valid');
            error.statusCode = 422
            throw error;

        }
        const imageUrl = req.file.path.replace("\\", "/");
        let postObject = {
            title: title,
            content: content,
            imageUrl: imageUrl,
            creator: req.userId
        }
        const post = new Post(postObject);
        const result = await (await post.save())

        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error('Unauthorized to add post');
            error.statusCode = 402
            throw error;

        }

        creator = user;
        user.posts.push(post)
        const result2 = await user.save()

        io.getIo().emit('posts', {
            action: 'create',
            post: {
                ...post._doc,
                creator: {
                    _id: req.userId,
                    name: user.name
                }
            }
        })
        res.status(201).json({
            message: "Post created successfully",
            post: post,
            creator: {
                _id: creator._id,
                name: creator.name
            }
        })
    } catch (err) {

        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }

}

//Update Post by _id
updatePost = async (req, res, next) => {
    try {
        const postId = req.params.postId;
        const title = req.body.title;
        const content = req.body.content;
        let imageUrl = req.body.image;
        let sameImage;
        let oldImage;

        if (req.file) {
            imageUrl = req.file.path.replace("\\", "/");
        }
        if (!imageUrl) {
            const error = new Error('No file Picked');
            error.statusCode = 422
            throw error;
        }
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            if (req.file) {
                fs.unlink(req.file.path, (err => {
                    console.log(err);
                }))

            }
            const error = new Error('title or content are not valid');
            error.statusCode = 422
            throw error;
        }

        const post = await Post.findById(postId).populate("creator")

        if (!post) {
            const error = new Error("Post Not found")
            error.statusCode = 404;
            throw error;
        }
        if (post.creator._id.toString() !== req.userId.toString()) {
            const error = new Error("Not Authorized")
            error.statusCode = 403;
            throw error;
        }
        if (post.imageUrl === imageUrl) {
            sameImage = true;
        } else {
            sameImage = false;
        }
        oldImage = post.imageUrl
        post.title = title;
        post.content = content;
        post.imageUrl = imageUrl;
        const result = await post.save()

        if (sameImage === false) {
            clearImage(oldImage);
        }

        io.getIo().emit('posts', {
            action: 'update',
            post: result
        })

        res.status(200).json({
            message: "post updated successfully",
            result: result
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}


//delete post
const deletePost = async (req, res, next) => {
    try {
        const postId = req.params.postId;
        let imageUrl;
        const post = await Post.findById(postId)
        if (!post) {
            const error = new Error("Post Not found")
            error.statusCode = 404;
            throw error;
        }

        if (post.creator.toString() !== req.userId.toString()) {
            const error = new Error("Not Authorized")
            error.statusCode = 403;
            throw error;
        }
        imageUrl = post.imageUrl;
        const result = await Post.findByIdAndRemove(postId)
        const user = await User.findById(req.userId)

        user.posts.pull(postId);
        const result2 = await user.save();

        clearImage(imageUrl);

        io.getIo().emit("posts",{
            action : "delete",
            post : postId
        })
        res.status(200).json({
            message: "Post deleted Successfully",
            result: result
        })
    } catch (err) {

        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }

}
//delete image
const clearImage = (filePath) => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => {
        console.log(err);
    })
}

module.exports = {
    getPosts: getPosts,
    getPost: getPost,
    createPost: createPost,
    updatePost: updatePost,
    deletePost: deletePost
}