const mongoose = require("mongoose");
const { Schema } = mongoose;

const horarioSchema = new Schema({
    diaPe: [{
        dia: { type: String },
        open: { type: String },
        close: { type: String },
    }],
    user: { type: String }
});
module.exports = mongoose.model('Horario', horarioSchema);