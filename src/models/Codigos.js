const mongoose = require('mongoose');
const { Schema } = mongoose;

const CodeSchema = new Schema({
    email: { type: String },
    codigo: { type: String },
    tipe: { type: String },
});

module.exports = mongoose.model('Codigos', CodeSchema);