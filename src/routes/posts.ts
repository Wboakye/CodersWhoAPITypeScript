export {};
import { Request, Response, NextFunction, Router } from "express";

const router = Router();
const verify = require("./protectedRoutes");
const Post = require("../models/Post");

//GET ALL POSTS
router.get("/", async (req: Request, res: Response) => {
  try {
    const posts: Object = await Post.find();
    res.json(posts);
  } catch (err) {
    res.json({ message: err });
  }
});

//GET SPECIFIC POST
router.get("/:postId", async (req: Request, res: Response) => {
  try {
    const post: Object = await Post.findById(req.params.postId);
    res.json(post);
  } catch (err) {
    res.json({ message: err });
  }
});

//DELETE POST
router.delete("/:postId", verify, async (req: Request, res: Response) => {
  try {
    const removedPost: Object = await Post.remove({ _id: req.params.postId });
    res.json(removedPost);
  } catch (err) {
    res.json({ message: err });
  }
});

//UPDATE POST REQUIRES ATTENTION: UPDATE BODY AND VERIFY ONLY UPDATING OWN POSTS
router.patch("/comment/:postId", async (req: Request, res: Response) => {
  try {
    const post: any = await Post.findById(req.params.postId);
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
      (err: any, newPost: any) => {
        //DB ERRORS
        if (err) return res.status(500).send(err);
        return res.send(newPost);
      }
    );
  } catch (err) {
    res.json({ message: err });
  }
});

//SUBMIT NEW POST
router.post("/create", verify, async (req: any, res: Response) => {
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
    const savedPost: Object = await post.save();
    res.json(savedPost);
  } catch (err) {
    res.json({ message: err });
  }
});

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
