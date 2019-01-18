const expect = require('chai').expect;
const sinon = require('sinon');

const User = require('../../../models/User');
const Group = require('../../../models/Group');
const userController = require('../../../controllers/user');
const groupController = require('../../../controllers/group');

const testUser1 = {
  'name': 'testuser1',
  'password': 'Password123',
};

const testUser2 = {
  'name': 'testuser2',
  'password': 'Password123',
};

describe('User Controller', function() {
  beforeEach(function() {
    sinon.stub(User, 'findOne');
    sinon.stub(User, 'find');
    sinon.stub(User, 'findById');
    sinon.stub(User, 'findByIdAndRemove');
  });

  afterEach(function() {
    User.findOne.restore();
    User.find.restore();
    User.findById.restore();
    User.findByIdAndRemove.restore();
  });

  it('should authenticate a valid user', function() {
    const encryptedPassword = (
      '$2b$10$h/AzqpzjyBeP3aIQDRBeGuyXd3lupKANLzh7nD4gOfXSZMpxRHvha');
    testUser1.password = encryptedPassword;
    const user = new User(testUser1);
    User.findOne.yields(null, user);
    userController.authenticate(
        User, {'name': 'testuser1', 'password': 'Password123'},
        function(status, body) {
          expect(status).to.eql(200);
          expect(body).to.eql({});
        });
  });

  it('should fail to authenticate on invalid creds', function() {
    const encryptedPassword = (
      '$2b$10$h/AzqpzjyBeP3aIQDRBeGuyXd3lupKANLzh7nD4gOfXSZMpxRHvha');
    testUser1.password = encryptedPassword;
    const user = new User(testUser1);
    User.findOne.yields(null, user);
    userController.authenticate(
        User, {'name': 'testuser1', 'password': 'Password321'},
        function(status, body) {
          expect(status).to.eql(401);
          expect(body).to.eql({'message': 'Invalid username or password.'});
        });
  });

  it('should list all users in the database', function() {
    const user1 = new User(testUser1);
    const user2 = new User(testUser2);
    const userList = [user1, user2];
    User.find.yields(null, userList);
    userController.listUsers(User, function(status, body) {
      expect(status).to.eql(200);
      expect(body.users).to.eql(userList);
    });
  });

  it('should get a user by id', function() {
    const user = new User(testUser1);
    User.findById.yields(null, user);
    userController.getUser(User, 'mockid', function(status, body) {
      expect(status).to.eql(200);
      expect(body.user).to.eql(user);
    });
  });

  it('should get a user by name', function() {
    const user = new User(testUser1);
    User.findById.yields(null, null);
    User.findOne.yields(null, user);
    userController.getUser(User, user.name, function(status, body) {
      expect(status).to.eql(200);
      expect(body.user).to.eql(user);
    });
  });

  it('should not get a nonexistant user', function() {
    User.findById.yields(null, null);
    User.findOne.yields(null, null);
    userController.getUser(User, 'non-user', function(status, body) {
      expect(status).to.eql(404);
      expect(body.message).to.eql('User non-user not found.');
    });
  });

  it('should update an existing user', function() {
    const user = new User(testUser1);
    User.findById.yields(null, user);
    userController.updateUser(
        User,
        user.name,
        {'name': 'newName'},
        function(status, body) {
          expect(status).to.eql(200);
          expect(body.user.name).to.eql('newName');
        });
  });

  it('should delete an existing user', function() {
    const user = new User(testUser1);
    sinon.stub(user, 'getGroups');
    User.findById.yields(null, user);
    user.getGroups.returns([]);
    User.findByIdAndRemove.yields(null, user);
    userController.deleteUser(
        User,
        Group,
        groupController,
        'mockid',
        function(status, body) {
          expect(status).to.eql(200);
          expect(body).to.eql({});
        });
    user.getGroups.restore();
  });

  it('should delete a user from group lists on user deletion', function() {
    sinon.stub(Group, 'findById');
    const user = new User(testUser1);
    sinon.stub(user, 'getGroups');
    user._id = 'fakeid';
    const group = new Group({
      'name': 'testgroup',
      'users': [
        {
          'user': user._id,
          'name': user.name,
          'stats': [],
        },
      ],
      'games': [],
    });
    User.findById.yields(null, user);
    user.getGroups.returns(['fakegroupid']);
    Group.findById.yields(null, group);
    User.findByIdAndRemove.yields(null, user);
    userController.deleteUser(
        User,
        Group,
        groupController,
        user._id,
        function(status, body) {
          expect(status).to.eql(200);
          expect(group.users).to.eql([]);
        });
    Group.findById.restore();
    user.getGroups.restore();
  });
});
