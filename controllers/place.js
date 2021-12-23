const db = require("../database");
const multer = require("multer");
const fs = require("fs-extra");
const cloudinary = require("cloudinary");
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
function calcTime(city, offset) {
  // creamos el objeto Date (la selecciona de la máquina cliente)
  d = new Date();

  // lo convierte  a milisegundos
  // añade la dirferencia horaria
  // recupera la hora en formato UTC
  utc = d.getTime() + d.getTimezoneOffset() * 60000;

  // crea un nuevo objeto Date usando la diferencia dada.
  nd = new Date(utc + 3600000 * offset);
  console.log("La hora actual en " + city + " es: " + nd.getHours());
  // devuelve la hora como string.
  return nd.getHours();
}
exports.addPhoto = (req, res) => {
  console.log(req.file);
  res.send("imagen subida");
};
exports.userPlace = (req, res) => {
  const id_user = req.params.id_user;
  console.log("busco el complejo del usuario: " + id_user);
  db.query(
    "SELECT `id`,`id_sports`,`name` FROM `place` WHERE `id_users` = ?",
    id_user,
    (error, results) => {
      if (error) {
        console.log(error);
      }
      console.log("Busco id del complejo y el id_sports");
      res.status(200).json(results[0]);
    }
  );
};
exports.getName = (req, res) => {
  const id_place = req.params.id;
  db.query(
    "SELECT `name` FROM `place` WHERE `id` = ?",
    id_place,
    (error, results) => {
      if (error) {
        console.log(error);
      }
      console.log("lo busco al nombre " + id_place);
      res.status(200).json(results[0]);
    }
  );
};
exports.placeData = (req, res) => {
  const id = req.params.id;
  console.log("busco el " + id);
  db.query(
    "SELECT `id`,`name`,`description`,`address`,`phone`,`image_url`,`img_id` FROM `place` WHERE `id` = ?",
    id,
    (error, results) => {
      if (error) {
        console.log(error);
      }
      console.log("Busco los datos del complejo");
      res.status(200).json(results[0]);
    }
  );
};

exports.cantCourtsPlace = (req, res) => {
  const id = req.params.id;
  console.log("busco la cantidad de canchas del complejo: " + id);
  db.query(
    "SELECT `cant_courts` FROM `place` WHERE id = ?",
    id,
    (error, results) => {
      if (error) {
        console.log(error);
      }
      res.status(200).json(results[0]);
    }
  );
};
exports.editInfoPlace = (req, res) => {
  console.log(req.body);

  var param = [({ description, address, phone } = req.body), req.params.id];

  //actualiza la informacion del complejo
  db.query(
    "UPDATE `place` SET ? WHERE `place`.`id` = ?",
    param,
    (error, results) => {
      if (error) {
        return console.log(error);
      }
      console.log("Actualizo la informacion de su complejo");
      res.sendStatus(200);
    }
  );
};
exports.saveImage = async (req, res) => {
  console.log(req.file);
  console.log(req.body.id);
  //sube la foto a cloudinary
  const data_cloud_img = await cloudinary.v2.uploader.upload(req.file.path);
  const image_url = data_cloud_img.secure_url;
  const img_id = data_cloud_img.public_id;
  var param = [image_url, img_id, req.body.id];
  db.query(
    "SELECT `img_id` FROM `place` WHERE `place`.`id` = ?",
    req.body.id,
    async (error, results) => {
      if (error) {
        console.log(error);
      }
      if (results[0].img_id != null) {
        const idimg_delete = results[0].img_id;
        await cloudinary.v2.uploader.destroy(idimg_delete);
        console.log("Imagen borrada");
      }
      //guardo la url de la imagen y su id en la bd
      db.query(
        "UPDATE `place` SET `image_url` = ?, `img_id` = ? WHERE `place`.`id` = ?",
        param,
        (error, results) => {
          if (error) {
            console.log(error);
          }
          console.log("guardo los datos en la bd");
        }
      );
    }
  );
  //borro la foto de mi servidor
  await fs.unlink(req.file.path);
  res.sendStatus(200);
};
