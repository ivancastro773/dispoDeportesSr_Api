const express = require('express');
const blockController = require('../controllers/blockCourt');
const userSanctioned = require('../controllers/sanction');
const sportsController = require('../controllers/sports');
const authController = require('../controllers/auth');
const router = express.Router();

//ESTO ES PARA TODOS LOS COMPLEJOS
router.get('/places/:id_users',authController.verifyToken, sportsController.PlaceByUser);
//SANCION
router.post('/sanction',authController.verifyToken,userSanctioned.userSanctioned);
router.get('/sanctionlist/:id_place',authController.verifyToken,userSanctioned.allUserSanctioned);
router.get('/verifysanction/:id_place/:id_users',authController.verifyToken,userSanctioned.verifySanction);
router.get('/verifysanction/sanctioned/:id_place/:id_users',authController.verifyToken,userSanctioned.sanctionDays);
router.delete('/userFreeSanction/:id_place/:id_users',authController.verifyToken,userSanctioned.userFreeSanction);

//BLOQUEO DE CANCHAS
router.get('/statuscourt/:id_sport/:id_place',authController.verifyToken,blockController.stateCourt);
router.get('/listbloquedcourt/:id_place',authController.verifyToken,blockController.listBloquedCourt);
router.post('/addbloquedcourt',authController.verifyToken,blockController.addblockedCourt);
router.delete('/freecourt/:id_sport/:id_place/:courtNumber',authController.verifyToken,blockController.freeCourt);

//MODO VACACIONES
router.put('/modeholidays/:id',authController.verifyToken,blockController.modeHolidays);
router.get('/searchholidays/:id',authController.verifyToken,blockController.searchHolidays);
router.put('/freeholidays/:id',authController.verifyToken,blockController.freeHolidays);

module.exports = router;