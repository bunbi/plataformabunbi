const mongoose = require("mongoose");
const path = require("path");
const { Schema } = mongoose;
const bcrypt = require("bcryptjs");

const UserSchema = new Schema({
  razon: { type: String, required: true },
  rfc: { type: String, required: true },
  email: { type: String, required: true },
  telefono: { type: String, required: true },
  estado: { type: String, required: true },
  municipio: { type: String, required: true },
  colonia: { type: String, required: true },
  calle: { type: String, required: true },
  numero: { type: String, required: true },
  password: { type: String, required: true },
  paid: { type: Boolean, default: true },
  check: { type: Boolean, default: true }
});

UserSchema.methods.encryptPassword = async password => {
  const salt = await bcrypt.genSalt(15);
  const hash = bcrypt.hash(password, salt);
  return hash;
};

UserSchema.methods.matchPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", UserSchema);
