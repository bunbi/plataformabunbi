const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Cod = require('../models/Codigos');


router.put('/update/:email', async (req, res) => {
    const { password, confirm_password, codigo } = req.body;
    const mail = req.params.email;
    const confirm = await Cod.findOne({ email: mail });
    const emailUser = await User.findOne({ email: mail });
    if (!confirm) {
        res.json({ 'error': 'Este código no existe' });
        return false;
    }
    if (!emailUser) {
        res.json({ 'error': 'Este correo no existe' });
        return false;
    }
    if (!password || !confirm_password || !codigo) {
        res.json({ 'error': 'Campos requeridos' });
        return false;
    }
    if (password != confirm_password) {
        res.json({ 'error': 'Las contraseñas con coinciden' });
        return false;
    } if (confirm.codigo != codigo) {
        res.json({ 'error': 'Código invalido' });
        return false;
    } else {
        var idc = confirm._id;
        var datos = emailUser._id;
        const enpass = new User({});
        enpass.password = await enpass.encryptPassword(password)
        const correcto = enpass.password;
        await User.findByIdAndUpdate(datos, { password: correcto });
        await Cod.findByIdAndDelete(idc);
        res.json({ 'estado': 'Password actualizado' })
    }
});
module.exports = router;