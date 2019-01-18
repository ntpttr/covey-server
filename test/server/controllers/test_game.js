const expect = require('chai').expect;
const sinon = require('sinon');

const Game = require('../../../models/Game');
const gameController = require('../../../controllers/game');

const testGame = {
  name: 'testgame',
  description: 'game description',
  thumbnail: '/path/to/thumbnail',
  image: '/path/to/image',
  minPlayers: 2,
  maxPlayers: 4,
  playingTime: 30,
};

describe('Game Controller', function() {
  beforeEach(function() {
    sinon.stub(Game, 'findOne');
    sinon.stub(Game, 'find');
    sinon.stub(Game, 'findById');
    sinon.stub(Game, 'findByIdAndRemove');
  });

  afterEach(function() {
    Game.findOne.restore();
    Game.find.restore();
    Game.findById.restore();
    Game.findByIdAndRemove.restore();
  });

  it('should list all games in the database', function() {
    const game = new Game(testGame);
    const gameList = [game];
    Game.find.yields(null, gameList);
    gameController.listGamesDb(Game, function(status, body) {
      expect(status).to.eql(200);
      expect(body.games).to.eql(gameList);
    });
  });

  it('should get a game by id', function() {
    const game = new Game(testGame);
    Game.findById.yields(null, game);
    gameController.getGameDb(Game, 'mockid', function(status, body) {
      expect(status).to.eql(200);
      expect(body.game).to.eql(game);
    });
  });

  it('should get a game by name', function() {
    const game = new Game(testGame);
    Game.findById.yields(null, null);
    Game.findOne.yields(null, game);
    gameController.getGameDb(Game, game.name, function(status, body) {
      expect(status).to.eql(200);
      expect(body.game).to.eql(game);
    });
  });

  it('should not get a nonexistant game', function() {
    Game.findById.yields(null, null);
    Game.findOne.yields(null, null);
    gameController.getGameDb(Game, 'non-game', function(status, body) {
      expect(status).to.eql(404);
      expect(body.message).to.eql('Game non-game not found in the database.');
    });
  });

  it('should save a new game', function() {
    const game = new Game(testGame);
    sinon.stub(game, 'save');
    game.save.yields(null);
    gameController.saveCustomGame(Game, testGame, function(status, body) {
      expect(status).to.eql(201);
      expect(body.game).to.eql(game);
    });
  });

  it('should not save a duplicate game', function() {
    const game = new Game(testGame);
    sinon.stub(game, 'save');
    game.save.yields({'code': 11000});
    gameController.saveCustomGame(Game, testGame, function(status, body) {
      expect(status).to.eql(409);
      expect(body.message).to.eql('Game testgame already exists.');
    });
    game.save.restore();
  });

  it('should delete an existing game', function() {
    const game = new Game(testGame);
    Game.findByIdAndRemove.yields(null, game);
    gameController.deleteGame(Game, 'mockid', function(status, body) {
      expect(status).to.eql(200);
    });
  });
});
