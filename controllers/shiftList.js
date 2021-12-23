const db = require('../database');
const date = require('date-and-time');
const Timer = require('timer-node');
const { json } = require('express');
//const ChanaralTurn = require('../controllers/ChanaralTurn');
const admin = require('../firebase-config');
const { name } = require('ejs');
const { end } = require('../database');
var t = 0;


function calcTime(city, offset) {
    // creamos el objeto Date (la selecciona de la máquina cliente)
    d = new Date();

    // lo convierte  a milisegundos
    // añade la dirferencia horaria
    // recupera la hora en formato UTC
    utc = d.getTime() + (d.getTimezoneOffset() * 60000);

    // crea un nuevo objeto Date usando la diferencia dada.
    nd = new Date(utc + (3600000 * offset));
    console.log("La hora actual en " + city + " es: " + nd.getHours())
    // devuelve la hora como string.
    return nd.getHours();
}

function theNameTable(id_place) {
    return new Promise((resolve, reject) => {
        var name = "";
        console.log(id_place);

        db.query('SELECT `name_table` FROM `placestables` WHERE `id_place` = ?', id_place, (error, results) => {

            if (error) {
                console.log(error);
            }

            if (results == "") {
                resolve("");
            }else{
                name = Object.values(results[0]);
                console.log("tabla: " + name[0]);
                resolve(name[0]);
            }
        });
    });
}
function searchBloquedCourt(id_place) {
    return new Promise((resolve, reject) => {
        var param = [
            id_place
        ]
         //const courtNumber = req.params.courtNumber;
    
        //Busca que cancha esta bloqueada
       db.query('SELECT `courtNumber` FROM `blockedcourt` WHERE `id_place`= ?', param, (error,results) => {
           if(error){
               console.log(error);
               reject(error);
           }else{
               console.log("busco la cancha bloqueada");
               resolve(results);
           }
       });
    });
}

function theNameTableWL(id_place) {
    return new Promise((resolve, reject) => {
        var name = "";
        console.log(id_place);

        db.query('SELECT `name_table` FROM `placeswlist` WHERE `id_place` = ?', id_place, (error, results) => {

            if (error) {
                console.log(error);
            }

            name = Object.values(results[0]);
            console.log("tabla de lista de espera: " + name[0]);
            resolve(name[0]);

            if (name == "") {
                reject('hubo un error');
            }
        });
    });

}
function searchNameTablesAndSize() {
    return new Promise((resolve, reject) => {
        var places = [];

        db.query('SELECT `name_table` FROM `placestables` UNION SELECT COUNT(id) FROM placestables', (error, results) => {

            if (error) {
                console.log(error);
            }
            places.push(results);
            console.log(places);
            resolve(places[0]);
            if (places.length == 0) {
                reject('hubo un error');
            }
        });
    });

}
function searchNameTablesWLAndSize() {
    return new Promise((resolve, reject) => {
        var places = [];

        db.query('SELECT `name_table` FROM `placeswlist` UNION SELECT COUNT(id) FROM placeswlist', (error, results) => {

            if (error) {
                console.log(error);
            }
            places.push(results);
            console.log(places);
            resolve(places[0]);
            if (places.length == 0) {
                reject('hubo un error');
            }
        });
    });

}
function searchAllTurnUser(param) {
    return new Promise((resolve, reject) => {
        var valuesQuery = [];
        valuesQuery = param;

        db.query('SELECT * FROM ?? WHERE `id_users` = ? AND `date` = CURRENT_DATE() AND `departureTime` > ? UNION SELECT * FROM ?? WHERE `id_users` = ? AND `date` > CURRENT_DATE()', param, (error, results) => {

            if (error) {
                console.log(error);
                reject(error);
            }

            
            console.log("entro a la fc");
            if (results == "") {
                console.log("no hay turnos");
                resolve("");
            } else {
                console.log("ENCONTRO");
        
                console.log(results);
                resolve(results);
            }
        });


    });

}
function cantPlaces() {
    return new Promise((resolve, reject) => {
        var places = [];

        db.query('SELECT id FROM place', (error, results) => {

            if (error) {
                console.log(error);
            }
            places.push(results);
            console.log(places);
            resolve(places[0]);
            if (places.length == 0) {
                reject('hubo un error');
            }
        });
    });

}
function cantCourtsById(id) {
    return new Promise((resolve, reject) => {
        var cant = 0;
        var id_place = id;
        console.log(id_place);
        db.query('SELECT `cant_courts` FROM place WHERE `id`=?', id_place, (error, results) => {

            if (error) {
                console.log(error);
            }
            cant = results;
            console.log("cantidad: " + cant[0].cant_courts);
            resolve(cant[0].cant_courts);
            if (cant == 0) {
                reject('hubo un error');
            }
        });
    });
}
function sum(a, b) {
    var num1 = parseInt(a);
    var num2 = parseInt(b);
    var res = num1 + num2;
    return res;
}
function addNewShiftsList(id, numberCourt) {
    return new Promise((resolve, reject) => {
        var id_place = id;
        var numberToAdd = numberCourt;
        console.log("idPlace: " + id_place);
        console.log("agregar: " + numberToAdd);
        db.query('SELECT `cant_courts` FROM `place` WHERE `id` = ?', id_place, (error, results) => {

            if (error) {
                console.log(error);
            }
            console.log("Cantidad total: " + results[0].cant_courts);
            var total = results[0].cant_courts;
            var totalNewCourt = sum(total, numberToAdd);
            console.log("el complejo ahora tiene: " + totalNewCourt);
            if (total < totalNewCourt) {
                var param = [
                    totalNewCourt,
                    id_place
                ]
                db.query('UPDATE `place` SET `cant_courts` = ? WHERE `place`.`id` = ?', param, (error, results) => {

                    if (error) {
                        console.log(error);
                    }
                    console.log("Cancha agregada");
                    resolve(total);
                    if (numberToAdd == 0) {
                        reject("ERROR");
                    }
                });
            }
        });
    });
}
function verifUserWl(param) {
    return new Promise((resolve, reject) => {
        var parambd = param;

        db.query('SELECT `id` FROM ?? WHERE `id_users` = ? AND `id_court` = ? AND `date` = ? ', parambd, (error, results) => {
            if (error) {
                console.log(error);
                reject(error);
            }
            console.log(results);
            resolve(results);  
        });
    });
}
function verifUserForDelete(param) {
    return new Promise((resolve, reject) => {
        var parambd = param;

        db.query('SELECT `id_users` FROM ?? WHERE `id` = ? ', parambd, (error, results) => {
            if (error) {
                console.log(error);
                reject(error);
            }
            console.log(results);
            resolve(results);  
        });
    });
}

