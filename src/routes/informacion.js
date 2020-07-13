const express = require("express");
const router = express.Router();
const passport = require("passport");
//midelware
const customMdw = require("../helpers/auth");
//modelos MongoDB
const Contacto = require('../models/ContactoMarket');
const Location = require('../models/Location');
const User = require('../models/User');
const Codigo = require('../models/Codigos');
//librerias
const error_types = require("../helpers/error_types");
const { validateEmail, sendEmai, validarRfc } = require('../utils/utils');
const lib = require('../class/validar');
const uid = require('uid');
const jwt = require("jsonwebtoken");

router.post('/update/public/info', customMdw.ensureAuthenticated, async (req, res) => {
    const { name, correo, tipe, red, social, telefono } = req.body;
    const { estado, municipio, colonia, calle, numero, id } = req.user;
    const direct = `${colonia} ${calle}, ${numero}, ${municipio} ${estado}`;
    try {
        let val = await lib.valida(name, correo, telefono);
        if (val.error) {
            res.json({
                error: true,
                msg: val.msg
            })
            return false;
        } else if ((red && !tipe) || (!red && tipe)) {
            res.json({ error: true, msg: 'Ingrese un tipo de red' })
            return false;
        }
        const newCont = new Contacto({
            correo: correo,
            name: name,
            telefono: telefono,
            socialNetwork: {
                ts: tipe,
                red: red
            },
            web: social,
            direccion: direct
        })
        newCont.user = id;
        await newCont.save();
        await Location.updateOne({ user: req.user.id }, { title: name });
        res.json({ error: false, msg: "Datos guardados con éxito " })
    } catch (e) {
        console.log(e);
        res.json({
            error: true,
            msg: 'Ocurrió un error con el servidor'
        })
    }
})

router.put('/update/infopublic/:id', customMdw.ensureAuthenticated, async (req, res) => {
    const { name, correo, tipe, red, social, telefono, lat, log, less } = req.body;
    const { estado, municipio, colonia, calle, numero, id } = req.user;
    const direct = `${colonia} ${calle}, ${numero}, ${municipio} ${estado}`;
    try {
        let busLocat = await Location.findOne({ user: req.user.id });
        let idLocation = busLocat ? busLocat._id : null;
        let val = await lib.valida(name, correo, telefono);
        if (val.error) {
            res.json({ error: true, msg: val.msg })
            return false;
        } else if ((red && !tipe) || (!red && tipe)) {
            res.json({ error: true, msg: 'Ingrese un tipo de red' })
            return false;
        } else {
            await Contacto.findByIdAndUpdate(req.params.id, {
                correo: correo,
                name: name,
                telefono: telefono,
                socialNetwork: {
                    ts: tipe,
                    red: red
                },
                web: social,
                direccion: direct
            });
            if (lat || log) {
                if (!busLocat) {
                    const newLoca = new Location({
                        location: {
                            coordinates: [log, lat]
                        },
                        less: less,
                        title: name,
                        user: req.user.id,
                    });
                    await newLoca.save();
                } else {
                    await Location.findByIdAndUpdate(idLocation, {
                        location: {
                            type: 'Point',
                            coordinates: [log, lat]
                        },
                        title: name,
                        less: less,
                    });
                }
            }
            res.json({ error: false, msg: 'Datos actualizados con éxito' })
        }
    } catch (er) {
        res.json({ error: true, msg: 'Ocurrió un error con el servidor' })
    }
});
/**
 * actualizar email
 */
router.put('/update/email', customMdw.ensureAuthenticated, async (req, res, next) => {
    const { nuevoem, email, password } = req.body;
    try {
        if (!nuevoem || !email || !password) {
            res.json({ error: true, msg: 'Ingrese los datos' });
            return false;
        } if (!validateEmail(nuevoem) || !validateEmail(email)) {
            res.json({ error: true, msg: 'Ingrese un correo electronico valido' });
            return false;
        } if (req.user.verifi === false) {
            res.json({ error: true, msg: 'Ya esta en proceso una verificacion' });
            return false;
        }
        if (email != req.user.email) {
            res.json({ error: true, msg: 'El correo electronico no coincide' });
            return false;
        } if (nuevoem === req.user.email) {
            res.json({ error: true, msg: 'El correo electronio es igual' });
            return false;
        }
        else {
            const comprobar = await User.findOne({ email: nuevoem });
            if (comprobar) {
                res.json({ error: true, msg: 'Correo electronico en uso' });
                return false;
            }
            passport.authenticate("local", { session: false }, async function (error, user, inf) {
                if (error || !user) {
                    //res.json({ error: true, msg: inf.message })
                    next(new error_types.Error404(inf.message));
                } else {
                    const payload = {
                        sub: user._id,
                        exp: Math.floor(Date.now() / 1000) + (1800),
                        username: user.email
                    };
                    const { JWT_ALGORITHM, JWT_SECRET } = process.env;
                    const token = jwt.sign(JSON.stringify(payload), JWT_SECRET, {
                        algorithm: JWT_ALGORITHM
                    });
                    await User.findByIdAndUpdate(req.user.id, {
                        email: nuevoem,
                        verifi: false
                    });
                    var cod = uid(32)
                    const tempCode = new Codigo({
                        email: nuevoem,
                        codigo: cod,
                        tipe: 'platform'
                    });
                    await tempCode.save();
                    const mensaje1 = `Visite este vínculo para verificar su dirección de correo electrónico.
                    ${process.env.HOSTRESEMAIL}/#/auth/updateemail/action?type=platform&code=${cod}&newemail=${nuevoem},
                    Si no solicito la verificación de esta dirección, ignore este correo electrónico`;
                    sendEmai(nuevoem, mensaje1, `Cambio de acceso a ${nuevoem} para BUNBi`)
                    const mensaje2 = `Su dirección de correo electrónico de acceso a los productos de BUNBi cambio a ${nuevoem}. 
                    Si no solicito el cambio de correo electrónico visite el siguiente vínculo para restablecer su correo electrónico. 
                    ${process.env.HOSTRESEMAIL}/#/auth/recover/action?type=platform&email=${email}&chance=${nuevoem}&key=${token}`;
                    sendEmai(email, mensaje2, `Cambio de acceso de ${email} a ${nuevoem} para BUNBi`)
                    res.json({ error: false, msg: `Enviamos un email de verificación a ${nuevoem}`, text: 'Verifica tu correo electronico' });
                }
            })(req, res, next);
        }
    } catch (error) {
        res.json({ error: true, msg: 'Ocurrió un error con el servidor' })
    }
});
/**
 * verificar actualizacion de email
 */
