const User = require("../models/User");
const Image = require("../models/Image");
const Pago = require("../models/Pagos");

class Register {
  constructor() {}
  validar(razon, correo, celular, sector, rfc, date) {
    if (!razon || !correo || !celular || !sector || !rfc || !date) {
      return { error: true, msg: "Llene todos los campos" };
    }
    if (!this.valEmail(correo)) {
      return { error: true, msg: "Correo no valido" };
    }
    if (!this.valRfc(rfc)) {
      return { error: true, msg: "Ingrese un RFC correcto" };
    }
    return { error: false };
  }

  validPassword(password, confirm) {
    if (password != confirm) {
      return { error: true, msg: "Las contraseñas no coinciden" };
    }
    if (!password || !confirm) {
      return { error: true, msg: "Ingrese una contraseña" };
    }
    if (password.length < 6) {
      return {
        error: true,
        msg: "Ingrese una contraseña mayor a 6 caracteres"
      };
    }
    return { error: false };
  }

  valEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }
  valRfc(rfc) {
    var re = /^([A-ZÑ&]{3,4}) ?(?:- ?)?(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])) ?(?:- ?)?([A-Z\d]{2})([A\d])$/;
    return re.test(String(rfc).toLowerCase());
  }

  async igual(email, rfc) {
    const emailUser = await User.findOne({ email: email });
    const rfcUser = await User.findOne({ rfc: rfc });
    if (emailUser || rfcUser) {
      return { error: true, msg: "Correo o RFC en uso" };
    } else return { error: false };
  }

  async guardar(razon, email, telefono, sector, rfc, password, date) {
    try {
      const newUser = new User(razon, rfc, email, telefono);
      newUser.password = await newUser.encryptPassword(password);
      newUser.sector = sector;
      await newUser.save();
      let res = this.recuperar(email);
      this.image(res, date);
      return { error: false, msg: "Registro completado" };
    } catch (e) {
      return { error: true, msg: "Error al registrar" };
    }
  }

  async recuperar(email) {
    const dato = await User.findOne({ email: email }, { id: 1 });
    return dato.id;
  }

  async image(id, date) {
    const fechaExpiracion = this.fechaExpira(date);
    const saveImage = new Image({ user: id });
    const pagoInicial = new Pago({
      email: "example@example",
      paid: true,
      status: "success",
      customer: "dont",
      time: fechaExpiracion
    });
    pagoInicial.user = id;
    saveImage.save();
    pagoInicial.save();
  }
  fechaExpira(v) {
    var fecha = new Date(v);
    var expire = 30;
    return fecha.setDate(fecha.getDate() + expire);
  }
}
module.exports = Register;
