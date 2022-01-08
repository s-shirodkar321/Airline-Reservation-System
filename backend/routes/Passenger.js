const express = require('express');
const passengerSchema = require('../models/Passenger');
const router = express.Router();
const bcrypt = require('bcryptjs');
const validateRegisterInput = require('../validation/register');
const validateLoginInput = require('../validation/login');
const bookingSchema = require('../models/Booking');

router.post('/register', (req, res) => {
    // Form validation
    const { errors, isValid } = validateRegisterInput(req.body);
    // Check validation
    if (!isValid) {
        return res.status(400).json(errors);
    }
    passengerSchema.findOne({ emailID: req.body.emailID }).then((user) => {
        if (user) {
            return res.status(400).json({ email: 'Email already exists' });
        } else {
            const newUser = new passengerSchema({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                emailID: req.body.emailID,
                password: req.body.password,
            });
            // Hash password before saving in database
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) throw err;
                    newUser.password = hash;
                    newUser
                        .save()
                        .then((user) => res.json(user))
                        .catch((err) => console.log(err));
                });
            });
        }
    });
});

router.post('/login', (req, res) => {
    // Form validation
    const { errors, isValid } = validateLoginInput(req.body);
    // Check validation
    if (!isValid) {
        return res.status(400).json(errors);
    }
    const emailID = req.body.emailID;
    const password = req.body.password;
    // Find user by email
    passengerSchema.findOne({ emailID }).then((user) => {
        // Check if user exists
        if (!user) {
            return res.status(404).json({ emailnotfound: 'Email not found' });
        }
        // Check password
        bcrypt.compare(password, user.password).then((isMatch) => {
            if (isMatch) {
                // User matched
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('Successful Login');
            } else {
                return res.status(400).json({ passwordincorrect: 'Password incorrect' });
            }
        });
    });
});

router.post('/userDashboardDetails', (req, res) => {
    const emailID = req.body.emailID;

    // Find user by email
    passengerSchema.findOne({ emailID }).then((user) => {
        // Check if user exists
        if (!user) {
            return res.status(404).json({ emailnotfound: 'Email not found' });
        } else {
            res.json({
                firstName: user.firstName,
                lastName: user.lastName,
                mileageRewards: user.mileageRewards,
            });
        }
    });
});

router.post('/userBookings', (req, res) => {
    const parentEmail = req.body.emailID;
    console.log(parentEmail)
    console.log(parentEmail);
    try{
        bookingSchema.find({ parentEmailID: parentEmail }).then((userBookings) => {
        // Check if user exists
        console.log(userBookings);
        if (!userBookings) {
            return res.status(404).json({ message: 'No Bookings Found' });
        } else {
            res.json({
                userBookings
            });
        }
    });
    }
    catch (error) {
        console.log(error);
    }

    
});

module.exports = router;
