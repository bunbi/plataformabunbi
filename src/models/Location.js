const mongoose = require('mongoose');
const { Schema } = mongoose;

const LocationSchema = new Schema({
    location: {
        type: { type: String, default: 'Point' },
        coordinates: [Number]
    },
    less: { type: String },
    image: { type: String },
    title: { type: String },
    user: { type: String },
})

LocationSchema.index({ location: "2dsphere" });
module.exports = mongoose.model("Location", LocationSchema);