exports.allTurnsBusy = async (req, res) => {
    var id_place = req.params.id_place;
    var courtNumber = req.params.courtNumber;
    var today2 = new Date();
    var currentHour = today2.getHours();
    console.log("hora actual: " + today2.getHours());
    const table = await theNameTable(id_place);
    console.log("tabla seleccionada: " + table);
    var param = [
        table,
        courtNumber,
        currentHour
    ]

    db.query('SELECT * FROM ?? WHERE `courtNumber` = ? and `date` = CURRENT_DATE() and `departureTime` > ? and `status` = "Ocupado" ', param, (error, results) => {

        if (error) {
            console.log(error);
        }
        console.log("entro");
        res.status(200).json(results);
    });
}

exports.turnRegister = async (req, res) => {
    console.log(req.body);
    var { id_users, name, status, date } = req.body;
    const id_maxTurn = req.body.id_users;
    const nlist = req.params.nlist;
    const table = await theNameTable(req.params.id_place);
    const tablewl = await theNameTableWL(req.params.id_place);
    console.log("tabla seleccionada: " + table);
    console.log("tabla WL seleccionada: " + tablewl);
    if (id_users == 0) {
        id_users = null;
    }
    var param1 = [
        table,
        req.params.id
    ]

    var param2 = [
        table,
        id_maxTurn,
        date
    ]

    var param3 = [
        table,
        { id_users, name, status },
        req.params.id
    ]
    var param4 = [
        tablewl,
        id_users,
        req.params.id, 
        date
    ]
    if (nlist == 1) {
        var verification = await verifUserWl(param4);
        if (verification == "") {
            return res.status(200).json({
                code: 0,
                message: 'Su tiempo expiró!'
            })
        }
    }

    //selecciona el turno
    db.query('SELECT `status` FROM ?? WHERE `id` = ? LIMIT 1', param1, (error, results) => {
        if (error) {
            console.log(error);
        }

        //Buscamos el estado
        const status = Object.values(results[0]);
        const free = "Disponible";
        const busy = "Ocupado";
        console.log("N° LISTA: " + nlist);

        //verificamos si el turno esta ocupado o no.
        if (free == status | nlist == 1) {

            //Verifica que por persona pueda pedir dos turnos nada mas.
            db.query('SELECT COUNT(id_users) FROM ?? WHERE `id_users` = ? AND `date` = ?', param2, (error, results) => {
                if (error) {
                    console.log(error);
                } else {
                    console.log(Object.values(results[0]));
                    const array = Object.values(results[0]);

                    if (array[0] == 2) {
                        console.log("No puede pedir mas turnos");
                        return res.status(200).json({
                            code: 1,
                            message: 'Ya no puede reservar mas turnos!'
                        });
                    } else {
                        //registra el turno
                        db.query('UPDATE ?? SET ? WHERE `id` = ?', param3, (error, results) => {
                            if (error) {
                                console.log(error);
                            } else {
                                console.log("Se reservo el turno");
                                return res.status(200).json({
                                    code: 1,
                                    message: 'Turno concedido!'
                                })
                            }
                        });
                    }
                }
            });
        } else {
            console.log("Turno ocupado");
            return res.json({
                code: 0,
                message: "Lo sentimos, se encuentra ocupado!"
            })
        }

    });
}

