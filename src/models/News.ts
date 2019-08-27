export {}
const mongoose = require('mongoose');


const NewsSchema: Object = mongoose.Schema({
    subject: {
        type: String,
        required: true,
    },
    articles: {
        type: Array,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('News', NewsSchema);