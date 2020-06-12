const express = require("express");
const router = express.Router();
const customMdw = require("../helpers/auth");
const lib = require('../class/validar');
const Contacto = require('../models/ContactoMarket');
const Location = require('../models/Location');
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
            msg: 'Error del servidor'
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
            res.json({ error: false, msg: 'Datos actualizados' })
        }
    } catch (er) {
        console.log(er);
        res.json({ error: true, msg: 'Error del servidor' })
    }
})
module.exports = router;