const db = require('../database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');

//NODEMAILER
const nodemailer = require('nodemailer');
const { json } = require('express');
const { listBloquedCourt } = require('./blockCourt');

var transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: "dispodeportes.sr@gmail.com",
        pass: "rnkorsxtnqurtixv",
    },
});

function registerWithGoogle(name, email, tokenIdPhone) {
    return new Promise((resolve, reject) => {
        const password = null;
        const rol = "estandar";
        db.query('SELECT id FROM users WHERE email = ?',email, (error, results) => {
            if (error) {
                console.log(error);
                reject(error);
            }
            if (results == "") {
                db.query('INSERT INTO users SET ?', { name: name, email: email, rol: rol, password: password, tokenIdPhone: tokenIdPhone }, (error, results) => {
                    if (error) {
                        console.log(error);
                        reject(error);
                    }
                    console.log("Usuario registrado con google");
                    resolve();
                });
            }else{
                resolve();
                console.log("Ya existe el usuario");
            }
        });
    });
}
function createToken(email) {
    return new Promise((resolve, reject) => {
        console.log("creando token");
        db.query('SELECT * FROM users WHERE email = ?',email, (error, results) => {
            if (error) {
                console.log(error);
                reject(error);
            }
            else if (results[0].token == "") {
                const id = results[0].id;
                const name = results[0].name;
                const email = results[0].email;
                const rol = results[0].rol;
    
                const token = jwt.sign({ id, name, email, rol }, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRES_IN
                });
                console.log("creo un nuevo token");
    
                var param = [
                    token,
                    id
                ]
                var dataUser = [
                    token,
                    rol,
                    id
                ]

                db.query('UPDATE `users` SET `token` = ? WHERE `users`.`id` = ?', param, (error, results) => {
                    if (error) {
                        console.log(error);
                        reject(error);
                    }
    
                    console.log("guardo el nuevo token");
                });
                console.log("El token es: " + token);
                console.log("El rol es: " + rol);
                resolve(dataUser);
            } else {
                console.log("ya tenia un token unico");
                const data = jwt.decode(results[0].token);
                var allData = [
                    results[0].token,
                    data.rol,
                    data.id
                ]
                resolve(allData);
            }
        });
    });
}

exports.verifyToken = (req, res, next) => {
    let token = req.get('Authorization');
    const tokenEmpty = "";
    var param = [
        tokenEmpty,
        token
    ]
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {

        if (err) {
            console.log("expiro el token o el token es incorrecto");

            if (token == null) {
                console.log("Token vacio");
            } else {
                db.query('UPDATE `users` SET `token`= ? WHERE `token` = ?', param, (error, results) => {

                    if (error) {
                        console.log(error);
                    }
                    console.log("borro el token invalido");
                });
            }
            return res.sendStatus(401);
        }
        console.log('se verifico correctamente el token');
        next();
    });
}

exports.login = (req, res) => {
    const { email, password } = req.body;
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    }
    db.query('SELECT * FROM users WHERE email = ?', [email], (error, results) => {
        if (error) {
            console.log(error);
        }

        else if (results.length == 0 || !(bcrypt.compareSync(password, results[0].password))) {
            console.log("Error al ingresar los datos");
            return res.json({
                message: "El email o contraseña son incorrectos"
            });

        }
        else if (results[0].token == "") {
            const id = results[0].id;
            const name = results[0].name;
            const email = results[0].email;
            const rol = results[0].rol;

            const token = jwt.sign({ id, name, email, rol }, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRES_IN
            });
            console.log("creo un nuevo token");

            var param = [
                token,
                id
            ]

            db.query('UPDATE `users` SET `token` = ? WHERE `users`.`id` = ?', param, (error, results) => {
                if (error) {
                    console.log(error);
                }

                console.log("guardo el nuevo token");
            });
            console.log("El token es: " + token);
            console.log("El rol es: " + rol);
            res.cookie('jwt', token, cookieOptions);
            return res.status(200).json({
                message: token,
                rol: rol
            });
        } else {
            console.log("ya tenia un token unico");
            const token = results[0].token;
            const rol = results[0].rol;
            const id = results[0].id;

            /*  console.log("El token es: " + token);
             console.log("El rol es: " + rol);
             console.log("El id es: " + id); */

            res.cookie('jwt', token, cookieOptions);
            return res.status(200).json({
                message: token,
                rol: rol,
                idAdmin: id
            });
        }
    });

}

