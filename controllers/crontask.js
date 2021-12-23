var CronJob = require('cron').CronJob;


exports.cronTaskFunction = (req,res) => {

    //TAREA CRON PARA QUE CADA UN MES CREE OTRO MES DE TURNOS 

    var job = new CronJob('* * * * *', function() {
    var date = 0;
    var courtNumber = 1;

    //va el numero de cantidad de canchas del complejo
    for (var j = 0; j < 3; j++) {
        
        // i<3 -> tiene que ir 24 porque son las 24 horas del dia
        for (var i = 0; i < 24; i++) {
            var aux = i+1;
            
            var entryTime = i+" hs.";
            var departureTime = aux+" hs.";

            var param = [
                courtNumber,
                date,
                entryTime,
                departureTime
            ]

            db.query('INSERT INTO `court` VALUES (NULL, 1, 1, NULL, ?, ADDDATE(CURRENT_DATE(), INTERVAL ? DAY), NULL, "Disponible", ?, ?,current_timestamp(),current_timestamp())',param, (error, results) => {

                if(error){
                    console.log(error);
                } 
            
            });
            
            //aca va 24 hs 
            if (i == 24) {
                courtNumber++; 
            }            
        }
        console.log("J: "+ j);

        //va un numero menos del j de arriba
        if (j == 2) {
            j = -1;
            date++;
            courtNumber = 1;

            //Va el numero de fecha (cantidad de dias en dos meses si es que lo quiero hacer de dos meses)
            if (date == 61) {
                return console.log("se corto");
            }
        }
    } 
  }, null, true, 'America/Argentina/Mendoza');

job.start();

}
