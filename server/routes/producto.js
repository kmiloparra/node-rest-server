const express = require('express');

const { verificaToken } = require('../middlewares/autenticacion');

let app = express();

const _ = require('underscore');

const Producto = require('../models/producto');
const Categoria = require('../models/categoria');
const Usuario = require('../models/usuario');

app.get('/productos', (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Producto.find({ disponible: true })
        .skip(desde)
        .limit(limite)
        .sort('nombre')
        .populate('categoria usuario')
        .exec((err, productos) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                productos
            })
        })

});

app.get('/producto/:id', (req, res) => {

    let id = req.params.id;

    Producto.findById(id, (err,producto) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if(!producto){
            return res.status(500).json({
                ok: false,
                message:"Id de producto no existe"
            });
        }
        res.json({
            ok: true,
            producto
        });
    }).populate('categoria usuario');
    
});

app.get('/productos/buscar/:termino', (req, res) => {
let termino = req.params.termino;
let regex = new RegExp(termino, 'i');

    Producto.find({ nombre : regex })
        .sort('nombre')
        .populate('categoria usuario')
        .exec((err, productos) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                productos
            })
        })
});

app.post('/producto', verificaToken,(req, res) => {

    let id = req.params.id;

    let idCategoria = req.body.categoria;

    Categoria.findById(idCategoria)
        .exec((err, categoria) =>{
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            console.log(req.body.categoria);
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
                
            })
        });
    
    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario:req.usuario._id
    });
    producto.save().then(productoDB =>
        res.json({
            ok: true,
            producto: productoDB
        })
    ).catch((err) => {
        return res.status(400).json({
            ok: false,
            err
        });
    })

});


app.put('/producto/:id',verificaToken, (req, res) => {

    let id = req.params.id;

    let body = _.pick(req.body, ['nombre', 'precioUni','descripcion','disponible','categoria','usuario']);

    Producto.findByIdAndUpdate(id, body,{ new: true, runValidators: true }, (err,producto) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if(!producto){
            return res.status(500).json({
                ok: false,
                message:"Id de producto no existe"
            });
        }
        res.json({
            ok: true,
            producto
        });
    }).populate('categoria usuario');
    
});

app.delete('/producto/:id',verificaToken, (req, res) => {

    let id = req.params.id;

    Producto.findByIdAndUpdate(id, { disponible: false },{ new: true, runValidators: true }, (err,producto) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if(!producto){
            return res.status(500).json({
                ok: false,
                message:"Id de producto no existe"
            });
        }
        res.json({
            ok: true,
            producto
        });
    }).populate('categoria usuario');
    
});

module.exports = app;