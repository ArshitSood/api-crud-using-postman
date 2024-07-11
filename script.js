const express = require('express');
const app = express();
const connectDB = require('./config/database');
require('dotenv').config();

const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('./public'));
app.set('view engine', 'ejs');

// Connect to MongoDB
connectDB();

// Import routes
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');

// Use routes
app.use('/auth', authRoutes);
app.use('/posts', postRoutes);

// Error handling route
app.get('/error', (req, res, next) => {
    const err = new Error('Something went wrong!');
    next(err);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('I dont Know What Happened LOL');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});