router.put('/update/email/change/:email/:code/:tipe', async (req, res) => {
    var updateEma = null;
    try {
        const { email, code, tipe } = req.params
        updateEma = await Codigo.findOne({ codigo: code }, { tipe });
        const info = await User.findOne({ email: email });
        if (!updateEma) {
            res.json({ error: true, msg: 'La solicitud de verificación de su correo electrónico caducó o ya se usó el vínculo' });
        } else {
            await User.findByIdAndUpdate(info._id, {
                verifi: true
            });
            await Codigo.findByIdAndDelete(updateEma._id);
            res.json({ error: false, msg: 'Se verificó su correo electrónico' });
        }
    } catch (e) {
        await Codigo.findByIdAndDelete(updateEma._id);
        res.json({ error: true, msg: 'Error al actualizar su correo electronico' })
    }
});
/**
 * segure para re-establecer el email
 */
router.put('/update/rescueme/email/:email/:remove', customMdw.ensureAuthenticated, async (req, res) => {
    try {
        const info = await User.findOne({ email: req.params.email });
        const nuevaResta = await User.findOne({ email: req.params.remove });
        if (info) {
            res.json({ error: true, msg: 'Error al actualizar su correo electronico' })
            return false;
        } else {
            await User.findByIdAndUpdate(nuevaResta._id, {
                email: req.params.email,
                verifi: true
            });
            res.json({ error: false, msg: 'Correo electronico actualizado' })
        }
    } catch (e) {
        res.json({ error: true, msg: 'Error al actualizar su correo electronico' })
    }
});


router.put('/update/password', customMdw.ensureAuthenticated, async (req, res) => {
    try {
        const { actual, newpass, confirm } = req.body
        const user = await User.findOne({ _id: req.user.id });
        if (!actual || !newpass || !confirm) {
            res.json({ error: true, msg: 'No se permiten campos vacíos ' });
            return false;
        }
        if (newpass != confirm) {
            res.json({ error: true, msg: 'Su contraseña no coincide ' });
            return false;
        }
        const match = await user.matchPassword(actual)
        if (!match) {
            res.json({ error: true, msg: 'Su contraseña es incorrecta' });
        } else {
            const changePass = new User({});
            changePass.password = await changePass.encryptPassword(newpass);
            await User.findByIdAndUpdate(req.user.id, {
                password: changePass.password
            });
            const mensaje = "Su contraseña para acceso a BUNBi y productos derivados actualizo correctamente "
            sendEmai(req.user.email, mensaje, "Actualización de contraseña BUNBi")
            res.json({ error: false, msg: 'Contraseña actualizada correctamente ' });
        }
    } catch (e) {
        res.json({ error: true, msg: 'Error al actualizar su contraseña' })
    }
});

router.put('/update/rfc', customMdw.ensureAuthenticated, async (req, res, next) => {
    try {
        const { password, email, nuevorfc } = req.body;

        if (!password || !email || !nuevorfc) {
            res.json({ error: true, msg: 'No se permiten campos vacíos' });
            return false;
        } if (nuevorfc == req.user.rfc) {
            res.json({ error: true, msg: 'Para actualizar debe cambiar su RFC' });
            return false;
        }
        if (!validateEmail(email)) {
            res.json({ error: true, msg: 'Su correo electrónico no es valido ' });
            return false;
        } if (!validarRfc(nuevorfc)) {
            res.json({ error: true, msg: 'Su RFC no es valido' });
            return false;
        } else {
            const verificar = await User.findOne({ rfc: nuevorfc });
            if (verificar) {
                res.json({ error: true, msg: 'Este RFC se encuentra en uso ' });
                return false;
            }
            else {
                passport.authenticate("local", { session: false }, async function (error, user, inf) {
                    if (error || !user) {
                        next(new error_types.Error404(inf.message));
                    } else {
                        await User.findByIdAndUpdate(req.user.id, {
                            rfc: nuevorfc
                        });


                        const mensaje = `Su RFC para BUNBi y productos derivados cambio a ${nuevorfc}. 
                        Si no solicito el cambio de RFC visite BUNBiplatform y en el panel actualize su contaseña y RFC`
                        sendEmai(req.user.email, mensaje, `Cambio de RFC a ${nuevorfc} para BUNBi`);
                        res.json({ error: false, msg: `RFC actualizado con exito a ${nuevorfc}`, text: 'Por favor reinicie su sesión' });
                    }
                })(req, res, next);
            }
        }
    } catch (e) {
        res.json({ error: true, msg: 'Error al actualizar su RFC' })
    }
});

router.post('/avr', customMdw.ensureAuthenticated, async (req, res) => {
    const { email, mensaje } = req.body;
    sendEmai(email, mensaje, "test para enviar msg");
})
module.exports = router;