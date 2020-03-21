const mongoose = require("mongoose");
const { USER_DB, PASSWORD_DB, CONFI_CLUSTER } = process.env;
const uri = `mongodb+srv://${USER_DB}:${PASSWORD_DB}@cluster${CONFI_CLUSTER}`;

mongoose
  .connect(uri, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })

  .then(db => console.log(`Conexion a ${process.env.USER_DB} exitosa`))
  .catch(err => console.error(err));
