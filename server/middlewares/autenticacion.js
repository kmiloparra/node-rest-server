const jwt = require('jsonwebtoken');

let verificaToken = (req, res, next) => {

    let token = req.get('token');

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err
            })
        }
        req.usuario = decoded.usuario;
        next();
    })
}


let verificaAdmin_Role = (req, res, next) => {

    let rol = req.usuario.role;

    if (rol !== 'ADMIN_ROLE') {
        return res.status(401).json({
            ok: false,
            err: {
                message: 'El usuario no es administrador'
            }
        });
    }
    next();
}

verificaTokenImg = (req, res, next) => {

    let token = req.query.token;
        jwt.verify(token, process.env.SEED, (err, decoded) => {
            if (err) {
                return res.status(401).json({
                    ok: false,
                    err
                })
            }
            req.usuario = decoded.usuario;
            next();
        })
};



module.exports = {

    verificaToken,
    verificaAdmin_Role,
    verificaTokenImg

}