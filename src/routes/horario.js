const express = require("express");
const router = express.Router();
const customMdw = require("../helpers/auth");
const Horario = require('../models/Horario');

router.post('/horarios/new', customMdw.ensureAuthenticated, async (req, res) => {
    const { data } = req.body;
    try {
        if (!data[0].open || !data[0].close) {
            res.json({ error: true, msg: "Ingrese un dato" });
            return false;
        }
        const newHora = new Horario({
            diaPe: data,
            user: req.user.id
        });

        await newHora.save();
        res.json({ error: false, msg: "Datos agregados" });
    } catch (er) {
        console.log(er);
        res.json({ error: true, msg: "Error en el servidor" });
    }

});

router.put('/horarios/edit/:id', customMdw.ensureAuthenticated, async (req, res) => {
    const { data } = req.body;
    try {
        if (!data[0].open || !data[0].close) {
            res.json({ error: true, msg: "Ingrese un dato" });
            return false;
        }

        await Horario.findByIdAndUpdate(req.params.id, {
            diaPe: data
        });
        res.json({ error: false, msg: "Datos actualizados" });
    } catch (er) {
        console.log(err);
        res.json({ error: true, msg: "Error en el servidor" });
    }
})
router.get('/horarios/obtener', customMdw.ensureAuthenticated, async (req, res) => {
    try {
        let obtenerHorario = await Horario.findOne({ user: req.user.id });
        res.json({ error: false, obtenerHorario })
    } catch (err) {
        console.log(err);
        res.json({ error: true, msg: "Error en el servidor" })
    }
});

module.exports = router;