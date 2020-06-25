var lib = {}

function validateEmail(email) {
    // eslint-disable-next-line no-useless-escape
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

lib.valida = function (name, correo, telefono) {
    if (!name || !correo || !telefono) {
        return { error: true, msg: "Llene los campos" }
    }
    if (!validateEmail(correo)) {
        return { error: true, msg: "Ingrese un correo válido" }
    }
    return {
        error: false
    }
}

module.exports = lib;