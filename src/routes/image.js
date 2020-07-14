const express = require("express");
const router = express.Router();
const customMdw = require("../helpers/auth");
const cloudinary = require('cloudinary');
const Imagen = require('../models/Image');
const PublicImage = require('../models/PublicImage');
const Location = require('../models/Location');
const path = require("path");
const fs = require("fs-extra");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

router.put('/update/avatar/:id', customMdw.ensureAuthenticated, async (req, res) => {
    try {
        const ext = path.extname(req.file.originalname).toLowerCase();
        const size = req.file.size;
        const obtenerimagen = await Imagen.findOne({ user: req.user.id });
        if (ext != ".jpg" && ext != ".png" && ext != ".jpeg" && ext != ".JPEG" && ext != ".JPG" && ext != ".PNG") {
            await fs.unlink(req.file.path);
            res.json({ error: true, msg: "Formato de imagen no válido " });
            return false;
        } else if (size > 1000000) {
            await fs.unlink(req.file.path);
            res.json({
                error: true,
                msg: "La imagen no debe superar 1MB de tamaño",
            });
        } else {
            if (obtenerimagen.filename == "camara.jpg") {
                const result = await cloudinary.v2.uploader.upload(req.file.path)
                await Imagen.findByIdAndUpdate(req.params.id, {
                    filename: req.file.originalname,
                    ext: ext,
                    url: result.secure_url,
                    asset: result.asset_id,
                    public: result.public_id
                });
                await fs.unlink(req.file.path);
                res.json({ error: false, msg: "Imagen actualizada con éxito" });
                return false;
            } else {
                var name = obtenerimagen.public;
                const result = await cloudinary.v2.uploader.upload(req.file.path, { public_id: name, overwrite: true })
                await Imagen.findByIdAndUpdate(req.params.id, {
                    filename: req.file.originalname,
                    ext: ext,
                    url: result.secure_url,
                    asset: result.asset_id
                });
                await fs.unlink(req.file.path);
                res.json({ error: false, msg: "Imagen actualizada con éxito" });
            }
        }
    } catch (error) {
        console.log(error);
        await fs.unlink(req.file.path);
        res.json({ error: true, msg: "Ocurrió un error con el servidor " })
    }
})

router.post('/upload/publicimg', customMdw.ensureAuthenticated, async (req, res) => {
    try {
        const ext = path.extname(req.file.originalname).toLowerCase();
        const size = req.file.size;
        if (ext != ".jpg" && ext != ".png" && ext != ".jpeg" && ext != ".JPEG" && ext != ".JPG" && ext != ".PNG") {
            await fs.unlink(req.file.path);
            res.json({ error: true, msg: "Formato de imagen no válido" });
            return false;
        } else if (size > 2000000) {
            await fs.unlink(req.file.path);
            res.json({
                error: true,
                msg: "La imagen no debe superar 2MB de tamaño",
            });
            return false;
        } else {
            const result = await cloudinary.v2.uploader.upload(req.file.path)
            const uploadPublic = new PublicImage({
                filename: req.file.originalname,
                ext: ext,
                public: result.public_id,
                url: result.secure_url,
                asset: result.asset_id
            });
            uploadPublic.user = req.user.id;
            await uploadPublic.save();
            await fs.unlink(req.file.path);
            await Location.updateOne({ user: req.user.id }, { image: result.secure_url });
            res.json({ error: false, msg: "Imagen actualizada con éxito" });
        }
    } catch (error) {
        await fs.unlink(req.file.path);
        res.json({ error: true, msg: "Ocurrió un error con el servidor " })
    }
});

router.put('/update/publicImage/:id', customMdw.ensureAuthenticated, async (req, res) => {
    try {
        const ext = path.extname(req.file.originalname).toLowerCase();
        const size = req.file.size;
        const esta = await PublicImage.findOne({ user: req.user.id });
        if (ext != ".jpg" && ext != ".png" && ext != ".jpeg" && ext != ".JPEG" && ext != ".JPG" && ext != ".PNG") {
            await fs.unlink(req.file.path);
            res.json({ error: true, msg: "Formato de imagen no válido" });
            return false;
        } else if (size > 2000000) {
            await fs.unlink(req.file.path);
            res.json({
                error: true,
                msg: "La imagen no debe superar 2MB de tamaño",
            });
            return false;
        } else {
            var name = esta.public;
            const result = await cloudinary.v2.uploader.upload(req.file.path, { public_id: name, overwrite: true })
            await PublicImage.findByIdAndUpdate(req.params.id, {
                filename: req.file.originalname,
                ext: ext,
                url: result.secure_url,
                asset: result.asset_id
            });

            await fs.unlink(req.file.path);
            await Location.updateOne({ user: req.user.id }, { image: result.secure_url });
            res.json({ error: false, msg: "Imagen actualizada con éxito" });
        }
    } catch (error) {
        await fs.unlink(req.file.path);
        res.json({ error: true, msg: "Ocurrió un error con el servidor " })
    }
})
module.exports = router;