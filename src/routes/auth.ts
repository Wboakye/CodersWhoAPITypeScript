export {}
import express, { Request, Response, NextFunction} from 'express';

const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const verify = require('./protectedRoutes');

const User = require('../models/User');
const  { registerValidation, loginValidation } = require('../validation');

interface UserInfo {
    _id: string
    following?: string[]
    followers?: string[]
    groups?: string[]
    firstName: string
    lastName: string
    username: string 
    email: string
    password: string
    date: any
    __v: number
}


//CREATE NEW USER, EXPECTS: FIRSTNAME/LASTNAME/USERNAME/EMAIL/PASSWORD => JWT
router.post('/register', async (req: Request, res: Response) => {

    //VALIDATE DATA 
    const error = registerValidation(req.body);
    if(error){
        res.status(400).send({success: false, message: error.details[0].message});
    }else{

        //CHECK IF USER EXISTS
        const emailExists = await User.findOne({ email: req.body.email });
        const usernameExists = await User.findOne({ username: req.body.username }); 

        if(emailExists){
            res.status(200).send({success: false, message: 'Email already exists'});
        }else if(usernameExists){
            res.status(200).send({success: false, message: 'Username already exists'});
        }else{

            //IF NO ERROR, HASH PASSWORD
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);

            //CREATE NEW USER
            let user = new User({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                username: req.body.username,
                email: req.body.email,
                password: hashedPassword,
                lastKnownJWT: ''
            });
            try{
                
                //CREATE, ASSIGN, AND SEND TOKEN
                const token = jwt.sign({
                    _id: user._id,
                    fistName: user.firstName,
                    lastName: user.lastName
                }, process.env.TOKEN_SECRET);

                user.lastKnownJWT = token;

                const savedUser = await user.save();
                
                res.header('auth-token', token).send({success: true, message: 'Access granted', token: token});
            }catch(err){
                res.status(400).send(err);
            }
        };
    }
});

//LOGIN, EXPECTS: USERNAME/PASSWORD => JWT: STRING
router.post('/login', async (req: Request, res: Response) => {

    //VALIDATE DATA 
    const { error } = loginValidation(req.body);
    if(error){
        res.status(400).send({success: false, message: error.details[0].message});
    }else{

        //CHECK IF USER EXISTS
        const user = await User.findOne({ username: req.body.username });
        if(!user){
            res.status(200).send({success: false, message: 'Invalid username or password.'});
        }else{

            //CHECK IF PASSWORD IS CORRECT
            const validPass = await bcrypt.compare(req.body.password, user.password);
            if(!validPass){
                res.status(400).send({success: false, message: 'Invalid username or password.'})
            }else{

                //CREATE, ASSIGN, AND SEND TOKEN
                const token = jwt.sign({
                    _id: user._id,
                    fistName: user.firstName,
                    lastName: user.lastName
                }, process.env.TOKEN_SECRET);

                User.findByIdAndUpdate(
                    user._id, 
                    {lastKnownJWT: token}, 
                    {new: true},
                    (err: Object) => {
                        // HANDLE DB ERRORS
                            if (err) return res.status(500).send(err);
                            return res.header('auth-token', token).send({success: true, message: 'Access granted', token: token});
                        })

                
            }
        }
    }
});

//CHECK IF EMAIL EXISTS, EXPECTS: EMAIL => BOOL
router.post('/emailexists', async (req: Request, res: Response) => {
    const user = await User.findOne({ email: req.body.email });
    if(user){
        res.status(200).send(true);
    }else{
        res.status(200).send(false);
    }
});

//CHECK IF USERNAME EXISTS, EXPECTS: USERNAME => BOOL
router.post('/usernameexists', async (req: Request, res: Response) => {
    const user = await User.findOne({ username: req.body.username });
    if(user){
        res.status(200).send(true);
    }else{
        res.status(200).send(false);
    }
});

//AUTHENTICATE USER, EXPECTS AUTH TOKEN IN HEADER => BOOL
router.post('/authenticate', verify, async (req: Request, res: Response) => {
    res.status(200).send({success: true})
});


//SENDS USER PROFILE INFORMATION, EXPECTS TARGET USERID => USERINFO: OBJECT
router.post('/profile', async (req: any, res: Response) => {
    try{
        const user: UserInfo = await User.findOne({ _id: req.body.userID });
        res.status(200).send(
            {   
                success: true,
                body: 
                {
                    _id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    username: user.username, 
                    following: user.following,
                    followers: user.followers,
                    groups: user.groups,
                    email: user.email
                }
            });
    }catch(err){
        res.status(401).send({success: false, body: err})
    }
    
});




module.exports = router;