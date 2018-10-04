const expect = require('chai').expect;
const mongoose = require('mongoose');
const utils = require('../../utils');

const Game = require('../../../server/models/Game');
const Group = require('../../../server/models/Group');
const User = require('../../../server/models/User');


// User model
var testUser = {
    'name': 'testuser',
    'password': 'Password123'
};

// Game model
var testGame = {
    'name': 'testgame'
};

describe('group', function() {

    it('should be invalid if name is empty', function() {
        var g = new Group({});
        g.validate(function(err) {
            expect(err.errors.name).to.exist;
        });
    });

    it('should add users to its user list', function(done) {
        var user = new User(testUser);
        var group = new Group({
            name: "testGroup"
        });
        expected = user._id;
        group.addUser(user._id);
        expect(group.users[0].user).to.eql(expected);
        done();
    });

    it('should delete a user from user list', function(done) {
        var user = new User(testUser);
        var group = new Group({
            name: "testGroup",
            users: [{
                user: user._id,
                stats: []
            }]
        });
        expected = [];
        group.deleteUser(user._id);
        console.log(group.users);
        expect(group.users).to.eql(expected);
        done()
    });

    it('should add games to its game list', function (done) {
        var game = new Game(testGame);
        var group = new Group({
            name: "testGroup"
        });
        expected = [game._id]
        group.addGame(game._id);
        expect(group.games).to.eql(expected);
        done();
    });

    it('should delete games from its game list', async function (done) {
        var game = new Game(testGame);
        var group = new Group({
            name: "testGroup",
            games: [game._id]
        });
        expected = [];
        group.deleteGame(game._id);
        expect(group.games).to.eql(expected);
        done()
    });
});