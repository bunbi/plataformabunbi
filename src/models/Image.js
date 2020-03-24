const mongoose = require("mongoose");
const { Schema } = mongoose;

const ImageSchema = new Schema({
  filename: { type: String, default: "camara.jpg" },
  user: { type: String },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Image", ImageSchema);
