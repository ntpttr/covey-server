const expect = require('chai').expect;

const Game = require('../../../server/models/Game');

describe('Game Schema', function() {
  it('should be invalid if name is empty', function() {
    const game = new Game({});
    game.validate(function(err) {
      expect(err.errors.name).to.exist;
    });
  });

  it('should create a valid game', function() {
    const game = new Game({
      'name': 'testgame',
      'description': 'testdescription',
      'thumbnail': 'testthumbnail.png',
      'minPlayers': 2,
      'maxPlayers': 4,
    });
    game.validate(function(err) {
      expect(err).to.be.null;
    });
  });
});
