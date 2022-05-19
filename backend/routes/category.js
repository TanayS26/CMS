const express = require('express');
const connection = require('../connection');
const router = express.Router();

var auth = require('../services/auth');
var checkRole = require('../services/checkRole');

//Add Category
router.post('/add', auth.authToken, checkRole.checkRole, (req, res, next) => {
    let category = req.body;
    query = "insert into category (name) values (?)";
    connection.query(query, [category.name], (err, results) => {
        if (!err) {
            return res.status(200).json({
                message: "Category added successfully"
            })
        } else {
            return res.status(500).json({
                message: "Error while adding category"
            })
        }
    })
})

//Get all category
router.get('/get', auth.authToken, checkRole.checkRole, (req, res, next) => {
    var query = "select * from category order by name";
    connection.query(query, (err, results) => {
        if (!err) {
            return res.status(200).json(results);
        } else {
            return res.status(500).json(err);
        }
    })
})

//Update category
router.patch('/update', auth.authToken, checkRole.checkRole, (req, res, next) => {
    let product = req.body;
    var query = "update category set name = ? where id = ?";
    connection.query(query, [product.name, product.id], (err, results) => {
        if (!err) {
            if (results.affectedRows == 0) {
                return res.status(404).json({
                    message: "Category not found"
                })
            } else {
                return res.status(200).json({
                    message: "Category updated successfully"
                })
            }
        } else {
            return res.status(500).json(err);
        }
    })
})


module.exports = router;