const mongoose = require("mongoose");
const { Schema } = mongoose;

const typeSocialSchema = new Schema({
    ts: { type: String },
    red: { type: String }
});
const ContactoMarketSchema = new Schema({
    correo: { type: String },
    name: { type: String },
    telefono: { type: String },
    socialNetwork: { type: typeSocialSchema },
    web: { type: String },
    direccion: { type: String },
    user: { type: String }
});



module.exports = mongoose.model('ContactMarket', ContactoMarketSchema);