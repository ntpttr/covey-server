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
    const expected = {'status': true, 'users': ['user1', 'user2']};
    sinon.stub(userController, 'listUsers').callsArgWith(1, expected);
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

  it('should get a specific user', function(done) {
    const expected = {'status': true, 'user': 'user1'};
    sinon.stub(userController, 'getUser').callsArgWith(2, expected);
    request
        .get('/users/user1')
        .expect('Content-type', /json/)
        .expect(200)
        .end(function(err, res) {
          expect(res.body).to.eql(expected);
          userController.getUser.restore();
          done();
        });
  });

  it('should create a new user', function(done) {
    const expected = {'status': true, 'user': 'user1'};
    sinon.stub(userController, 'createUser').callsArgWith(2, expected);
    request
        .post('/users')
        .expect('Content-type', /json/)
        .expect(200)
        .end(function(err, res) {
          expect(res.body).to.eql(expected);
          userController.createUser.restore();
          done();
        });
  });

  it('should update an existing user', function(done) {
    const expected = {'status': true, 'user': 'updatedUser1'};
    sinon.stub(userController, 'updateUser').callsArgWith(3, expected);
    request
        .put('/users/user1')
        .expect('Content-type', /json/)
        .expect(200)
        .end(function(err, res) {
          expect(res.body).to.eql(expected);
          userController.updateUser.restore();
          done();
        });
  });

  it('should authenticate a user', function(done) {
    const expected = {'status': true, 'users': ['user1', 'user2']};
    sinon.stub(userController, 'listUsers').callsArgWith(1, expected);
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

  it('should delete a user', function(done) {
    const expected = {'status': true};
    sinon.stub(userController, 'deleteUser').callsArgWith(4, expected);
    request
        .delete('/users/user1')
        .expect('Content-type', /json/)
        .expect(200)
        .end(function(err, res) {
          expect(res.body).to.eql(expected);
          userController.deleteUser.restore();
          done();
        });
  });
});
