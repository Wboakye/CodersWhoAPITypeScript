export {}
import { Request, Response, NextFunction, Router} from 'express';
const router = Router();

const News = require('../models/News')

//RETRIEVE LATEST NEWS FROM DB => NEWS POSTS    
router.get('/', async (req: Request, res: Response) => {
    try{
        const news: []  = await News.find();
        res.json(news);
    }
    catch(err){
        res.json({message:err})
    }
});

//GET NEWS OF SPECIFIC CATEGORY REQUIRES: PARAM => NEWS POSTS
router.get('/:postSubject', async (req: Request, res: Response) => {
    try{
        const news = await News.where('subject').equals(req.params.postSubject)
        res.json(news[0]); 
    }
    catch(err){
        res.json({message:err});
    }
});


module.exports = router;
