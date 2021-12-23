const express = require('express');
const shiftController = require('../controllers/shiftList');
const placeController = require('../controllers/place');
const authController = require('../controllers/auth');
const router = express.Router();

//Turnos ocupados o pedidos
router.get('/turnbusy/:id_place/:courtNumber',authController.verifyToken,shiftController.allTurnsBusy);

//RUTA PARA USUARIOS ESTANDAR
//TURNOS
router.put('/turn/:id_place/:id/:nlist',authController.verifyToken,shiftController.turnRegister);
router.get('/turn/:id_users',authController.verifyToken,shiftController.userTurns);

//LISTA DE ESPERA
router.post('/turnwaitlist',authController.verifyToken,shiftController.turnWaitList);
router.get('/turnwaitlist/:id_users',authController.verifyToken,shiftController.userTurnsWaitList);
router.post('/searchwaitlist/',shiftController.searchWaitList);
router.delete('/turnwaitlist/:id_place/:id',authController.verifyToken,shiftController.cancelTurnsWaitList);

//ruta para cuando contestan la notificacion
router.get('/expiredtimestop',shiftController.expiredTimeStop);
//trae los turnos por numero de cancha y la ruta con el nombre del complejo
router.get('/:id_place/:courtNumber',authController.verifyToken,shiftController.SearchForCourtNumber);
router.post('/:id_place/addcourts',authController.verifyToken,shiftController.addNewCourt);

//BUSCADORES
router.get('/searchforhour/:id_place/:entryTime/',authController.verifyToken,shiftController.SearchForHour);
router.get('/searchfordate/:id_place/:courtNumber/:date',authController.verifyToken,shiftController.SearchForDate);
router.post('/photo/add/multer',placeController.addPhoto); // nose usa
router.post('/photo/add',authController.verifyToken,placeController.saveImage);
module.exports = router;