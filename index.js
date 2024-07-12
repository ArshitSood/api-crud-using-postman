const express = require('express');
const app = express();
const connectDB = require('./config/database');
require('dotenv').config();

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('./public'));
app.set('view engine', 'ejs');

connectDB();

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');

app.use('/auth', authRoutes);
app.use('/posts', postRoutes);

app.get('/error', (req, res, next) => {
    const err = new Error('Something went wrong!');
    next(err);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('I dont Know What Happened LOL');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});