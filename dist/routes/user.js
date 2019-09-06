"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const verify = require('./protectedRoutes');
const User = require('../models/User');
const Post = require('../models/Post');
const { registerValidation, loginValidation } = require('../validation');
//CREATE NEW USER, EXPECTS: FIRSTNAME/LASTNAME/USERNAME/EMAIL/PASSWORD => JWT
router.post('/register', (req, res) => __awaiter(this, void 0, void 0, function* () {
    //VALIDATE DATA 
    const error = registerValidation(req.body);
    if (error) {
        res.status(400).send({ success: false, message: error.details[0].message });
    }
    else {
        //CHECK IF USER EXISTS
        const emailExists = yield User.findOne({ email: req.body.email });
        const usernameExists = yield User.findOne({ username: req.body.username });
        if (emailExists) {
            res.status(200).send({ success: false, message: 'Email already exists' });
        }
        else if (usernameExists) {
            res.status(200).send({ success: false, message: 'Username already exists' });
        }
        else {
            //IF NO ERROR, HASH PASSWORD
            const salt = yield bcrypt.genSalt(10);
            const hashedPassword = yield bcrypt.hash(req.body.password, salt);
            //CREATE NEW USER
            let user = new User({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                username: req.body.username,
                email: req.body.email,
                password: hashedPassword,
                lastKnownJWT: ''
            });
            try {
                //CREATE, ASSIGN, AND SEND TOKEN
                const token = jwt.sign({
                    _id: user._id,
                    fistName: user.firstName,
                    lastName: user.lastName
                }, process.env.TOKEN_SECRET);
                user.lastKnownJWT = token;
                const savedUser = yield user.save();
                res.header('auth-token', token).send({ success: true, message: 'Access granted', token: token });
            }
            catch (err) {
                res.status(400).send(err);
            }
        }
        ;
    }
}));
//LOGIN, EXPECTS: USERNAME/PASSWORD => JWT: STRING
router.post('/login', (req, res) => __awaiter(this, void 0, void 0, function* () {
    //VALIDATE DATA 
    const { error } = loginValidation(req.body);
    if (error) {
        res.status(400).send({ success: false, message: error.details[0].message });
    }
    else {
        //CHECK IF USER EXISTS
        const user = yield User.findOne({ username: req.body.username });
        if (!user) {
            res.status(200).send({ success: false, message: 'Invalid username or password.' });
        }
        else {
            //CHECK IF PASSWORD IS CORRECT
            const validPass = yield bcrypt.compare(req.body.password, user.password);
            if (!validPass) {
                res.status(400).send({ success: false, message: 'Invalid username or password.' });
            }
            else {
                //CREATE, ASSIGN, AND SEND TOKEN
                const token = jwt.sign({
                    _id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    username: user.username
                }, process.env.TOKEN_SECRET);
                User.findByIdAndUpdate(user._id, { lastKnownJWT: token }, { new: true }, (err) => {
                    // HANDLE DB ERRORS
                    if (err)
                        return res.status(500).send(err);
                    return res.header('auth-token', token).send({ success: true, message: 'Access granted', token: token });
                });
            }
        }
    }
}));
//CHECK IF EMAIL EXISTS, EXPECTS: EMAIL => BOOL
router.post('/emailexists', (req, res) => __awaiter(this, void 0, void 0, function* () {
    const user = yield User.findOne({ email: req.body.email });
    if (user) {
        res.status(200).send(true);
    }
    else {
        res.status(200).send(false);
    }
}));
//CHECK IF USERNAME EXISTS, EXPECTS: USERNAME => BOOL
router.post('/usernameexists', (req, res) => __awaiter(this, void 0, void 0, function* () {
    const user = yield User.findOne({ username: req.body.username });
    if (user) {
        res.status(200).send(true);
    }
    else {
        res.status(200).send(false);
    }
}));
//AUTHENTICATE USER, EXPECTS AUTH TOKEN IN HEADER => BOOL
router.post('/authenticate', verify, (req, res) => __awaiter(this, void 0, void 0, function* () {
    res.status(200).send({ success: true });
}));
//SENDS USER PROFILE INFORMATION, EXPECTS TARGET USERID => USERINFO: OBJECT
router.post('/profile', (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        console.log(`REQUEST ID ${req.body.userId}`);
        const user = yield User.findOne({ _id: req.body.userId });
        const posts = yield Post.find({ userId: req.body.userId });
        console.log(user);
        res.status(200).send({
            success: true,
            body: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                following: user.following,
                followers: user.followers,
                groups: user.groups,
                email: user.email,
                posts: posts
            }
        });
        console.log('success');
    }
    catch (err) {
        res.status(401).send({ success: false, body: err });
        console.log(err);
    }
}));
module.exports = router;
