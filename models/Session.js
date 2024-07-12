const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: false
    },
    accessToken: {
        type: String,
        required: true,
        unique: false
    },
    status: {
        type: String,
        enum: ["active","inActive","Expired","logged_out"],
    },
    deviceId: {
        type: Number
    },
},{timestamps: true});

module.exports = mongoose.model('Session', sessionSchema);