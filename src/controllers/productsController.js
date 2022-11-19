const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');
const session = require('express-session');

const productsFilePath = path.join(__dirname, '../data/productsDataBase.json');
const products = JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));

const db = require("../database/models");


const controller = {
    index: (req, res) => {
        db.producto.findAll({
            limit: 12
        })
        .then(function(productos){
            res.render('index', {
                productos: productos,})
        })
    },
    chart: (req, res) => {
        if (req.cookies.user != undefined) {
            res.render('./pages/carrito', { productos: products });
        }
        else if (req.session.usuarioLogueado != undefined) {
            res.render('./pages/carrito', { productos: products });
        }
        else res.redirect('user/login');
    },
    comingSoon: (req, res) => {
        res.render('./pages/coming-soon')
    },
    edit: (req, res) => {
        let idProducto = req.params.id;

        let productoBuscado = null;

        db.producto.findByPk(idProducto)
            .then(function(producto){

            if (productoBuscado != null) {
                res.render('./pages/productEditForm', { productos: productoBuscado });
            }else { res.redirect("/")}
        })
    },
    update: (req, res) => {

        let idProducto = req.params.id;

        let datosProducto = req.body;

        let nombreImagenAntigua = "";

        for (let m of products) {
            if (m.id == idProducto) {

                nombreImagenAntigua = m.image;

                // let imagenProducto = req.file;
                // console.log(imagenProducto);
                m.name = datosProducto.name;
                m.price = parseInt(datosProducto.price);
                m.category = datosProducto.category;
                // m.image = req.file.filename;
                break;
            }
        }
        fs.writeFileSync(productsFilePath, JSON.stringify(products, null, " "), "utf-8");

        fs.unlinkSync(__dirname + '/../../public/img/' + nombreImagenAntigua);

        res.redirect('/');
    },

    create: (req, res) => {
        res.render('./pages/productCreateForm')

    },
    store: (req, res) => {

        let errors = validationResult(req);
        let imagenProducto
        let nuevoProducto


        if (errors.isEmpty()) {

            if (req.file == undefined) {
                imagenProducto = 'no-image.png'

                nuevoProducto = {
                    nombre: req.body.name,
                    precio: req.body.price,
                    categoria: req.body.category,
                    imagen: imagenProducto
                };
            }
            else {
                imagenProducto = req.file.filename

                nuevoProducto = {
                    nombre: req.body.name,
                    precio: req.body.price,
                    categoria: req.body.category,
                    imagen: imagenProducto
                };
            }

            db.producto.create(
                nuevoProducto
            )

            res.redirect('/');
        }
        else {
            res.render('./pages/productCreateForm', { errors: errors.array() });
        }

    },
    detail: (req, res) => {

        let idProducto = req.params.id;

        let productoBuscado = null;

        for (let m of products) {
            if (m.id == idProducto) {
                productoBuscado = m;
                break;
            }
        }

        if (productoBuscado != null) {
            res.render('./pages/detalleProducto', {
                producto: productoBuscado
            });
        }

        res.send("Error, producto no encontrado");

    },
    destroy: (req, res) => {
        let pDeletedId = req.params.id;

        let nombreImagenAntigua = "";

        for (let o of products) {
            if (o.id == pDeletedId) {
                nombreImagenAntigua = o.image;
            }
        }

        let nuevaListaProductos = products.filter(function (e) {
            return e.id != pDeletedId;
        });

        fs.writeFileSync(productsFilePath, JSON.stringify(nuevaListaProductos, null, ' '), 'utf-8');

        fs.unlinkSync(__dirname + '/../../public/img/' + nombreImagenAntigua);

        res.redirect('/');
    }
};

module.exports = controller;