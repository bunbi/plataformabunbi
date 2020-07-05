const nodemailer = require("nodemailer");
var utils = {};
utils.validateEmail = (email) => {
    // eslint-disable-next-line no-useless-escape
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
utils.validarRfc = (rfc) => {
    var exp = /^([A-ZÑ&]{3,4}) ?(?:- ?)?(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])) ?(?:- ?)?([A-Z\d]{2})([A\d])$/;
    return exp.test(String(rfc).toUpperCase());
}
utils.sendEmai = (email, mensaje, asunto) => {

    var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.GMAIL,
            pass: process.env.GMAILPASSWORD
        }
    });
    var mailOptions = {
        from: 'admin@bunbi.com.mx',
        to: email,
        subject: asunto,
        text: mensaje
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return false;
        } else {
            return true;
        }
    });
}

module.exports = utils;