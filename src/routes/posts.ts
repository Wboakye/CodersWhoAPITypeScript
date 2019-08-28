export {}
import { Request, Response, NextFunction, Router} from 'express';

const router = Router();
const verify = require('./protectedRoutes');
const Post = require('../models/Post')



//GET ALL POSTS
router.get('/', async (req: Request, res: Response) => {
    try{
        const posts: Object = await Post.find();
        res.json(posts);
    }
    catch(err){
        res.json({message:err})
    }
});

//GET SPECIFIC POST
router.get('/:postId', verify, async (req: Request, res: Response) => {
    try{
        const post: Object = await Post.findById(req.params.postId);
        res.json(post);
    }
    catch(err){
        res.json({message:err});
    }
});

//DELETE POST
router.delete('/:postId', verify, async (req: Request, res: Response) => {
    try{
        const removedPost: Object = await Post.remove({_id: req.params.postId});
        res.json(removedPost)
    }
    catch(err){
        res.json({message:err});
    }
})

//UPDATE POST REQUIRES ATTENTION: UPDATE BODY AND VERIFY ONLY UPDATING OWN POSTS    
router.patch('/:postId', verify, async (req: Request, res: Response) => {
    try{
        const updatedPost: Object = await Post.updateOne(
            {_id: req.params.postId}, 
            { $set: {title: req.body.title}});
        res.json(updatedPost);
    }
    catch(err){
        res.json({message:err});
    }
})

//SUBMIT NEW POST
router.post('/create', verify, async (req: any, res: Response) => {
    const post = new Post({
        title: req.body.title,
        description: req.body.description,
        userId: req.user._id
    });
    try{
        const savedPost: Object = await post.save();
        res.json(savedPost);
    }catch(err){
        res.json({message: err});
    }
})


module.exports = router;