exports.register = (req, res) => {
    console.log(req.body);
    const { name, email, password, passwordConfirm, tokenIdPhone } = req.body;
    const rol = "estandar";
    var expReg = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
    var validateEmail = expReg.test(email);

    db.query('SELECT email FROM users WHERE email = ?', [email], (error, results) => {
        if (error) {
            console.log(error);
        }

        //verifica si ya existe el email ingresado
        if (results.length > 0) {

            return res.json({
                message: "El email ingresado ya esta en uso."
            })

            //verifica si coincide las contraseñas ingresadas
        } else if (validateEmail == false) {

            return res.json({
                code: 0,
                message: 'Correo invalido'
            })

        } else if (password !== passwordConfirm) {

            return res.json({
                code: 0,
                message: 'Las contraseñas ingresadas no son iguales.'
            })

        } else {
            //Encripta la contraseña
            // let hashedPassword = bcrypt.hashSync(password, 10);
            console.log("entro..")

            const token = jwt.sign({ name, email, password, tokenIdPhone }, process.env.JWT_ACOUNT_ACTIVE, { expiresIn: '20m' });

            var mailOptions = {
                from: process.env.EMAIL_APP,
                to: email,
                subject: "Active su cuenta",
                html: `
                <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta http-equiv="X-UA-Compatible" content="IE=edge">
                    </head>
                    <body>
                        <b>Por favor presione el boton "Activar cuenta" o ingrese a este link para activar su cuenta: </b>
                        <br>
                        <form method="get" action="https://${process.env.CLIENT_LOCALHOST}/acount-activate/${token}">
                            <button class="btn login_btn" type="submit">Activar cuenta
                        </form>
                        <br>
                        <b>LINK:</b>
                        <br>
                        <a href="https://${process.env.CLIENT_LOCALHOST}/acount-activate/${token}">https://${process.env.CLIENT_LOCALHOST}/acount-activate/${token}</a>
                    </body>
                </html>`,

            }

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    res.status(500).send(error.message);
                } else {
                    console.log("Email enviado!");
                    res.end();
                }

            });

            return res.status(200).json({
                code: 1,
                message: 'Se le ha enviado un email para que active su cuenta'
            })
        }
    });
}

exports.registerUserWithGoogle = async(req, res) => {
    const { name, email, tokenIdPhone } = req.body;
    var register = await registerWithGoogle(name,email,tokenIdPhone);
    var data = await createToken(email);
    console.log(data);

    return res.status(200).json({
        message: data[0],
        rol: data[1],
        idAdmin: data[2]  
    });  
}

exports.acountActivate = (req, res) => {

    const token = req.params.token;

    if (token) {

        jwt.verify(token, process.env.JWT_ACOUNT_ACTIVE, (err, decoded) => {
            if (err) {
                return res.status(401).json({ error: "Token incorrecto o el tiempo expiró." });
            }

            console.log('se verifico correctamente el token');

            const { name, email, password, tokenIdPhone } = decoded;
            let hashedPassword = bcrypt.hashSync(password, 10);
            const rol = "estandar";

            db.query('SELECT email FROM users WHERE email = ?', [email], (error, results) => {
                if (error) {
                    console.log(error);
                }

                //verifica si ya existe el email ingresado
                if (results.length > 0) {

                    return res.render('activateAccount', { alert: '' })

                } else {
                    db.query('INSERT INTO users SET ?', { name: name, email: email, rol: rol, password: hashedPassword, tokenIdPhone: tokenIdPhone }, (error, results) => {
                        if (error) {
                            console.log(error);
                        } else {
                            return res.render('activateAccount', { alert: '' });
                        }
                    });
                }
            });
        });

    } else {
        return res.status(400).json({ error: "Error de autenticacion" });
    }
}

