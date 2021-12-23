const express = require('express');
const sportsController = require('../controllers/sports');
const authController = require('../controllers/auth');
const router = express.Router();

//Lista de deportes
router.get('/',authController.verifyToken, sportsController.sports);

//lista de complejos por deporte
router.get('/:id_sports',authController.verifyToken, sportsController.searchPlaces);

module.exports = router;