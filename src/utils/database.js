const mongoose = require("mongoose");
const { DATABASECLUSTER, URL_LOCAL } = process.env;
const uri = `${DATABASECLUSTER}`;

mongoose
  .connect(uri, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })

  .then(db => console.log(`Conexión a ${process.env.URL_LOCAL} exítosa. `))
  .catch(err => console.error(err));
