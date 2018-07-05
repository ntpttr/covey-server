const User = require('../models/User');

function authenticate(creds, callback) {
    var name = creds.name;
    var password = creds.password;
    User.findOne({name: name}, function(err, user) {
        if (err) { // err indicates error, not no result found
            callback({'err': err});
            return;
        }   

        if (user) { // found the user!
            user.comparePassword(password, function(err, isMatch) {
                callback({'status': isMatch, 'foundUser': true});
            }); 
        } else {
            callback({'status': false, 'foundUser': false});
        }   
    }); 
};

function getUser(ident, callback) {
    getUserById(ident, function(res) {
        if (res.status) {
            callback(res);
        } else {
            // If user not found by ID, try name.
            getUserByName(ident, callback);
        }
    });
}

function getUserById(id, callback) {
    User.findById(id, function(err, user) {
        if (err) {
            callback({'status': false,
                      'message': 'Database error finding user with id ' + id + '!'});
        } else if (user) {
            callback({'status': true, 'user': user});
        } else {
            callback({'status': false,
                      'message': 'User with ID ' + id + ' not found!'});
        }
    }); 
}

function getUserByName(name, callback) {
    User.findOne({name: name}, function(err, user) {
        if (err) {
            callback({'status': false,
                      'message': 'Database error finding user with name ' + name + '!'});
        } else if (user) {
            callback({'status': true, 'user': user});
        } else {
            callback({'status': false,
                      'message': 'User with name ' + name + ' not found!'});
        }
    }); 
}

function deleteUser(ident, callback) {
    deleteUserById(ident, function(res) {
        if (res.status) {
            callback(res);
        } else {
            // If user not found by ID, try name.
            deleteUserByName(ident, callback);
        }
    });
}

function deleteUserById(id, callback) {
    User.findByIdAndRemove(id, function(err, user) {
        if (err) {
            callback({'status': false,
                      'message': 'Database error finding user with id ' + id + '!'});
        } else if (user) {
            callback({'status': true});
        } else {
            callback({'status': false,
                      'message': 'User with ID ' + id + ' not found!'});
        }
    });
}

function deleteUserByName(name, callback) {
    User.findOneAndRemove({name: name}, function(err, user) {
        if (err) {
            callback({'status': false,
                      'message': 'Database error deleting user ' + name + '!'});
        } else if (user) {
            callback({'status': true,
                      'message': 'User ' + name + ' deleted successfully.'});
        } else {
            callback({'status': false,
                      'message': 'User ' + name + ' not found.'});
        }
    }); 
}


module.exports = { authenticate, getUser, deleteUser };
