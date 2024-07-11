const express = require('express');
const router = express.Router();

// Error handling
router.get('/', (req, res, next) => {
    const err = new Error('Something went wrong!');
    next(err);
});

router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Internal Server Error');
});

module.exports = router;
