const express = require("express");
const router = express.Router();
const customMdw = require("../helpers/auth");
const MyUs = require('../models/MyUsers');

router.get('/myusers/:page', customMdw.ensureAuthenticated, async (req, res, next) => {
    let perPage = 6;
    let page = req.params.page || 1;
    try {
        MyUs
            .find({ user: req.user.id })
            .skip((perPage * page) - perPage)
            .limit(perPage)
            .exec((err, user) => {
                if (err) {
                    res.json({ error: true, msg: 'Error al obtener usuario' })
                    return next(err);
                }
                MyUs.countDocuments({ user: req.user.id }, (err, count) => {
                    if (err) {
                        res.json({ error: true, msg: 'Error al obtener usuarios' })
                        return next(err);
                    }
                    res.json({
                        error: false,
                        datos: user,
                        current: page,
                        pages: Math.ceil(count / perPage)
                    })
                });
            })
    } catch (e) {
        res.json({ error: true, msg: 'Error del servidor' })
    }
});

router.get('/myuser/getid/:id', customMdw.ensureAuthenticated, async (req, res) => {
    try {
        const myuserid = await MyUs.findById(req.params.id);
        res.json({ error: false, data: myuserid });
    } catch (e) {
        res.json({ error: true, msg: 'Error en ejecucion de consulta' });
    }
});

router.put('/myuser/update/:id', customMdw.ensureAuthenticated, async (req, res) => {
    try {
        const { username, access, role } = req.body;
        await MyUs.findByIdAndUpdate(req.params.id, { username, access, role })
    } catch (e) {
        res.json({ error: true, msg: 'Error en ejecucion de consulta' });
    }
});

router.post('/myusers/new-user', customMdw.ensureAuthenticated, async (req, res) => {
    try {
        const { email, password, confirm, username, access, role } = req.body;
        if (!email || !password || !confirm || !username || !role) {
            res.json({ error: true, msg: 'Todos los campos son obligatorios' });
            return false;
        } if (password != access) {
            res.json({ error: true, msg: 'La contraseña no coincide' });
            return false;
        } else {
            const newUs = new MyUs({
                email,
                password,
                username,
                access,
                role,
                emailuser: req.user.email,
                user: req.user.id
            });
            await newUs.save();
            res.json({ error: false, msg: 'Colaborador agregado' });
        }
    } catch (error) {
        console.log(error)
        res.json({ error: true, msg: 'Error en la consulta' });
    }

});

router.delete('/myusers/elimina/:id', customMdw.ensureAuthenticated, async (req, res) => {
    try {
        await MyUs.findByIdAndDelete(req.params.id);
        res.json({ error: false, msg: 'Exito' });
    } catch (error) {
        console.log(error);
        res.json({ error: true, msg: 'Error en la consulta' })
    }
});
module.exports = router;