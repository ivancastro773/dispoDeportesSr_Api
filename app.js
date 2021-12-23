const express = require("express");
const mysql = require("mysql");
var CronJob = require("cron").CronJob;
const dotenv = require("dotenv");
const { json } = require("express");
const cookie = require("cookie-parser");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const authController = require("./controllers/auth");
const webController = require("./controllers/webController");
const shiftController = require("./controllers/shiftList");
const db = require("./database");
const profileController = require("./controllers/profile");
const multer = require("multer");

dotenv.config({ path: "./.env" });

const app = express();

var storage = multer.diskStorage({
  destination: "public/img-place",
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
//configuracion de multer para subir el archivo
var upload = multer({
  storage: storage,
  dest: "public/img-place",
}).single("image");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(flash());
app.use(upload);
//configuracion para la subida de la imagen

//Motor de plantillas
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

//TAREA CRON PARA QUE CADA UN MES CREE OTRO MES DE TURNOS

var taskForCreate = new CronJob(
  "0 0 1 * *",
  function () {
    shiftController.insertDateChañaral();
  },
  null,
  true,
  "America/Argentina/Mendoza"
);

taskForCreate.start();

//TAREA CRON PARA QUE BORRE LOS TURNOS
var taskForDelete = new CronJob(
  "0 0 * * *",
  function () {
    shiftController.deleteDateChañaral();
  },
  null,
  true,
  "America/Argentina/Mendoza"
);

taskForDelete.start();

//TAREA CRON PARA QUE BORRE LOS TURNOS DE LISTA DE ESPERA
var taskForDeleteWL = new CronJob(
  "0 4 * * *",
  function () {
    shiftController.deleteTurnsWaitList();
  },
  null,
  true,
  "America/Argentina/Mendoza"
);

taskForDeleteWL.start();

//para usar el archivo css
app.use(express.static("public"));
app.use(express.static("node_modules"));
//para usar font awesome

//Defino las rutas
app.get("/", webController.viewHome);
app.get("/profile", authController.verifyToken, profileController.dataProfile);
app.use("/auth", require("./routes/auth"));
app.use("/sports", require("./routes/sports"));
app.use("/sports/place", require("./routes/place"));
app.use("/sports/generalfc", require("./routes/general"));
app.use("/information", require("./routes/informationPlace"));
app.use("/users", require("./routes/userAdmin"));

//Configuramos el puerto,  3000 o cualquiera que le asigne la maquina o el servidor
const PORT = process.env.PORT || 3000;

// La aplicacion escucha el puerto
app.listen(PORT, () => {
  console.log("Escuchando en el puerto " + PORT + "...");
});
