"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = express_1.Router();
const verify = require("./protectedRoutes");
const Post = require("../models/Post");
//GET ALL POSTS
router.get("/", (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const posts = yield Post.find();
        res.json(posts);
    }
    catch (err) {
        res.json({ message: err });
    }
}));
//GET SPECIFIC POST
router.get("/:postId", (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const post = yield Post.findById(req.params.postId);
        res.json(post);
    }
    catch (err) {
        res.json({ message: err });
    }
}));
//DELETE POST
router.delete("/:postId", verify, (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const removedPost = yield Post.remove({ _id: req.params.postId });
        res.json(removedPost);
    }
    catch (err) {
        res.json({ message: err });
    }
}));
//UPDATE POST REQUIRES ATTENTION: UPDATE BODY AND VERIFY ONLY UPDATING OWN POSTS
router.patch("/comment/:postId", (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const post = yield Post.findById(req.params.postId);
        const comments = post.comments;
        comments.push(req.body);
        Post.findByIdAndUpdate(
        //ITEM TO BE UPDATED
        req.params.postId, 
        //WHAT TO UPDATE POST WITH
        { comments: comments }, 
        //RETURNS UPDATED POST, RATHER THAN PRE-UPDATED POST
        { new: true }, 
        //CALLBACK
        (err, newPost) => {
            //DB ERRORS
            if (err)
                return res.status(500).send(err);
            return res.send(newPost);
        });
    }
    catch (err) {
        res.json({ message: err });
    }
}));
//SUBMIT NEW POST
router.post("/create", verify, (req, res) => __awaiter(this, void 0, void 0, function* () {
    console.log("USER");
    console.log(req.user);
    const post = new Post({
        title: req.body.title,
        subTitle: req.body.subTitle,
        description: req.body.description,
        group: req.body.group,
        userId: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        username: req.user.username
    });
    try {
        const savedPost = yield post.save();
        res.json(savedPost);
    }
    catch (err) {
        res.json({ message: err });
    }
}));
// router.patch('/:postId', async (req: Request, res: Response) => {
//     try{
//         Post.findByIdAndUpdate(
//             //ITEM TO BE UPDATED
//             req.params.postId,
//             //WHAT TO UPDATE POST WITH
//             req.body,
//             //RETURNS UPDATED POST, RATHER THAN PRE-UPDATED POST
//             {new: true},
//             //CALLBACK
//             (err: any, post: any) => {
//             //DB ERRORS
//                 if (err) return res.status(500).send(err);
//                 return res.send(post);
//             }
//         )
//     }
//     catch(err){
//         res.json({message:err});
//     }
// })
module.exports = router;
