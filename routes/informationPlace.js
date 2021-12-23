const express = require('express');
const placeController = require('../controllers/place');
const authController = require('../controllers/auth');

const router = express.Router();

router.get('/:id_user',authController.verifyToken,placeController.userPlace);
router.get('/name/:id',authController.verifyToken,placeController.getName);
router.get('/data/:id',authController.verifyToken,placeController.placeData);
router.get('/:id/totalcourts',authController.verifyToken,placeController.cantCourtsPlace);
router.put('/:id',authController.verifyToken, placeController.editInfoPlace);

module.exports = router;