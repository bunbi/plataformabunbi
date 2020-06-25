const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require("bcryptjs");

const MyUserSchema = new Schema({
    email: { type: String },
    password: { type: String },
    check: { type: Boolean, default: false },
    verify: { type: Boolean, default: false },
    paid: { type: Boolean, default: true },
    username: { type: String },
    access: {
        type: Array, default: [
            { produc: "BUNBicot", access: true },
            { produc: "Punto de venta", access: true },
            { produc: "Contabilidad", access: true },
            { produc: "BUNBiRH", access: true },
            { produc: "Inventarios", access: true },
            { produc: "BUNBiMaster", access: true },
        ]
    },
    role: { type: Number, default: 1 },
    expire: { type: Date, default: Date.now() },
    url: { type: String, default: 'xd' },
    emailuser: { type: String },
    user: { type: String },
});

MyUserSchema.methods.encryptPassword = async password => {
    const salt = await bcrypt.genSalt(15);
    const hash = bcrypt.hash(password, salt);
    return hash;
};
MyUserSchema.methods.matchPassword = async function (password) {
    return await bcrypt.compare(password, this.password)
};

module.exports = mongoose.model('MyUsers', MyUserSchema);