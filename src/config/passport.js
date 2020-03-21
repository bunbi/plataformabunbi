const passport = require("passport");
const User = require("../models/User");
const LocalStrategy = require("passport-local").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      session: false
    },
    async (email, password, done) => {
      console.log("callback para estrategia local");
      const user = await User.findOne({ email: email });
      if (!user) {
        return done(null, false); //no existe
      } else {
        const match = await user.matchPassword(password);
        if (match) {
          return done(null, user); //si existe el usuario
        } else {
          return done(null, false); //el password no coincide
        }
      }
    }
  )
);

let opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWT_SECRET;
opts.algorithms = process.env.JWT_ALGORITHM;

passport.use(
  new JwtStrategy(opts, (jwt_payload, done) => {
    console.log("verificacion de estrategia jwt");
    User.findOne({ _id: jwt_payload.sub })
      .then(data => {
        if (data == null) {
          return done(null, false);
        } else {
          return done(null, data);
        }
      })
      .catch(err => done(err, null));
  })
);
