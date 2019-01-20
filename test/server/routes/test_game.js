const expect = require('chai').expect;
const sinon = require('sinon');
const mockRequire = require('mock-require');

module.exports = function(request) {
  const gameController = require('../../../controllers/game');
  mockRequire('../../../controllers/game', gameController);

  it('should list all games', function(done) {
    const expected = {'games': ['game1', 'game2']};
    sinon.stub(gameController, 'listGamesDb').callsArgWith(1, 200, expected);
    request
        .get('/games')
        .expect('Content-type', /json/)
        .end(function(err, res) {
          expect(res.status).to.eql(200);
          expect(res.body).to.eql(expected);
          gameController.listGamesDb.restore();
          done();
        });
  });

  it('should get a specific game', function(done) {
    const expected = {'game': 'game1'};
    sinon.stub(gameController, 'getGameDb').callsArgWith(2, 200, expected);
    request
        .get('/games/game1')
        .expect('Content-type', /json/)
        .end(function(err, res) {
          expect(res.status).to.eql(200);
          expect(res.body).to.eql(expected);
          gameController.getGameDb.restore();
          done();
        });
  });

  it('should get a specific game from boardgamegeek', function(done) {
    const expected = {'game': 'game1'};
    sinon.stub(gameController, 'getGameBgg').callsArgWith(1, 200, expected);
    request
        .get('/games/bgg/game1')
        .expect('Content-type', /json/)
        .end(function(err, res) {
          expect(res.status).to.eql(200);
          expect(res.body).to.eql(expected);
          gameController.getGameBgg.restore();
          done();
        });
  });

  it('should save a custom game', function(done) {
    const expected = {'game': 'game1'};
    sinon.stub(
        gameController,
        'saveCustomGame').callsArgWith(2, 201, expected);
    request
        .post('/games')
        .expect('Content-type', /json/)
        .end(function(err, res) {
          expect(res.status).to.eql(201);
          expect(res.body).to.eql(expected);
          gameController.saveCustomGame.restore();
          done();
        });
  });

  it('should save a game from boardgamegeek', function(done) {
    const expected = {'game': 'game1'};
    sinon.stub(gameController, 'saveBggGame').callsArgWith(2, 201, expected);
    request
        .post('/games/bgg')
        .expect('Content-type', /json/)
        .end(function(err, res) {
          expect(res.status).to.eql(201);
          expect(res.body).to.eql(expected);
          gameController.saveBggGame.restore();
          done();
        });
  });

  it('should delete a game from the database', function(done) {
    sinon.stub(gameController, 'deleteGame').callsArgWith(2, 200, {});
    request
        .delete('/games/game1')
        .expect('Content-type', /json/)
        .end(function(err, res) {
          expect(res.status).to.eql(200);
          expect(res.body).to.eql({});
          gameController.deleteGame.restore();
          done();
        });
  });
};
