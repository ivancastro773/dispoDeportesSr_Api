const express = require('express');
const profileController = require('../controllers/profile');

const router = express.Router();

router.get('/admins', profileController.listUserAdmin);

module.exports = router;