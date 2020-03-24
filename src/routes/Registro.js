const express = require("express");
const router = express.Router();
const ClassRegister = require("../class/ClassRegistrer");

router.post("/registrar", async (req, res) => {
  const {
    razon,
    correo,
    celular,
    sector,
    rfc,
    password,
    confirm,
    date
  } = req.body;
  let Register = new ClassRegister();
  let respuesta = await Register.validPassword(password, confirm);
  if (respuesta.error) {
    responder(respuesta);
  }
  let valida = await Register.validar(
    razon,
    correo,
    celular,
    sector,
    rfc,
    date
  );
  if (valida.error) {
    responder(valida);
  }
  let comprobar = await Register.igual(correo, rfc);
  if (comprobar.error) {
    responder(comprobar);
  } else {
    let sav = await Register.guardar(
      razon,
      email,
      telefono,
      sector,
      rfc,
      password,
      date
    );
    responder(sav);
  }

  const responder = data => {
    res.json(data);
  };
});

module.exports = router;
