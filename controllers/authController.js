const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');

const hashPassword = (password, salt) => {
    return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex')
};

exports.signup = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (await User.findOne({ username })) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        const salt = crypto.randomBytes(16).toString('hex');
        const hashedPassword = hashPassword(password, salt);
        const newUser = new User({
            username,
            password: hashedPassword,
            salt: salt
        });
        await newUser.save();
        res.status(201).json({ message: 'User created', user: newUser.username });
    } catch (error) {
        res.status(500).json({ message: "Error in Signup", error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const hashedPassword = hashPassword(password, user.salt);
        if (hashedPassword !== user.password) {
            return res.status(400).json({ message: 'Invalid Credentials' })
        }
        const accessToken = jwt.sign({ username: user.username, id: user._id }, process.env.SECRET_KEY, { expiresIn: '2 hours' });
        res.json({ accessToken });
    } catch (error) {
        res.status(500).json({ message: 'Error in login', error: error.message });
    }
};