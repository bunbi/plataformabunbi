var moment = require("moment-timezone");
const Pagos = require("../models/Pagos");
const User = require("../models/User");

class Fecha {
  constructor(zone) {
    this.zone = zone;
    this.entrada = new Date();
  }

  fechaConZona() {
    var zonaLocal = this.zone;
    var a = moment()
      .tz(zonaLocal)
      .format();
    return a;
  }

  fechaExpira(v) {
    var fecha = new Date(v);
    var expire = 30;
    return fecha.setDate(fecha.getDate() + expire);
  }

  asignar(local) {
    return (this.entrada = local);
  }
  async combrobar(id) {
    const si = await Pagos.findOne({ user: id });
    if (this.entrada > si.time) {
      await User.findByIdAndUpdate(id, { paid: false });
    }
    return true;
  }
}

module.exports = Fecha;
