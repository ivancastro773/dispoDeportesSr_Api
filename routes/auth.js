const express = require("express");
const authController = require("../controllers/auth");
const profileController = require("../controllers/profile");

const router = express.Router();

router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/register-google", authController.registerUserWithGoogle);
router.get("/acount-activate/:token", authController.acountActivate);
router.post("/forgot-password", authController.forgotPassword);
router.post("/resetpassword/:resetToken", authController.resetPassword);

//Rutas de las vistas
router.get("/form", authController.viewForm);
router.get("/resetpassword/:resetToken", authController.viewResetPassword);

module.exports = router;
