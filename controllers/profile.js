const jwt = require("jsonwebtoken");
const db = require("../database");

exports.dataProfile = (req, res) => {
  let token = req.get("Authorization");
  const data = jwt.decode(token);
  console.log("Se decodifico el token");
  res.status(200).send(data);
};
exports.listUserAdmin = (req, res) => {
  db.query(
    'SELECT `email` FROM `users` WHERE `rol` = "admin"',
    (error, results) => {
      if (error) {
        console.log(error);
      }
      console.log("Busco todos los email de administradores");
      res.status(200).json(results);
    }
  );
};
