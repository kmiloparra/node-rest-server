const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

const fs = require('fs');

const path = require('path');


// default options
app.use(fileUpload());


app.put('/upload/:tipo/:id', function(req, res) {

    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            ok:false,
            err:{
                message: 'No se ha seleccionado ningun archivo'
            }
        })
      }

      let tiposValidos = ['productos','usuarios'];

      if(tiposValidos.indexOf( tipo) < 0 ){
        return res.status(400).json({
           ok: false,
           err:{
               message: 'Los tipos permitidos son: ' + tiposValidos.join(', '),
               tipoInvalido: tipo
           } 
        })
    }
    
      let archivo = req.files.archivo;

      let extesionesValidas = ['png','jpg','gif','jpeg']; 

      let nombreArchivo = archivo.name.split('.');

      let extesion = nombreArchivo[nombreArchivo.length-1];

      if(extesionesValidas.indexOf( extesion)<0 ){
          return res.status(400).json({
             ok: false,
             err:{
                 message: 'Las extensiones permitidas son: ' + extesionesValidas.join(', '),
                 extesionInvalida: extesion
             } 
          })
      }
    
      //cambiar nombre de archivo
    let nombreNuevoArchivo = `${id }-${new Date().getMilliseconds()}.${extesion}`;

    // Use the mv() method to place the file somewhere on your server
    archivo.mv(`uploads/${ tipo }/${ nombreNuevoArchivo }`, (err) => {
        if (err)
        return res.status(500).json({
            ok: false,
            err
        });
        console.log(tipo);
        if(tipo=='usuarios')
            imagenUsuario(id, res, nombreNuevoArchivo);
        else
            imagenProducto(id, res, nombreNuevoArchivo);

    });

});


function imagenUsuario(id, res, nombreNuevoArchivo){
    Usuario.findById(id, (err, usuarioDB) => {
        if(err){
            borrarArchivo(nombreNuevoArchivo,'usuarios');
            return res.status(500).json({
                ok:false,
                err
            })
        }
        if (!usuarioDB){
            borrarArchivo(nombreNuevoArchivo,'usuarios');
            return res.status(400).json({
                ok: false,
                err: {
                    message:'Usuario no existe'
                }
            })
        }

        borrarArchivo(usuarioDB.img,'usuarios');

        usuarioDB.img = nombreNuevoArchivo;

        usuarioDB.save((err, usuarioGuardado) => {
            res.json({
                ok:true,
                usuario: usuarioGuardado,
                img: nombreNuevoArchivo
            })
        });

    });
};

function imagenProducto(id, res, nombreNuevoArchivo){
    Producto.findById(id, (err, productoDB) => {
        if(err){
            borrarArchivo(nombreNuevoArchivo,'productos');
            return res.status(500).json({
                ok:false,
                err
            })
        }
        if (!productoDB){
            borrarArchivo(nombreNuevoArchivo,'productos');
            return res.status(400).json({
                ok: false,
                err: {
                    message:'Producto no existe'
                }
            })
        }

        borrarArchivo(productoDB.img,'productos');

        productoDB.img = nombreNuevoArchivo;

        productoDB.save((err, productoGuardado) => {
            res.json({
                ok:true,
                producto: productoGuardado,
                img: nombreNuevoArchivo
            })
        });

    });
};

function borrarArchivo(nombreImagen,tipo){

    let pathUrl = path.resolve(__dirname,`../../uploads/${ tipo }/${nombreImagen}`);

        if(fs.existsSync(pathUrl)){
            fs.unlinkSync(pathUrl);
        }
}


module.exports = app;