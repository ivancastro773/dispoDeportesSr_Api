const db = require("../database");

exports.userSanctioned = (req, res) => {
  console.log(req.body);
  const { name, id_users, id_place } = req.body;
  Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
  };

  var dateFormat = require("dateformat");
  var sanctionDay = new Date();
  var freeDay = sanctionDay.addDays(7);
  var santionDayFormat = dateFormat(sanctionDay, "yyyy-m-d"); //fecha actual
  var freeDayFormat = dateFormat(freeDay, "yyyy-m-d"); // fecha actual + 7 dias

  //Buscamos con el id_users el email para guardarlo en la lista de sanciones

  db.query(
    "SELECT `email` FROM `users` WHERE `id` = ?",
    id_users,
    (error, results) => {
      if (error) {
        console.log(error);
      }
      console.log("Busco el email");
      const email = Object.values(results[0]);
      console.log(email);

      //registra el usuario en la list de sancionados
      db.query(
        "INSERT INTO sanctionslist SET ?",
        {
          name: name,
          id_users: id_users,
          id_place: id_place,
          email: email,
          sanctionDay: santionDayFormat,
          freeDay: freeDayFormat,
        },
        (error, results) => {
          if (error) {
            console.log(error);
          } else {
            console.log("Se registro en la lista de sancionados");
            return res.status(200).json({
              message: "Usuario sancionado!",
            });
          }
        }
      );
    }
  );

  addUserSanctioned();

  function addUserSanctioned() {
    console.log("empezo el cronometro de sancion..");
    var t = setTimeout(sanction, 604800000, id_users);
  }

  function sanction(id_users) {
    db.query(
      "DELETE FROM `sanctionslist` WHERE `id_users` = ? LIMIT 1",
      id_users,
      (error, results) => {
        if (error) {
          console.log(error);
        }
        console.log("Usuario libre de sancion!");
      }
    );
  }
};

exports.allUserSanctioned = (req, res) => {
  var param = [req.params.id_place];

  //registra el usuario en la list de espera
  db.query(
    "SELECT * FROM `sanctionslist` WHERE `id_place` = ?",
    param,
    (error, results) => {
      if (error) {
        console.log(error);
      }
      res.status(200).json(results);
      console.log("Trae la lista de los sancionados");
    }
  );
};

exports.userFreeSanction = (req, res) => {
  var param = [req.params.id_place, req.params.id_users];

  db.query(
    "DELETE FROM `sanctionslist` WHERE `id_place` = ? and `id_users` = ?",
    param,
    (error, results) => {
      if (error) {
        console.log(error);
      }

      console.log(results);
      console.log("mando: " + param);
      return res.status(200).json({
        message: "Usuario libre de sancion!",
      });
    }
  );
};

exports.verifySanction = (req, res) => {
  console.log(req.params);
  var param = [req.params.id_place, req.params.id_users];
  //verifica si el usuario esta sancionado
  db.query(
    "SELECT `name` FROM `sanctionslist` WHERE `id_place` = ? and `id_users` = ?",
    param,
    (error, results) => {
      if (error) {
        console.log(error);
      }

      //Si no se encuentra en la lista
      if (results.length == 0) {
        console.log("No esta sancionado");
        return res.json({
          code: 0,
          message: "No se encuentra sancionado",
        });
      } else {
        console.log(results);
        console.log("Se encuentra sancionado");
        return res.status(200).json({
          code: 1,
          message: "Usted se encuentra sancionado",
        });
      }
    }
  );
};
exports.sanctionDays = (req, res) => {
  console.log(req.params);
  var param = [req.params.id_place, req.params.id_users];
  //verifica si el usuario esta sancionado
  db.query(
    "SELECT `sanctionDay`,`freeDay` FROM `sanctionslist` WHERE `id_place`= ? AND `id_users` = ?",
    param,
    (error, results) => {
      if (error) {
        console.log(error);
      }
      console.log(results);
      console.log("Se encuentra sancionado");
      return res.status(200).json(results[0]);
    }
  );
};
