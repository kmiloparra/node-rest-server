const express = require('express');

const Categoria = require('../models/categoria');

const Usuario = require('../models/usuario');

const app = express();

const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion')

const _ = require('underscore');

app.get('/categorias', verificaToken, (req, res) => {

    Categoria.find({})
        .sort('nombre')
        .populate('usuario')
        .exec((err, categorias) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                categorias
            })
        })

});


app.get('/categoria/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    Categoria.findById(id)
        .exec((err, categoria) =>{
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            if(!categoria){
                return res.status(500).json({
                    ok: false,
                    message:"Id de categoria no existe"
                });
            }

            Usuario.findById(categoria.usuario,(err,usuarioDB)=>{
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }
                res.json({
                    ok: true,
                    categoria,
                    usuario: usuarioDB
        
                });
            })
        })

});

app.post('/categoria', verificaToken, (req, res) => {

    let body = req.body;

    let categoria = new Categoria({
        nombre: body.nombre,
        descripcion:body.descripcion,
        usuario:req.usuario._id
    });

    categoria.save().then(categoriaDB =>
        res.json({
            ok: true,
            categoria: categoriaDB
        })
    ).catch((err) => {
        return res.status(400).json({
            ok: false,
            err
        });
    })

});

app.put('/categoria/:id', verificaToken, function(req, res) {
    console.log(req);
    let id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'descripcion','usuario']);
    
    Categoria.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, categoriaDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], function(req, res) {

    let id = req.params.id;


    Categoria.findByIdAndRemove(id, (err, categoriaBorrada) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!categoriaBorrada){
            return res.status(400).json({
                ok: false,
                message:"Id de categoria no existe"
            });
        }

        res.json({
            ok: true,
            categoria: categoriaBorrada

        });
    });

});

module.exports = app; {}