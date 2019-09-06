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
const jwt = require('jsonwebtoken');
const User = require('../models/User');
module.exports = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        //GET TOKEN
        const token = req.header('auth-token');
        console.log(token);
        if (!token) {
            res.status(401).send({ success: false, message: 'Access Denied' });
        }
        else {
            try {
                //COMPARE TOKEN TO SECRET
                const verified = jwt.verify(token, process.env.TOKEN_SECRET);
                req.user = verified;
                const id = req.user._id;
                const user = yield User.findOne({ _id: id });
                //COMPARE TOKEN TO USERS LAST KNOWN TOKEN
                if ((yield user.lastKnownJWT) === token) {
                    next();
                }
                else {
                    console.log('Token does not match database');
                    res.status(401).send({ success: false, message: 'Invalid Token' });
                }
            }
            catch (err) {
                console.log("AUTH ERROR :" + err);
                res.status(401).send({ success: false, message: 'Invalid Token' });
            }
        }
    });
};
