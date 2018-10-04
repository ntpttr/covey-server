const expect = require('chai').expect;
const mongoose = require('mongoose');
const utils = require('../../utils');

const Group = require('../../../server/models/Group');
const User = require('../../../server/models/User');

// Group model
var testGroup = {
    'name': 'testgroup'
};

describe('user', function() {

    it('should be invalid if name is empty', function() {
        var user = new User({
            'password': 'pass'
        });
        user.validate(function(err) {
            expect(err.errors.name).to.exist;
        });
    });

    it('should be invalid if password is empty', function() {
        var user = new User({
            'name': 'testuser'
        });
        user.validate(function(err) {
            expect(err.errors.password).to.exist;
        });
    });

    it('should add groups to its group list', function(done) {
        var user = new User({
            'name': 'testuser',
            'password': 'pass'
        });
        var group = new Group(testGroup);
        expected = [group._id];
        user.addGroup(group._id);
        expect(user.groups).to.eql(expected);
        done();
    });

    it('should delete a group from group list', function(done) {
        var group = new Group(testGroup);
        var user = new User({
            'name': 'testuser',
            'password': 'pass',
            'groups': [group._id]
        });
        expected = [];

        user.deleteGroup(group._id);

        expect(user.groups).to.eql(expected);
        done()
    });

});
