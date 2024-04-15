const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require('../Models/User');
const { generateTocken } = require('../Services/AuthServices');
const { body, validationResult } = require('express-validator');

router.post('/signup',
    body('name', 'Name Cannot be empty').notEmpty(),
    body('email', "Enter a valid Email").isEmail(),
    body('password', 'password Cannot be empty').notEmpty(), async (req, res) => {
        try {
            const result = validationResult(req);
            if (!result.isEmpty()) {
                return res.status(401).json({ msg: "Invalid Email Address or Name and Password caannot be empty" });
            }
            const { name, email, password } = req.body;
            let user = await User.findOne({ email });
            if (user) {
                return res.status(401).json({ msg: "Email already registered. Try to Login to your account" });
            }

            bcrypt.genSalt(10, function (err, salt) {
                bcrypt.hash(password, salt, async function (err, hashedPassord) {
                    if(err){
                        throw new Error(err);
                    }
                    user = await User.create({
                        name,
                        email,
                        password: hashedPassord
                    });
                    const authTocken = generateTocken({ name: user.name, email: user.email, _id: user._id });
                    return res.json({ authTocken, user: user.name,email:user.email, msg: "Registration successfull" });
                });
            });
        } catch (error) {
            return res.status(501).json({ msg: "Internal Server Error" });
        }
    })

router.post('/login',
    body('email', "Enter a valid Email").isEmail(),
    body('password', 'password Cannot be empty').notEmpty(), async (req, res) => {
        try {
            const result = validationResult(req);
            if (!result.isEmpty()) {
                return res.status(401).json({ msg: "Invalid Email Address or Password caannot be empty" });
            }
            const { email, password } = req.body;
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({ msg: "Invalid credentials" });
            }
            bcrypt.compare(password, user.password, function (err, result) {
                if(err){
                    throw new Error(err);
                }
                if (result) {
                    const authTocken = generateTocken({ name: user.name, email: user.email, _id: user._id });
                    return res.json({ authTocken, user: user.name,email:user.email, msg: "Login successful" });
                }
                else {
                    return res.status(401).json({ msg: "Invalid credentials" });
                }
            });
        } catch (error) {
            return res.status(501).json({ msg: "Internal Server error" });
        }
    });

module.exports = router;