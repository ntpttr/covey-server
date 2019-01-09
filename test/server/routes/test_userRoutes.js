const supertest = require('supertest');
const expect = require('chai').expect;
const sinon = require('sinon');
const mockRequire = require('mock-require');

describe('userRoutes', function() {
  const userController = require('../../../server/controllers/userController');
  mockRequire('../../../server/controllers/userController', userController);
  const app = require('../../../app');
  server = app.startServer(app.server);
  request = supertest.agent(server);

  after(function(done) {
    server.close();
    done();
  });

  it('should list all users', function(done) {
    sinon.stub(userController, 'listUsers');
    const expected = {'status': true, 'users': ['user1']};
    userController.listUsers.callsArgWith(1, expected);
    request
        .get('/users')
        .expect('Content-type', /json/)
        .expect(200)
        .end(function(err, res) {
          expect(res.body).to.eql(expected);
          userController.listUsers.restore();
          done();
        });
  });
});
