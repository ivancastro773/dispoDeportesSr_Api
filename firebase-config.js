// firebase-config.js

var admin = require("firebase-admin");

var serviceAccount = require("./notification-config.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://dispo-deportes-sr.firebaseio.com"
});

module.exports = admin;