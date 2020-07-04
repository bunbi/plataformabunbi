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
const { validateEmail, sendEmai } = require('../utils/utils');
const lib = require('../class/validar');
const uid = require('uid');
const jwt = require("jsonwebtoken");
/*
const userID = ['5ec48fbacfa7c02d981edcd2', "5e829b49bdcb0546d42e531d", "5e961c4737302a3cf02b474a", "5e962a1774a07528301364b1", "5eb09e06ea1ffa35ac9621f0", "5ebdf70687e7123fe87c2d9b", "5ebed7ff0e0f7c3fa0b45408", "5ebeda910e0f7c3fa0b4540e", "5e4c76548bd8bb06c835b1c9"];
const coor = [[-98.10382179999999, 19.432231599999998], [-97.795068, 19.433503], [-97.821077, 19.399470], [-97.785801, 19.454153], [-97.918409, 19.307770], [-98.141548, 19.409818], [-106.158821, 25.218195], [-107.183497, 40.088857], [-98.10382179999999, 19.432231599999998]]

for (let i = 0; i < userID.length; i++) {
    let newLocal = new Location({
        user: userID[i],
        location: {
            coordinates: coor[i]
        }
    });
    newLocal.save((err, message) => {
        if (err) console.log(err);
        console.log(message);
    });
}*/



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
            res.json({ error: true, msg: 'Ingrese una red' })
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
        res.json({ error: false, msg: "Datos guardados" })
    } catch (e) {
        console.log(e);
        res.json({
            error: true,
            msg: 'Error en el servidor'
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
            res.json({ error: true, msg: 'Ingrese una red' })
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
            res.json({ error: false, msg: 'Datos actualizados' })
        }
    } catch (er) {
        console.log(er);
        res.json({ error: true, msg: 'Error en el servidor' })
    }
});
/**
 * actualizar email
 */
router.put('/update/email', customMdw.ensureAuthenticated, async (req, res, next) => {
    const { nuevoem, email, password } = req.body;
    try {
        const comprobar = await User.findOne({ email: nuevoem });
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
        } if (comprobar) {
            res.json({ error: true, msg: 'Correo electronico en uso' });
            return false;
        } if (nuevoem === req.user.email) {
            res.json({ error: true, msg: 'El correo electronio es igual' });
            return false;
        }
        else {
            passport.authenticate("local", { session: false }, async function (error, user, inf) {
                if (error || !user) {
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
                    res.json({ error: false, msg: 'Enviamos un email de verificación', text: 'Verifica tu correo electronico' });
                }
            })(req, res, next);
        }
    } catch (error) {
        res.json({ error: true, msg: 'Error del servidor' })
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
            res.json({ error: true, msg: 'La solicitud de verificación de tu correo electrónico caducó o ya se usó el vínculo' });
        } else {
            await User.findByIdAndUpdate(info._id, {
                verifi: true
            });
            await Codigo.findByIdAndDelete(updateEma._id);
            res.json({ error: false, msg: 'Se verificó tu correo electrónico' });
        }
    } catch (e) {
        await Codigo.findByIdAndDelete(updateEma._id);
        res.json({ error: true, msg: 'Error al actualizar tu correo electronico' })
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
            res.json({ error: true, msg: 'Error al actualizar tu correo electronico' })
            return false;
        } else {
            await User.findByIdAndUpdate(nuevaResta._id, {
                email: req.params.email,
                verifi: true
            });
            res.json({ error: false, msg: 'Correo electronico actualizado' })
        }
    } catch (e) {
        res.json({ error: true, msg: 'Error al actualizar tu correo electronico' })
    }
});


router.put('/update/password', customMdw.ensureAuthenticated, async (req, res) => {
    try {
        const { actual, newpass, confirm } = req.body
        const user = await User.findOne({ _id: req.user.id });
        if (!actual || !newpass || !confirm) {
            res.json({ error: true, msg: 'Campos vacios' });
            return false;
        }
        if (newpass != confirm) {
            res.json({ error: true, msg: 'Las contraseñas no coinciden' });
            return false;
        }
        const match = await user.matchPassword(actual)
        if (!match) {
            res.json({ error: true, msg: 'Contraseña incorrecta' });
        } else {
            const changePass = new User({});
            changePass.password = await changePass.encryptPassword(newpass);
            await User.findByIdAndUpdate(req.user.id, {
                password: changePass.password
            });
            sendEmai(req.user.email,)
            res.json({ error: false, msg: 'Contraseña actualizada' });
        }
    } catch (e) {
        res.json({ error: true, msg: 'Error al actualizar tu contraseña' })
    }
})

router.get('/avr', async (req, res) => {
    console.log(req.headers)
})
module.exports = router;