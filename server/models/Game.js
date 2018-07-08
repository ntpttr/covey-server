// server/models/Game.js

const mongoose = require('mongoose');

let gameSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    thumbnail: { type: String },
    image: { type: String },
    minPlayers: { type: Number },
    maxPlayers: { type: Number },
    playingTime: { type: Number }
});

module.exports = mongoose.model('Game', gameSchema);
