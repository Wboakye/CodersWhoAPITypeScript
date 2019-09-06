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
const News = require('../models/News');
//RETRIEVE LATEST NEWS FROM DB => NEWS POSTS    
router.get('/', (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const news = yield News.find();
        res.json(news);
    }
    catch (err) {
        res.json({ message: err });
    }
}));
//GET NEWS OF SPECIFIC CATEGORY REQUIRES: PARAM => NEWS POSTS
router.get('/:postSubject', (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const news = yield News.where('subject').equals(req.params.postSubject);
        res.json(news[0]);
    }
    catch (err) {
        res.json({ message: err });
    }
}));
module.exports = router;
