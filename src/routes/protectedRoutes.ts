import { Request, Response, NextFunction} from 'express';

const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function(req: any, res: Response, next: NextFunction){

    //GET TOKEN
    const token = req.header('auth-token');
    console.log(token)
    if(!token){
        res.status(401).send({success: false, message: 'Access Denied'});
    }else{
        try{
            //COMPARE TOKEN TO SECRET
            const verified = jwt.verify(token, process.env.TOKEN_SECRET);
            req.user = verified
            const id = req.user._id
            const user = await User.findOne({ _id: id });

            //COMPARE TOKEN TO USERS LAST KNOWN TOKEN
            if(await user.lastKnownJWT === token){
                next();
            }else{
                console.log('Token does not match database')
                res.status(401).send({success: false, message: 'Invalid Token'});
            }            
        }catch(err){
            console.log("AUTH ERROR :" + err);
            res.status(401).send({success: false, message: 'Invalid Token'});
        }
    }
}