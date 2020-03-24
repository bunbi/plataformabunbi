const mongoose = require('mongoose');
const { Schema } = mongoose;


const PagoSchema = new Schema({
    email:{type: String},
    paid:{type: Boolean},
    customer:{type:String},
    status:{type: String},
    time:{type: Date},
    pago:{type: Number},
    user:{type:String}
});

module.exports = mongoose.model('Pagos', PagoSchema);