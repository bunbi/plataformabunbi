const express = require("express");
const path = require("path");
//var env = require("node-env-file"); // .env file
//env(__dirname + "/.env");
const bodyParser = require("body-parser");
const passport = require("passport");
const multer = require("multer");
const customMdw = require("./helpers/auth");
const app = express();

require("./utils/database");
require("./config/passport");
//config
app.set("port", process.env.PORT || 5000);
app.set("json spaces", 2);
//middlewares
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  res.header("Allow", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});
app.use(express.json());
app.use(
  multer({ dest: path.join(__dirname, "public/imgusers/temp") }).single("image")
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize());

//rutas
app.use("/api", require("./routes/index"));
app.use("/api", require('./routes/image'));
app.use(require('./routes/informacion'));
app.use("/api", require('./routes/horario'));
app.use("/apiv2", require('./routes/rescue'));
//static
app.use(express.static(path.join(__dirname, "public")));
//errors
app.use(customMdw.errorHandler);
app.use(customMdw.notFoundHandler);
//start server
app.listen(app.get("port"), () => {
  console.log("corriendo en el puerto ", app.get("port"));
});

/**
 * REACT_APP_HOSTBACKEND
https://bunbiapis.bunbi.com.mx
REACT_APP_HOSTREDIRECT
https://bunbicot.bunbi.com.mx/#/
 */