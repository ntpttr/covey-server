const expect = require('chai').expect;

const Group = require('../../../models/Group');
const User = require('../../../models/User');

// Group model
const testGroup = {
  'name': 'testgroup',
};

describe('User Schema', function() {
  it('should be invalid if name is empty', function() {
    const user = new User({
      'password': 'pass',
    });
    user.validate(function(err) {
      expect(err.errors.name).to.exist;
    });
  });

  it('should be invalid if password is empty', function() {
    const user = new User({
      'name': 'testuser',
    });
    user.validate(function(err) {
      expect(err.errors.password).to.exist;
    });
  });

  it('should add groups to its group list', function(done) {
    const user = new User({
      'name': 'testuser',
      'password': 'pass',
    });
    const group = new Group(testGroup);
    const expected = [group._id];
    user.addGroup(group._id);
    expect(user.groups).to.eql(expected);
    done();
  });

  it('should delete a group from group list', function(done) {
    const group = new Group(testGroup);
    const user = new User({
      'name': 'testuser',
      'password': 'pass',
      'groups': [group._id],
    });
    expected = [];

    user.deleteGroup(group._id);

    expect(user.groups).to.eql(expected);
    done();
  });
});
