const express = require("express");
const passport = require("passport");
const router = express.Router();
const jwt = require("jsonwebtoken");
const error_types = require("../helpers/error_types");
const customMdw = require("../helpers/auth");

router.get("/", (req, res) => {
  res.send("hola mundo");
});

router.post("/login", function(req, res, next) {
  passport.authenticate("local", { session: false }, function(
    error,
    user,
    inf
  ) {
    if (error || !user) {
      next(new error_types.Error404("email or password not correct"));
    } else {
      console.log("generar token");
      const payload = {
        sub: user._id,
        exp: Date.now() + parseInt(43200),
        username: user.email
      };
      const { JWT_ALGORITHM, JWT_SECRET } = process.env;
      const token = jwt.sign(JSON.stringify(payload), JWT_SECRET, {
        algorithm: JWT_ALGORITHM
      });
      res.json({ data: { token: token } });
    }
  })(req, res, next);
});

router.get("/protect", customMdw.ensureAuthenticated, (req, res) => {
  res.send("pagina protegida");
});
module.exports = router;
