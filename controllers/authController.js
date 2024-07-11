const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.signup = async (req, res) => {
    const { username, password } = req.body;
    if (await User.findOne({ username })) {
        return res.status(400).json({ message: 'Username already exists' });
    }
    const newUser = new User({ username, password });
    await newUser.save();
    res.status(201).json({ message: 'User created', user: newUser });
};

exports.login = async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });

    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const accessToken = jwt.sign({ username: user.username, id: user._id }, process.env.SECRET_KEY, { expiresIn: '2 hours' });
    res.json({ accessToken });
};