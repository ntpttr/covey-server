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

function getUsers(callback) {
    User.find({}, function(err, users) {
        if (err) {
            callback({'status': false,
                      'message': 'Database error finding users!'});
        } else {
            callback({'status': true,
                      'users': users});
        }
    });
}

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

function createUser(properties, callback) {
    user = new User(properties);

    user.save(function(err) {
        if (err) {
            var errMessage = '';
            if (err.code === 11000) {
                // Duplicate username found
                errMessage = 'Username already exists!';
            } else {
                errMessage = 'Error saving user!';
            }
            callback({'status': false,
                      'message': errMessage});
            return;
        }
        callback({'status': true,
                  'user': user});
    });
}

function updateUser(ident, properties, callback) {
    getUser(ident, function(userRes) {
        if (!userRes.status) {
            callback({'status': false, 'message': userRes.message});
            return;
        }
        user = userRes.user;
        Object.assign(user, properties).save((err, user) => {
            if (err) {
                callback({'status': false, message: 'Error updating user!'});
            } else {
                callback({'status': true, 'user': user});
            }
        }); 
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


module.exports = {
    authenticate,
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
};
