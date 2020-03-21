const express = require("express");
var env = require("node-env-file"); // .env file
env(__dirname + "/.env");
const bodyParser = require("body-parser");
const passport = require("passport");
const customMdw = require("./helpers/auth");
const app = express();

require("./utils/database");
require("./config/passport");
//config
app.set("port", process.env.PORT);
app.set("json spaces", 2);
//middlewares
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize());

//rutas
app.use("/api", require("./routes/index"));
//errors

app.use(customMdw.errorHandler);
app.use(customMdw.notFoundHandler);
//start server
app.listen(app.get("port"), () => {
  console.log("corriendo en el puerto ", app.get("port"));
});
