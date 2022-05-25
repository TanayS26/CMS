const express = require('express');
const connection = require('../connection');
const router = express.Router();
let ejs = require('ejs');
let pdf = require('html-pdf');
let path = require('path');
var fs = require('fs');
var uuid = require('uuid');
var auth = require('../services/auth');
var checkRole = require('../services/checkRole');

router.post('/generateReport', auth.authToken, (req, res) => {
    const generatedUuid =  uuid.v1();
    const orderDetails = req.body;
    var productDetailsReport = JSON.parse(orderDetails.productDetails);
 
    console.log(orderDetails);

    // productDetailsReport.forEach(product => {
    //     product.total = product.quantity * product.price;
    // })

    // console.log(productDetailsReport);

    var query = "insert into bill (name, uuid, email, contactNumber, paymentMethod, amount, productDetails, createdBy) values (?, ?, ?, ?, ?, ?, ?, ?)";

    // console.log(orderDetails)
    console.log("Total Amount : " + orderDetails.totalAmount);

    connection.query(query, [orderDetails.name, generatedUuid, orderDetails.email, orderDetails.contactNumber, orderDetails.paymentMethod, orderDetails.totalAmount, orderDetails.productDetails, res.locals.email], (err, result) => {
        if (!err) {
            ejs.renderFile(path.join(__dirname, '', "report.ejs"), { productDetails: productDetailsReport, name: orderDetails.name, email: orderDetails.email, contactNumber: orderDetails.contactNumber, paymentMethod: orderDetails.paymentMethod, totalAmount: orderDetails.totalAmount}, (err, results) => {
                if(err) {
                    return res.status(500).json(err);
                } else {
                    pdf.create(results).toFile('./generated_pdf/' + generatedUuid + ".pdf", function(err, data){
                        if(err) {
                            console.log(err);
                            return res.status(500).json(err);
                        } else {
                            return res.status(200).json({
                                uuid: generatedUuid,
                            });
                        }
                    })
                }
            })
        } else {
            res.status(500).json(err);
        }
    })
})

router.post('/getPdf', auth.authToken, function(req, res) {
    const orderDetails = req.body;
    const pdfPath = './generated_pdf/' + orderDetails.uuid + '.pdf';
    if (fs.existsSync(pdfPath)) {
        res.contentType("application/pdf");
        fs.createReadStream(pdfPath).pipe(res);
    } else {
        var productDetailsReport = JSON.parse(orderDetails.productDetails);
        ejs.renderFile(path.join(__dirname, '', "report.ejs"), { productDetails: productDetailsReport, name: orderDetails.name, email: orderDetails.email, contactNumber: orderDetails.contactNumber, paymentMethod: orderDetails.paymentMethod, totalAmount: orderDetails.amount}, (err, results) => {
            if(err) {
                return res.status(500).json(err);
            } else {
                pdf.create(results).toFile('./generated_pdf/' + orderDetails.uuid + '.pdf', function(err, data){
                    if(err) {
                        console.log(err);
                        return res.status(500).json(err);
                    } else {
                        res.contentType("application/pdf");
                        fs.createReadStream(pdfPath).pipe(res);
                    }
                })
            }
        })
    }
})

router.get('/getBills', auth.authToken, (req, res, next) => {
    var query = "select * from bill order by id DESC";
    connection.query(query, (err, results) => {
        if (!err) {
            return res.status(200).json(results);
        } else {
            return res.status(500).json(err);
        }
    })
})

router.delete('/delete/:id', auth.authToken, (req, res, next) => {
    const id = req.params.id;
    var query = "delete from bill where id = ?";
    connection.query(query, [id], (err, results) => {
        if (!err) {
            if (results.affectedRows == 0) {
                return res.status(404).json({
                    message: "Bill not found"
                })
            }
            return res.status(200).json({
                message: "Bill deleted successfully"
            })
        } else {
            return res.status(500).json(err);
        }
    })
})


module.exports = router;
