const db = require('../database');

exports.sports = (req,res) => {

    db.query('SELECT * FROM sports', (error, results) => {

        if(error){
            console.log(error);
        }
        res.status(200).json(results);
    });
}

exports.searchPlaces = (req,res) => {
    var id_sports = req.params.id_sports;
    db.query('SELECT id, name, image_url FROM place WHERE id_sports = ?',id_sports, (error, rows) => {

        if(error){
            console.log(error);
        }
        res.status(200).json(rows);
    });
}

exports.paddle = (req,res) => {

    db.query('SELECT name FROM place WHERE id_sports = 2', (error, rows) => {

        if(error){
            console.log(error);
        }
        res.json(rows);
    });
}

exports.PlaceByUser = (req,res) => {

    const id_users = req.params.id_users;

    db.query('SELECT `id`,`name` FROM `place` WHERE `id_users` = ?',id_users, (error, results) => {

        if(error){
            console.log(error);
        }
        console.log("Busco el complejo del user "+id_users);
        res.json(results[0]);
    });
}