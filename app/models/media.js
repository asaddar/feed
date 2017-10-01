var mongoose = require('mongoose');

var mediaSchema = mongoose.Schema({

    title: String,
    link: { type: String, required: true, minlength: 1 },
    host: String,
    image: String,
    datePosted: { type: Date, default: Date.now },
    category: String,
    author: { type : mongoose.Schema.ObjectId, ref: 'User' },
    likedBy: [{ type : mongoose.Schema.ObjectId, ref: 'User' }],
    likesCount: { type: Number, default: 0 },
    tags: [String]

});

module.exports = mongoose.model('Media', mediaSchema);