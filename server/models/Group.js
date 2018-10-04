// server/models/Group.js

const mongoose = require('mongoose');

let groupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    users: [ { 
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        stats: [ {
            game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game' },
            wins: Number,
            losses: Number
        } ]
    } ],
    games: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Game' } ]
});

groupSchema.methods.addUser = function(userId) {
    if (this.users.indexOf(userId) === -1) {
        if (mongoose.Types.ObjectId.isValid(userId)) {
            var stats = []
            for (var i = 0; i < this.games.length; i++) {
                stats.push({
                    game: this.games[i],
                    wins: 0,
                    losses: 0
                })
            }
            this.users.push({user: userId, stats: stats});
        }
    }
    return this.save();
}

groupSchema.methods.deleteUser = function(userId) {
    var index = -1;
    for (var i=0; i< this.users.length; i++) {
        if (this.users[i].user == userId) {
            index = i;
        }
    }
    if (index >= 0) {
        this.users.splice(index, 1);
    }
    return this.save();
}

groupSchema.methods.addGame = function(gameId) {
    if (this.games.indexOf(gameId) === -1) {
        if (mongoose.Types.ObjectId.isValid(gameId)) {
            this.games.push(gameId);
        }
    }   
    return this.save();
}

groupSchema.methods.deleteGame = function(gameId) {
    var index = this.games.indexOf(gameId);
    if (index >= 0) {
        this.games.splice(index, 1); 
    }   
    return this.save();
}

module.exports = mongoose.model('Group', groupSchema);
