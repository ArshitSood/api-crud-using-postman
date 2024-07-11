exports.errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('I dont Know What Happened LOL');
};