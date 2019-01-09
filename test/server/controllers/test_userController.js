const expect = require('chai').expect;
const sinon = require('sinon');

const User = require('../../../server/models/User');
const Group = require('../../../server/models/Group');
const userController = require('../../../server/controllers/userController');
const groupController = require('../../../server/controllers/groupController');

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
        User,
        {
          'name': 'testuser1',
          'password': 'Password123',
        }, function(auth) {
          expect(auth.status).to.eql(true);
        });
  });

  it('should fail to authenticate on invalid creds', function() {
    const encryptedPassword = (
      '$2b$10$h/AzqpzjyBeP3aIQDRBeGuyXd3lupKANLzh7nD4gOfXSZMpxRHvha');
    testUser1.password = encryptedPassword;
    const user = new User(testUser1);
    User.findOne.yields(null, user);
    userController.authenticate(
        User,
        {
          'name': 'testuser1',
          'password': 'Password321',
        }, function(auth) {
          expect(auth.status).to.eql(false);
        });
  });

  it('should list all users in the database', function() {
    const user1 = new User(testUser1);
    const user2 = new User(testUser2);
    const userList = [user1, user2];
    User.find.yields(null, userList);
    userController.listUsers(User, function(result) {
      expect(result.status).to.eql(true);
      expect(result.users).to.eql(userList);
    });
  });

  it('should get a user by id', function() {
    const user = new User(testUser1);
    User.findById.yields(null, user);
    userController.getUser(User, 'mockid', function(result) {
      expect(result.status).to.eql(true);
      expect(result.user).to.eql(user);
    });
  });

  it('should get a user by name', function() {
    const user = new User(testUser1);
    User.findById.yields(null, null);
    User.findOne.yields(null, user);
    userController.getUser(User, user.name, function(result) {
      expect(result.status).to.eql(true);
      expect(result.user).to.eql(user);
    });
  });

  it('should not get a nonexistant user', function() {
    User.findById.yields(null, null);
    User.findOne.yields(null, null);
    userController.getUser(User, 'non-user', function(result) {
      expect(result.status).to.eql(false);
    });
  });

  it('should update an existing user', function() {
    const user = new User(testUser1);
    User.findById.yields(null, user);
    userController.updateUser(
        User,
        user.name,
        {'name': 'newName'},
        function(result) {
          expect(result.status).to.eql(true);
          expect(result.user.name).to.eql('newName');
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
        function(result) {
          expect(result.status).to.eql(true);
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
        function(result) {
          expect(result.status).to.eql(true);
          expect(group.users).to.eql([]);
        });
    Group.findById.restore();
    user.getGroups.restore();
  });
});
