const mongoose = require('mongoose');
const { Schema } = mongoose;

const PublicImageSchema = new Schema({
    filename: { type: String },
    ext: { type: String },
    public: { type: String },
    url: { type: String },
    user: { type: String },
    date: { type: Date, default: Date.now },
    asset: { type: String }
});

module.exports = mongoose.model('PublicImage', PublicImageSchema)