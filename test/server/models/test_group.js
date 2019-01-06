const expect = require('chai').expect;

const Game = require('../../../server/models/Game');
const Group = require('../../../server/models/Group');
const User = require('../../../server/models/User');


// User model
const testUser = {
  'name': 'testuser',
  'password': 'Password123',
};

// Game model
const testGame = {
  'name': 'testgame',
};

describe('group', function() {
  it('should be invalid if name is empty', function() {
    const group = new Group({});
    group.validate(function(err) {
      expect(err.errors.name).to.exist;
    });
  });

  it('should add users to its user list', function(done) {
    const user = new User(testUser);
    const group = new Group({
      'name': 'testgroup',
    });
    expected = user._id;
    group.addUser(user._id, user.name);
    expect(group.users[0].user).to.eql(expected);
    done();
  });

  it('should delete a user from user list', function(done) {
    const user = new User(testUser);
    const group = new Group({
      'name': 'testgroup',
      'users': [{
        'user': user._id,
        'name': user.name,
        'stats': [],
      }],
    });
    expected = [];
    group.deleteUser(user._id);
    expect(group.users).to.eql(expected);
    done();
  });

  it('should add games to its game list', function(done) {
    const game = new Game(testGame);
    const group = new Group({
      'name': 'testgroup',
    });
    expected = game._id;
    group.addGame(game._id);
    expect(group.games[0]).to.eql(expected);
    done();
  });

  it('should delete games from its game list', function(done) {
    const game = new Game(testGame);
    const group = new Group({
      'name': 'testgroup',
      'games': [game._id],
    });
    expected = [];
    group.deleteGame(game._id);
    expect(group.games).to.eql(expected);
    done();
  });
});
