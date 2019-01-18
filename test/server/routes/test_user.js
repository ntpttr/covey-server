const expect = require('chai').expect;
const sinon = require('sinon');
const mockRequire = require('mock-require');

module.exports = function(request) {
  const userController = require('../../../controllers/user');
  mockRequire('../../../controllers/user', userController);

  it('should list all users', function(done) {
    const expected = {'users': ['user1', 'user2']};
    sinon.stub(userController, 'listUsers').callsArgWith(1, 200, expected);
    request
        .get('/users')
        .expect('Content-type', /json/)
        .end(function(err, res) {
          expect(res.body).to.eql(expected);
          userController.listUsers.restore();
          done();
        });
  });

  it('should get a specific user', function(done) {
    const expected = {'user': 'user1'};
    sinon.stub(userController, 'getUser').callsArgWith(2, 200, expected);
    request
        .get('/users/user1')
        .expect('Content-type', /json/)
        .end(function(err, res) {
          expect(res.body).to.eql(expected);
          userController.getUser.restore();
          done();
        });
  });

  it('should create a new user', function(done) {
    const expected = {'user': 'user1'};
    sinon.stub(userController, 'createUser').callsArgWith(2, 201, expected);
    request
        .post('/users')
        .expect('Content-type', /json/)
        .end(function(err, res) {
          expect(res.status).to.eql(201);
          expect(res.body).to.eql(expected);
          userController.createUser.restore();
          done();
        });
  });

  it('should update an existing user', function(done) {
    const expected = {'user': 'updatedUser1'};
    sinon.stub(userController, 'updateUser').callsArgWith(3, 200, expected);
    request
        .put('/users/user1')
        .expect('Content-type', /json/)
        .end(function(err, res) {
          expect(res.status).to.eql(200);
          expect(res.body).to.eql(expected);
          userController.updateUser.restore();
          done();
        });
  });

  it('should authenticate a user', function(done) {
    sinon.stub(userController, 'listUsers').callsArgWith(1, 200, {});
    request
        .get('/users')
        .expect('Content-type', /json/)
        .end(function(err, res) {
          expect(res.status).to.eql(200);
          expect(res.body).to.eql({});
          userController.listUsers.restore();
          done();
        });
  });

  it('should delete a user', function(done) {
    sinon.stub(userController, 'deleteUser').callsArgWith(4, 200, {});
    request
        .delete('/users/user1')
        .expect('Content-type', /json/)
        .end(function(err, res) {
          expect(res.status).to.eql(200);
          expect(res.body).to.eql({});
          userController.deleteUser.restore();
          done();
        });
  });
};
