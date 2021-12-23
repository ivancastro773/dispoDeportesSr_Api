const db = require('../database');

function searchNameTables(id){
    return new Promise((resolve,reject) => {
        var id_place = id;
     
            db.query('SELECT `name_table` FROM `placestables` WHERE `id_place` = ?',id_place, (error, results) => {
    
                if(error){
                    console.log(error);
                }
                
                console.log(results[0].name_table);
                resolve(results[0].name_table);
                if (results == "") {
                    reject('hubo un error');
                }
            });  
    });
    
}

exports.stateCourt = (req,res) => {
    console.log(req.params);
    var param = [
        req.params.id_sport,
        req.params.id_place
    ]
     //const courtNumber = req.params.courtNumber;

    //Busca que cancha esta bloqueada
   db.query('SELECT `courtNumber` FROM `blockedcourt` WHERE `id_sport` = ? AND `id_place`= ?', param, (error,results) => {
       if(error){
           console.log(error);
       }else{
           console.log("busco la cancha bloqueada");
           res.status(200).json(results);
       }
   });  
}

exports.listBloquedCourt = async(req,res) => {
    var id_place = req.params.id_place;

    var name_table = await searchNameTables(id_place);
     db.query('SELECT `courtNumber` FROM ?? GROUP BY `courtNumber`',name_table, (error,results) => {
       if(error){
           console.log(error);
       }else{
           
        res.status(200).json(results);
       }
   });  
    
    
}
exports.addblockedCourt = (req,res) => {
    console.log(req.body);
    
    const {id_sport, id_place, courtNumber} = req.body;

    var param = [
        req.body.id_sport,
        req.body.id_place,
        req.body.courtNumber
    ]
    
    //BUSCA SI YA ESTA BLOQUEADA DICHA CANCHA
    db.query('SELECT id FROM `blockedcourt` WHERE `id_sport` = ? AND `id_place` = ? AND `courtNumber` = ?  LIMIT 1',param, (error,results) => {
        if(error){
            console.log(error);
        }
        console.log(results);

        //SI NO EXISTE LA CANCHA , LA AGREGA A LA LISTA DE CANCHAS
        if(results == ""){
            
                //registra la cancha en la lista de canchas bloqueadas
                db.query('INSERT INTO blockedcourt SET ?', {id_sport:id_sport,id_place:id_place,courtNumber:courtNumber}, (error,results) => {
                if(error){
                    console.log(error);
                }else{
                    console.log("Se bloqueo la cancha");
                    return res.status(200).json({
                        code: 1,
                        message: 'bloqueada'
                    })
                }
            });  
        }else{
            console.log("Ya se encuentra bloqueada");
        }
    });
}

exports.freeCourt = (req,res) => {
    console.log(req.params);
    var param = [
        req.params.id_sport,
        req.params.id_place,
        req.params.courtNumber
    ]
    
    //registra la cancha en la lista de canchas bloqueadas
    db.query('DELETE FROM `blockedcourt` WHERE `id_sport`= ? AND `id_place`= ? AND `courtNumber`= ?', param, (error,results) => {
       if(error){
           console.log(error);
       }else{
           console.log("Se Desbloqueo la cancha");
           return res.status(200).json({
               code: 1,
               message: 'desbloqueada'
           })
       }
   });  
}

exports.modeHolidays = (req,res) => {
    console.log(req.params);
    const holidays = req.body.holidays;

    var param = [
        { holidays },
        req.params.id
    ]
    const id = req.params.id;

    //BUSCA SI YA ESTA EN 1
    db.query('SELECT `holidays` FROM `place` WHERE `id` = ? LIMIT 1',id, (error,results) => {
        if(error){
            console.log(error);
        }
        
        console.log(results);
        const value = Object.values(results[0]);

        //SI NO ESTA EN 1 LA PONE EN 1

        if(value == 0){
                //registra el complejo en modo vacaciones (1 -> de vacaciones)
                db.query('UPDATE `place` SET ? WHERE `place`.`id` = ?;', param, (error,results) => {
                if(error){
                    console.log(error);
                }else{
                    console.log("Se puso modo vacaciones");
                    return res.status(200).json({
                        code: 1,
                        message: 'Modo vacaciones'
                    })
                }
            });       
        }else{
            console.log("Ya se encuentra en modo vacaciones");
        }
    });   
}

exports.searchHolidays = (req,res) => {
    console.log(req.params);

    var param = [
        req.params.id
    ]
    
    //busca si esta de vacaciones(si es uno)
    db.query('SELECT `holidays` FROM `place` WHERE `id` = ? LIMIT 1', param, (error,results) => {
       if(error){
           console.log(error);
       }else{
           console.log("Verifica si se encuentra de vacaciones");

           const value = Object.values(results[0]);
           if (value == 1) {
               console.log("Esta de vacaciones");
            return res.status(200).json({
                code: 1,
                message: 'El complejo se encuentra de vacaciones'
            }) 
           }else{
            return res.status(200).json({
                code: 0,
                message: 'El complejo no está de vacaciones'
            })   
           }    
       }
   });  
}

exports.freeHolidays = (req,res) => {
    console.log(req.params);
    const holidays = req.body.holidays;

    var param = [
        { holidays },
        req.params.id
    ]
    
    //libera al complejo de las vacaciones
    db.query('UPDATE `place` SET ? WHERE `place`.`id` = ?;', param, (error,results) => {
       if(error){
           console.log(error);
       }else{
           console.log("El complejo volvio de las vacaciones");
           return res.status(200).json({
               code: 1,
               message: 'Modo vacaciones desactivado'
           })
       }
   });  
}

