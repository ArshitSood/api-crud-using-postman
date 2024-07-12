const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Session = require('../models/Session')
const { sendOTP } = require('../utils/emailSender');
const { hashPassword, comparePassword } = require('../utils/bcrypto');
require('dotenv').config();
salt = Number(process.env.SALT);

exports.signup = async (req, res) => {
    try {
        const { name, email, password, mobileNumber, userType } = req.body;
        if (await User.findOne({ email })) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        const otp = Math.floor(100000 + Math.random() * 100000);
        const hashedPassword = await hashPassword(password, salt);
        const newUser = await User.create({
            name,
            email,
            password : hashedPassword,
            mobileNumber,
            userType,
            otp: otp,
            isEmailVerified: false
        });
        await sendOTP(email, otp);
        res.status(201).json({ message: 'User created! Kindly check your Email for OTP!', user: newUser.username });
    } catch (error) {
        res.status(500).json({ message: "Error Occured While Signup", error: error.message });
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found!' });
        }

        if (otp !== Number(process.env.DEFAULT_OTP) && user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP, Try Again...' });
        }
        user.isEmailVerified = true;
        await user.save();
        const token = jwt.sign({ username: user.username, id: user._id }, process.env.SECRET_KEY, { expiresIn: '2 hours' });
        const newSession = await Session.create({
            userId: user.id,
            accessToken: token,
            status: "active"
        });
        user.password = undefined;
    
        return res.status(200).json({ message: 'Email verified successfully', user , token: newSession.accessToken});
    } catch (error) {
        res.status(500).json({ message: 'Error in email verification', error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid Email' });
        }
        if (!user.isEmailVerified) {
            return res.status(400).json({ message: 'Email not verified' });
        }
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid Password' });
        }
        const token = jwt.sign({ username: user.username, id: user._id }, process.env.SECRET_KEY, { expiresIn: '2 hours' });
        const newSession = await Session.create({
            userId: user.id,
            accessToken: token,
            status: "active"
        });
        user.password = undefined;

        res.status(200).json({ message: 'Logged In Successfully', user, token: newSession.accessToken });
    } catch (error) {
        res.status(500).json({ message: 'Error in login', error: error.message });
    }
};

exports.logout = async (req, res) => {
    try {
        const accessToken = await req.headers.authorization.split(' ')[1];
        const session = await Session.findOne({ accessToken });
        session.status = "logged_out";
        await session.save();
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error in logout', error: error.message });
    }
};