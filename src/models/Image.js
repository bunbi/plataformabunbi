const mongoose = require('mongoose');
const { Schema } = mongoose;

const ImageSchema = new Schema({
    filename: { type: String },
    ext: { type: String },
    url: { type: String },
    asset: { type: String },
    public: { type: String },
    user: { type: String },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Image', ImageSchema)