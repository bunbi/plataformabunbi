const express = require("express");
const passport = require("passport");
const router = express.Router();
const jwt = require("jsonwebtoken");
const error_types = require("../helpers/error_types");
const customMdw = require("../helpers/auth");
const Location = require('../models/Location');
const Imagen = require('../models/Image');
const Contact = require('../models/ContactoMarket');
const PublicImage = require('../models/PublicImage');
const Horario = require('../models/Horario');



router.get("/", (req, res) => {
  res.send("hola mundo");
});

router.post("/login", function (req, res, next) {
  passport.authenticate("local", { session: false }, function (error, user, inf) {
    if (error || !user) {
      next(new error_types.Error404(inf.message));
    } else {
      if (user.verifi) {
        const payload = {
          sub: user._id,
          exp: Math.floor(Date.now() / 1000) + (86400),
          username: user.email
        };
        const { JWT_ALGORITHM, JWT_SECRET } = process.env;
        const token = jwt.sign(JSON.stringify(payload), JWT_SECRET, {
          algorithm: JWT_ALGORITHM
        });
        res.json({ data: { token: token }, verifi: user.verifi });
      } else {
        res.json({ data: null, verifi: user.verifi });
      }

    }
  })(req, res, next);
});

router.get('/datauser', customMdw.ensureAuthenticated, async (req, res) => {
  try {
    var data = req.user;
    data.password = "a te creas prro que dijiste, ya lo hackie XD"
    const img = await Imagen.findOne({ user: req.user.id });
    const pubimg = await PublicImage.findOne({ user: req.user.id });
    let conts = await Contact.findOne({ user: req.user.id });
    if (conts == null) {
      conts = {
        socialNetwork: {}
      }
    }
    res.json({ data: data, image: img, error: false, public: conts, publicimg: pubimg });
  } catch (error) {

    res.json({ error: true, msg: 'Ocurrió un error con el servidor' })
  }
});


router.post('/geolocalizacion/:page', async (req, res, next) => {
  const { lat, log } = req.body
  try {
    if (!lat || !log) {
      res.json({ error: true, msg: 'Active su ubicación' })
    } else {
      var query = await Location.find({
        location: {
          $nearSphere: {
            $geometry: {
              type: "Point",
              coordinates: [log, lat]
            },
            $maxDistance: 23000
          }
        }
      });
      res.json({ error: false, query })
    }
  } catch (er) {
    console.log(er);
    res.json({ error: true, msg: 'Ocurrió un error con el servidor' })
  }
});

router.get('/market/public/:id', async (req, res) => {
  try {
    let id = req.params.id
    const imagPublic = await PublicImage.findOne({ user: id });
    const atencion = await Horario.findOne({ user: id });
    const pablic = await Contact.findOne({ user: id });
    res.json({ error: false, imagPublic, atencion, pablic })
  } catch (e) {
    console.log(e);
    res.json({ error: true, msg: 'Ocurrió un error con el servidor' })
  }
});

router.get('/data/user/private', customMdw.ensureAuthenticated, async (req, res) => {
  try {
    let datos = {
      email: req.user.email,
      rfc: req.user.rfc
    }
    res.json({ error: false, data: datos });
  } catch (error) {
    res.json({ error: true, msg: "Ocurrió un error con el servidor" });
  }
});
module.exports = router;

/*
    Location
      .find({
        location: {
          $nearSphere: {
            $geometry: {
              type: "Point",
              coordinates: [log, lat]
            },
            $maxDistance: 23000
          }
        }
      })
      .skip((perPage * page) - perPage)
      .limit(perPage)
      .exec((err, geoLoca) => {
        Location.countDocuments({
          location: {
            $nearSphere: {
              $geometry: {
                type: "Point",
                coordinates: [log, lat]
              },
              $maxDistance: 23000
            }
          }
        }, (err, count) => {
          if (err) {
            res.json({ error: true, msg: 'Error del servidor' })
            return next(err)
          } else {
            res.json({
              error: false,
              query: geoLoca,
              current: page,
              pages: Math.ceil(count / perPage)
            })
          }
        })
      })*/