exports.forgotPassword = (req, res) => {
    const email = req.body.email;

    db.query('SELECT id FROM users WHERE email = ?', email, (error, results) => {

        if (error || results == "") {
            console.log(error);
            return res.status.render('form', { alert: 'El email ingresado no existe, Por favor intente de nuevo.' })
            //res.status(400).json({error: "El email ingresado no existe"});
        }

        const id = results[0].id;
        const resetToken = jwt.sign({ id }, process.env.RESET_PASSWORD_KEY, { expiresIn: '20m' });

        var mailOptions = {
            from: process.env.EMAIL_APP,
            to: email,
            subject: "Recuperacion de contraseña",
            html: `
            <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta http-equiv="X-UA-Compatible" content="IE=edge">
                </head>
                <body>
                    <b>Por favor ingrese a este link para poder restaurar su contraseña: </b>
                    <br>
                    <a href="https://${process.env.CLIENT_LOCALHOST}/resetpassword/${resetToken}">https://${process.env.CLIENT_LOCALHOST}/resetpassword/${resetToken}</a>
                </body>
            </html>`,

        }

        var param = [
            resetToken,
            id
        ]

        db.query('UPDATE `users` SET `resetToken` = ? WHERE `users`.`id` = ?', param, (error, results) => {
            if (error) {
                console.log(error);
                return res.status(400).json({ error: "Error en el link de cambio de contraseña" });
            }

            console.log("Se guardo el resetToken");

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    res.status(500).send(error.message);
                } else {
                    console.log("Email enviado!");
                    res.end();
                }
            });
            return res.render('formsuccess');
        });
    });
}

exports.resetPassword = (req, res) => {

    const newPassword = req.body.newPassword;
    var resetToken = req.params.resetToken;

    //Encripta la contraseña
    let hashedPassword = bcrypt.hashSync(newPassword, 10);

    var param = [
        hashedPassword,
        resetToken
    ]

    db.query('UPDATE `users` SET `password` = ? WHERE `users`.`resetToken` = ?', param, (error, results) => {
        if (error) {
            console.log(error);
            return res.status(400).json({ error: "Error en el link de cambio de contraseña" });
        }
        console.log("Se cambio la contraseña");

        const emptyResetToken = "";

        var param2 = [
            emptyResetToken,
            resetToken
        ]

        db.query('UPDATE `users` SET `resetToken` = ?,`token` = NULL WHERE `users`.`resetToken` = ?', param2, (error, results) => {
            if (error) {
                console.log(error);
                return res.status(400).json({ error: "Error en el link de cambio de contraseña" });
            }
            console.log("Se vacio el campo resetToken");

        });
        const message = "Su contraseña ha sido cambiada!";
        res.render('passwordsuccess', { messageok: message });

    });


}

exports.viewForm = (req, res) => {

    res.render('form', { alert: '' });
}

exports.viewFormSuccess = (req, res) => {

    res.render('formsuccess');
}

exports.viewResetPassword = (req, res) => {
    const resetToken = req.params.resetToken;

    if (resetToken) {

        jwt.verify(resetToken, process.env.RESET_PASSWORD_KEY, (err, decoded) => {
            if (err) {
                return res.status(401).json({ error: "Token incorrecto o el tiempo expiró." });
            }
            console.log('se verifico correctamente el token');
        });

        db.query('SELECT id FROM users WHERE resetToken = ?', resetToken, (error, results) => {

            if (error || results == "") {
                console.log("el token se quiso usar dos veces");
                return res.render('tokenincorrect', { error: 'Usted ya cambio su contraseña!' });
                //return res.status(400).json({error: "Usted ya cambio su contraseña!"});
            } else {
                return res.render('resetpassword', { token: resetToken });
            }
        });

    } else {
        return res.status(400).json({ error: "Error de autenticacion" });
    }
}




