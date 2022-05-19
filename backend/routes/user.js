// const { query } = require('express');
const express = require('express');
const connection = require('../connection');
const router = express.Router();

const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();
var auth = require('../services/auth');
var checkRole = require('../services/checkRole');

//New User SignUp
router.post('/signup', (req, res) => {
    let user = req.body;
    query = "select email, password, role, status from user where email = ?";
    connection.query(query, [user.email], (err, results) => {
        if(!err) {
            if(results.length <= 0) {
                query = "insert into user (name, contactNumber, email, password, role, status) values (?, ?, ?, ?, 'user', 'false')";
                connection.query(query, [user.name, user.contactNumber, user.email, user.password], (err, results) => {
                    if(!err) {
                        return res.status(200).json({
                            message: "User created successfully"
                        })
                    } else {
                        return res.status(500).json({
                            message: "Error while creating User!"
                        })
                    }
                })
            } else {
                return res.status(400).json({
                    message: "Email already exists"
                })
            }
        } else {
            return res.status(500).json(err);
        }
    }) // end of query
})

//User/Admin Login
router.post('/login', (req, res) => {
    const user = req.body;
    query = "select email, password, role, status from user where email=?";
    connection.query(query, [user.email], (err, results) => {
        if(!err) {
            console.log("results" , results[0].email);
            if(results[0].length <= 0 || results[0].password != user.password) {
                return res.status(401).json({
                    message: "Invalid credentials"
                });
            } else if (results[0].status === 'false') {
                return res.status(401).json({
                    message: "User is not verified, wait for admin to verify you"
                });
            } else if (results[0].password == user.password) {
                const response = { email: results[0].email, role: results[0].role }
                const accessToken = jwt.sign(response, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
                res.status(200).json({
                    token: accessToken
                })
            } else {
                return res.status(400).json({
                    message: "Something went wrong! Try again later."
                });
            }
        } else {
            return res.status(500).json(err);
        }
    })
})

//Mailinator Email Verification
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});

//Forget Password
router.post('/forgetPassword', (req, res) => {
    const user = req.body;
    query = "select email, password from user where email = ?";
    connection.query(query, [user.email], (err, results) => {
        console.log('results', results);
        if(!err) {
            if (results.length <= 0) {
                return res.status(200).json({
                    message: "Email not found"
                })
            } else {
                var mailOptions = {
                    from: process.env.EMAIL,
                    to: results[0].email,
                    subject: 'Password Reset by RaastaCafe',
                    html: '<p><b>Your login details fro Raasta Cafe</b><br><b>Email: </b>'+results[0].email+'<br><b>Password: </b>'+results[0].password+'<br><a href = "http://localhost:4200/">Click here to login</a></p>'    
                };
                transporter.sendMail(mailOptions, function(error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });
                return res.status(200).json({
                    message: "Password sent successfully to your email"
                });
            }
        } else {
            return res.status(500).json(err);
        }
    })
})

//Get all users
router.get('/get', auth.authToken, checkRole.checkRole, (req, res) => {
    var query =  "select id, name, contactNumber, email, status from user where role = 'user'";
    connection.query(query, (err, results) => {
        if (!err) {
            return res.status(200).json(results);
        } else {
            return res.status(500).json(err);
        }
    })
})

//Update/Change user status
router.patch('/update', auth.authToken, checkRole.checkRole, (req, res) => {
    let user = req.body;
    var query = "update user set status = ? where id = ?";
    connection.query(query, [user.status, user.id], (err, results) => {
        if (!err) {
            if (results.affectedRows == 0) {
                return res.status(404).json({
                    message: 'User id not found'
                });
            }
            return res.status(200).json({
                message: 'User updated successfully'
            })
        } else {
            res.status(500).json(err);
        }
    })
})

//
router.get('/checkToken', auth.authToken, (req, res) => {
    return res.status(200).json({
        message: 'True'
    })
})

//Update password
router.post('/changePassword', auth.authToken, (req, res) => {
    const user = req.body;
    const email = res.locals.email;
    console.log('Email-->',email);
    query = "select * from user where email = ? and password = ?";
    connection.query(query, [email, user.oldPassword], (err, results) => {
        if (!err) {
            if (results.length <= 0) {
                return res.status(400).json({
                    message: 'Old password is incorrect'
                }); 
            } else if  (results[0].password == user.oldPassword) {
                query = "update user set password = ? where email = ?"
                connection.query(query, [user.newPassword, email], (err, results) => {
                    if (!err) {
                        return res.status(200).json({
                            message: 'Password updated successfully'
                        });
                    } else {
                        return res.status(500).json(err);
                    }
                });
            } else {
                return res.status(400).json({
                    message: 'Something went wrong! Try again later.'
                });
            }
        } else {
            return res.status(500).json(err);
        }
    })
})

module.exports = router;