exports.turnWaitList = async (req, res) => {
    console.log(req.body);
    const num2 = 2;
    const { id_court, id_users, id_place, date, courtNumber, entryTime, departureTime, name, tokenIdPhone } = req.body;
    
    const id_verifCourt = req.body.id_court;
    const id_verifUser = req.body.id_users;
    console.log("id_place---", id_place)
    const table = await theNameTable(id_place);
    const tablewl = await theNameTableWL(id_place);
    console.log("tabla seleccionada: " + table);

    //arrays para cada una de las consultas
    var param1 = [
        table,
        id_court
    ]
    var param2 = [
        table,
        id_verifCourt,
        id_verifUser
    ]
    var param3 = [
        tablewl,
        id_court
    ]
    var param4 = [
        tablewl,
        id_users
    ]

    var param5 = [
        tablewl,
        { id_court, id_users, id_place, date, courtNumber, entryTime, departureTime, name, tokenIdPhone }
    ]

    db.query('SELECT `id_users` FROM ?? WHERE `id` = ?', param1, (error, results) => {
        if (error) {
            console.log(error);
        }
        const emptynum = Object.values(results[0]);
        if (emptynum == "") {

            return res.status(200).json({
                code: 0,
                message: 'El turno esta Libre Resérvalo.'
            });
        } else {
            db.query('SELECT `id` FROM ?? WHERE `id` = ? AND `id_users` = ?', param2, (error, results) => {
                if (error) {
                    console.log(error);
                }
                if (results[0] != null) {
                    console.log("este usuario ya tiene el turno");
                    return res.status(200).json({
                        code: 0,
                        message: 'Usted ya tiene el turno asignado!'
                    });
                } else {

                    db.query('SELECT COUNT(id_court), id_users FROM ?? WHERE `id_court` = ?', param3, (error, results) => {
                        if (error) {
                            console.log(error);
                        }
                        console.log(Object.values(results[0]));
                        const array = Object.values(results[0]);

                        //verifica que por cancha solo pueden a ver 2 usuarios anotados.
                        if (array[0] == num2) {
                            return res.status(200).json({
                                code: 0,
                                message: "Lo siento, lista de espera completa"
                            });

                            //verifica si el usuario se quiere volver a anotar en una lista donde ya estaba anotado.
                        } else if (array[1] == id_users) {
                            return res.json({
                                code: 0,
                                message: "ya se encuentra anotado."
                            })
                        }
                        else {

                            db.query('SELECT COUNT(id) FROM ?? WHERE `id_users` = ?', param4, (error, results) => {

                                if (error) {
                                    console.log(error);
                                }

                                //verifica el limite que tiene el usuario para anotarse(2)
                                if (Object.values(results[0]) == num2) {
                                    return res.status(200).json({
                                        code: 0,
                                        message: "No puede reservar mas turnos"
                                    })
                                } else {
                                    //registra el turno en la lista de espera
                                    db.query('INSERT INTO ?? SET ?', param5, (error, results) => {
                                        if (error) {
                                            console.log(error);
                                        } else {
                                            console.log("Se registro en la lista de espera");
                                            return res.status(200).json({
                                                code: 1,
                                                message: 'Se registró correctamente!'
                                            })
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
    //registra el turno
}
//BORRAR PORQUE NO SE USA
exports.cancelTurn = (req, res) => {
    console.log(req.body);
    const { id_users, name, status } = req.body;
    var param = [
        { id_users, name, status },
        req.params.id
    ]
    const id = req.params.id;
    db.query('SELECT `status` FROM `chanaral` WHERE `id` = ?', id, (error, results) => {
        if (error) {
            console.log(error);
        }
        //Buscamos el estado
        const status = Object.values(results[0]);
        const busy = "Ocupado";
        //verificamos si el turno esta ocupado o no.
        if (busy == status) {
            //cancela el turno
            db.query('UPDATE `chanaral` SET ? WHERE `chanaral`.`id` = ?', param, (error, results) => {
                if (error) {
                    console.log(error);
                } else {
                    return res.status(200).json({
                        code: 1,
                        message: 'Turno cancelado!'
                    })
                }
            });
        } else {
            return res.json({
                code: 0,
                message: 'El turno esta disponible!'
            })
        }
    });
}

exports.searchWaitList = async (req, res) => {
    console.log(req.body);

    const { id_place, date, entryTime, departureTime, courtNumber, id_court } = req.body;
    const table = await theNameTable(id_place);
    const tablewl = await theNameTableWL(id_place);
    console.log("tabla seleccionada: " + table);
    console.log("tabla WL seleccionada: " + tablewl);

    var param1 = [
        tablewl,
        id_court
    ]
    var param2 = [
        table,
        id_court
    ]
    //busca si hay alguien anotado en la lista
    db.query('SELECT `id`,`tokenIdPhone` FROM ?? WHERE `id_court` = ? LIMIT 1', param1, async (error, results) => {
        if (error) {
            console.log(error);
        }

        if (results.length === 0) {
            console.log("No hay usuarios anotados en la lista");
            db.query('UPDATE ?? SET `id_users` = NULL, `name` = "", `status` = "Disponible" WHERE `id` = ?', param2, (error, results) => {

                if (error) {
                    console.log(error);
                }
                console.log("Disponible el turno-no hay usuarios esperando");
            });
            return res.status(200).json({ message: "no" });

        } else {

            db.query('UPDATE ?? SET `id_users` = NULL, `status` = "Ocupado" WHERE `id` = ?', param2, (error, results) => {

                if (error) {
                    console.log(error);
                }
                console.log("el turno sigue ocupado, esperando respuesta");
            });

            console.log(Object.values(results[0]));
            const arraynotif = Object.values(results[0]);
            const num_id_waitlist = arraynotif[0];
            var id_waitlist = num_id_waitlist.toString();
            const tokenIdPhone = arraynotif[1];


            //opciones de la notificacion 
            const options = {
                priority: "high",
                timeToLive: 60 * 60 * 24,
            };
            console.log("FECHA: " + date)
            //payload con la configuracion de la notificacion 
            const payload = {
                notification: {
                    title: 'Turno Disponible',
                    body: '¿Desea reservar la cancha?',
                    click_action: '.TurnWaitListActivity',
                },
                "data": {
                    "id_place": id_place,
                    "date": date,
                    "entryTime": entryTime,
                    "departureTime": departureTime,
                    "courtNumber": courtNumber,
                    "id_court": id_court,
                    "id_waitlist": id_waitlist
                }
            };

            //envio la notificacion
            await admin.messaging().sendToDevice(tokenIdPhone, payload, options)
                .then(function (response) {
                    console.log('Se envio correctamente la notificacion!!', response);
                    expiredTime(id_place, date, entryTime, departureTime, courtNumber, id_court, table, tablewl);
                })
                .catch(function (error) {
                    console.log('Error sending message:', error);
                });
        }
        return res.status(200).json({ message: "anduvo" });
    });
}

exports.userTurns = async (req, res) => {
    var currentHour = calcTime("argentina", "-3");
    console.log("hora actual: " + currentHour);
    var tablesAndSize = [];
    //obtengo los nombres de las tablas y la cantidad de tablas
    tablesAndSize = await searchNameTablesAndSize();
    var departureTime2 = currentHour;
    var turnUser = [];

    for (var i = 0; i < tablesAndSize.length - 1; i++) {
        var table = tablesAndSize[i].name_table;
        console.log(tablesAndSize[i].name_table);
        var endFor = parseInt(tablesAndSize.length);
        var num = 2;

        var param = [
            table,
            req.params.id_users,
            departureTime2,
            table,
            req.params.id_users
        ]

        var shifts = await searchAllTurnUser(param);
        console.log("FOR");
        if (shifts == "") {
            console.log("no hay turnos");
        } else {
            console.log(turnUser.concat(shifts));
            turnUser = turnUser.concat(shifts);
        }

        if (i == (endFor - num)) {
            console.log("termino el for");
            res.status(200).json(turnUser);
        }
    }
}

exports.userTurnsWaitList = async (req, res) => {
    var currentHour = calcTime("argentina", "-3");
    console.log("hora actual: " + currentHour);
    var tablesAndSize = [];
    //obtengo los nombres de las tablas y la cantidad de tablas
    tablesAndSize = await searchNameTablesWLAndSize();
    var departureTime2 = currentHour;
    var turnUser = [];

    for (var i = 0; i < tablesAndSize.length - 1; i++) {
        var table = tablesAndSize[i].name_table;
        console.log(tablesAndSize[i].name_table);
        var endFor = parseInt(tablesAndSize.length);
        var num = 2;

        var param = [
            table,
            req.params.id_users,
            departureTime2,
            table,
            req.params.id_users
        ]

        var shifts = await searchAllTurnUser(param);
        console.log("FOR");
        if (shifts == "") {
            console.log("no hay turnos");
        } else {
            console.log(turnUser.concat(shifts));
            turnUser = turnUser.concat(shifts);
        }

        if (i == (endFor - num)) {
            console.log("termino el for");
            res.status(200).json(turnUser);
        }
    }
}

exports.cancelTurnsWaitList = async (req, res) => {
    const tablewl = await theNameTableWL(req.params.id_place);
    console.log("tabla WL seleccionada: " + tablewl);
    var param = [
        tablewl,
        req.params.id
    ]
    var verification = await verifUserForDelete(param);
    if (verification == "") {
        return res.status(200).json({
            code: 0,
            message: 'Su tiempo expiró!'
        })
    }else{
        db.query('DELETE FROM ?? WHERE `id` = ?', param, (error, results) => {

            if (error) {
                console.log(error);
            }
            console.log("mando: " + param);
            console.log(results);
            return res.status(200).json({
                code: 1,
                message: 'Turno cancelado!'
            })
        });
    }
   
}

function expiredTime(id_place, date, entryTime, departureTime, courtNumber, id, table, tablewl) {
    //Esta funcion es para cuando se pasa el tiempo 5 min para contestar sino pasa al otro en la lista
    console.log(id);
    startChrono();

    function startChrono() {
        console.log("empezo el cronometro..");
        t = setTimeout(deleteUser, 300000, id,tablewl);
    }

    function deleteUser(id,table_wl) {
        var tableUsed = table_wl;
        var idUsed = id;
        console.log("id: "+idUsed+" tabla wl: "+tableUsed);
        param = [
            tableUsed,
            idUsed
        ]

        db.query('DELETE FROM ?? WHERE `id_court` = ? LIMIT 1', param, (error, results) => {

            if (error) {
                console.log(error);
            }
            console.log("Tiempo expirado !");
            //una vez expirado el tiempo busca si hay otro usuario en la lista
            console.log("busca nuevamente en la lista");
            SearchTurnWaitList2(id_place, date, entryTime, departureTime, courtNumber, id, table, tablewl);
        });
    }

};

function SearchTurnWaitList2(id_place, date, entryTime, departureTime, courtNumber, id_court, table, tablewl) {
    //busca si hay alguien anotado en la lista
    var param1 = [
        tablewl,
        id_court
    ]
    var param2 = [
        table,
        id_court
    ]
    db.query('SELECT `id`,`tokenIdPhone` FROM ?? WHERE `id_court` = ? LIMIT 1', param1, async (error, results) => {
        if (error) {
            console.log(error);
        }

        if (results.length === 0) {
            console.log("No hay usuarios anotados en la lista");
            db.query('UPDATE ?? SET `status` = "Disponible" WHERE `id` = ?', param2, (error, results) => {

                if (error) {
                    console.log(error);
                }
                console.log("Disponible el turno-no hay usuarios esperando");
            });
            return console.log("Hay usuarios: NO");

        } else {
            console.log(Object.values(results[0]));
            const arraynotif = Object.values(results[0]);

            const num_id_waitlist = arraynotif[0];

            var id_waitlist = num_id_waitlist.toString();
            const tokenIdPhone = arraynotif[1];


            //opciones de la notificacion 
            const options = {
                priority: "high",
                timeToLive: 60 * 60 * 24,
            };
            console.log("FECHA: " + date)
            //payload con la configuracion de la notificacion 
            const payload = {
                notification: {
                    title: 'Turno Disponible',
                    body: '¿Desea reservar la cancha?',
                    click_action: '.TurnWaitListActivity',
                },
                "data": {
                    "id_place": id_place,
                    "date": date,
                    "entryTime": entryTime,
                    "departureTime": departureTime,
                    "courtNumber": courtNumber,
                    "id_court": id_court,
                    "id_waitlist": id_waitlist
                }
            };

            //envio la notificacion
            await admin.messaging().sendToDevice(tokenIdPhone, payload, options)
                .then(function (response) {
                    console.log('Se envio correctamente la notificacion!!', response);
                    expiredTime(id_place, date, entryTime, departureTime, courtNumber, id_court);
                })
                .catch(function (error) {
                    console.log('Error sending message:', error);
                });
        }
        return console.log("Hay usuarios: SI");
    });
}

exports.expiredTimeStop = (req, res) => {
    clearTimeout(t);
    console.log("stop");
    return res.status(200).json({ message: "STOP CHRONOMETER" });
}
function daysForMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

exports.addNewCourt = async (req, res) => {
    var today = new Date(Date.now());
    var currentDate = today.getDay() - 1;
    var datesForCreate = daysForMonth(today.getUTCFullYear(), today.getUTCMonth());
    var dates = parseInt(datesForCreate) - parseInt(currentDate);
    var id_place = req.params.id_place;
    var add = req.body.courtNumber;
    var addCourtInPlace = await addNewShiftsList(id_place, add);
    var courtNumber = parseInt(addCourtInPlace) + parseInt(add);
    const table = await theNameTable(id_place);
    console.log("tabla seleccionada: " + table);
    console.log(addCourtInPlace);

    for (var d = 0; d < dates; d++) {
        var date = d;
        console.log("fecha: " + date);
        for (var j = addCourtInPlace; j < courtNumber; j++) {
            var number = j + 1;
            //24 horas del dia
            for (var i = 0; i < 24; i++) {
                var aux = i + 1;

                var entryTime = i;
                var departureTime = aux;

                var param = [
                    table,
                    number,
                    date,
                    entryTime,
                    departureTime
                ]

                db.query('INSERT INTO ?? VALUES (NULL, 1, NULL, ?, ADDDATE(CURRENT_DATE(), INTERVAL ? DAY), NULL, "Disponible", ?, ?,current_timestamp(),current_timestamp())', param, (error, results) => {

                    if (error) {
                        console.log(error);
                    }

                });
                console.log("hora: " + i);
            }
            console.log("cancha: " + number);
        }
    }
    console.log("fechas creadas: " + dates);
    return res.status(200).json({
        message: 'Cancha y turnos agregados!'
    })
}


//INSERCION Y BORRADO DE FECHAS PARA EL CHAÑARAL
exports.insertDateChañaral = async (req, res) => {
    var today = new Date(Date.now());

    var nameTableAndSize = [];
    nameTableAndSize = await searchNameTablesAndSize();
    var ids_places = [];
    ids_places = await cantPlaces();
    var datesForCreate = daysForMonth(today.getUTCFullYear(), today.getUTCMonth());

    for (var c = 0; c < nameTableAndSize.length - 1; c++) {
        var num_id_place = c + 1;
        var cantCourts = await cantCourtsById(ids_places[c].id);
        //va el numero de cantidad de canchas del complejo
        for (var d = 0; d < datesForCreate; d++) {
            var date = d;
            console.log("fecha: " + date);
            for (var j = 0; j < cantCourts; j++) {
                var courtNumber = j + 1;
                // i<3 -> tiene que ir 23 porque son las 24 horas del dia
                for (var i = 0; i < 24; i++) {
                    var aux = i + 1;

                    var entryTime = i;
                    var departureTime = aux;
                    var param = [
                        nameTableAndSize[c].name_table,
                        num_id_place,
                        courtNumber,
                        date,
                        entryTime,
                        departureTime
                    ]

                    db.query('INSERT INTO ?? VALUES (NULL, ?, NULL, ?, ADDDATE(CURRENT_DATE(), INTERVAL ? DAY), NULL, "Disponible", ?, ?,current_timestamp(),current_timestamp())', param, (error, results) => {

                        if (error) {
                            console.log(error);
                        }

                    });
                    console.log("hora: " + i);

                }
                console.log("cancha: " + courtNumber);
            }
        }
        console.log(nameTableAndSize.length - 1);
    }
}
exports.deleteDateChañaral = async (req, res) => {
    var nameTableAndSize = [];
    nameTableAndSize = await searchNameTablesAndSize();

    for (let c = 0; c < nameTableAndSize.length - 1; c++) {
        // ELIMINA LOS REGISTROS DE LA FECHA ACTUAL MENOS UN DIA
        db.query('DELETE FROM ?? WHERE `date` = DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY)', nameTableAndSize[c].name_table, (error, results) => {

            if (error) {
                console.log(error);
            }

            console.log("Se borraron fechas de ayer");
        });
    }
}
exports.deleteTurnsWaitList = async (req, res) => {
    var nameTableAndSizeWL = [];
    nameTableAndSizeWL = await searchNameTablesWLAndSize();

    for (let c = 0; c < nameTableAndSizeWL.length - 1; c++) {
        // ELIMINA LOS REGISTROS DE LA FECHA ACTUAL MENOS UN DIA
        db.query('DELETE FROM ?? WHERE `date` = DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY)', nameTableAndSizeWL[c].name_table, (error, results) => {

            if (error) {
                console.log(error);
            }

            console.log("Se borraron fechas de lista de espera de ayer");
        });
    }
}

//BUSCADORES
exports.SearchForCourtNumber = async (req, res) => {
    var today2 = new Date();
    var currentHour = today2.getHours();
    var entryTime2 = currentHour;
    var id_place = req.params.id_place;
    console.log("hora actual: " + today2.getHours());
    const table = await theNameTable(id_place);
    console.log("tabla seleccionada: " + table);
    var param = [
        table,
        req.params.courtNumber,
        entryTime2,
    ]
    console.log(param);

    if (table == "") {
        console.log("el Complejo no tiene turnos");
    }else{
        db.query('SELECT `id`,`courtNumber`,`id_place`,`date`,`name`,`status`, `entryTime`, `departureTime` FROM ?? WHERE `courtNumber` = ? and `date` = CURRENT_DATE() and `entryTime` > ? ORDER BY `entryTime`', param, (error, results) => {

            if (error) {
                console.log(error);
            }
            console.log(today2.toDateString());
            console.log(results[0].date);
            res.status(200).json(results);
        });
    }
}

exports.SearchForHour = async (req, res) => {
    var id_place = req.params.id_place;
    console.log("id_place: " + id_place);
    const table = await theNameTable(id_place);
    console.log("tabla seleccionada: " + table);
    var blockCourt = await searchBloquedCourt(id_place);
    console.log(blockCourt);
    var param = [
        table,
        req.params.entryTime
    ]
    console.log(param);

    db.query('SELECT `id`,`courtNumber`,`id_place`,`date`,`name`,`status`, `entryTime`, `departureTime` FROM ?? WHERE `entryTime`= ? and `date` = CURRENT_DATE()', param, (error, results) => {

        if (error) {
            console.log(error);
        }
        
        for (var i = 0; i < blockCourt.length; i++) {
            for (var j = 0; j < results.length; j++) {
                //elimino los turnos de las canchas bloquedas
                if (results[j].courtNumber == blockCourt[i].courtNumber){
                    results.splice(j,1);
                }
            }
        }
        res.status(200).json(results);
    });
}

exports.SearchForDate = async (req, res) => {
    var id_place = req.params.id_place;
    const table = await theNameTable(id_place);
    console.log("tabla seleccionada: " + table);
    var param = [
        table,
        req.params.courtNumber,
        req.params.date
    ]
    console.log(param);

    db.query('SELECT * FROM ?? WHERE `courtNumber` = ? and `date` = ?', param, (error, results) => {

        if (error) {
            console.log(error);
        }
        res.status(200).json(results);
    });
}
