const Group = require('../models/Group');
const gameController = require('./gameController')
const userController = require('./userController');

function getGroups(callback) {
    Group.find({}, function(err, groups) {
        if (err) {
            callback({'status': false,
                      'message': 'Database error finding groups!'});
        } else {
            callback({'status': true,
                      'groups': groups});
        }
    });
}

function getGroup(ident, callback) {
    getGroupById(ident, function(res) {
        if (res.status) {
            callback(res);
        } else {
            // If user not found by ID, try name.
            getGroupsByName(ident, callback);
        }
    });
}

function getGroupById(id, callback) {
    Group.findById(id, function(err, group) {
        if (err) {
            callback({'status': false,
                      'message': 'Database error finding group with id ' + id + '!'});
        } else if (group) {
            callback({'status': true, 'groups': [group]});
        } else {
            callback({'status': false,
                      'message': 'Group with ID ' + id + ' not found!'});
        }
    }); 
}

function getGroupsByName(name, callback) {
    Group.find({name: name}, function(err, groups) {
        if (err) {
            callback({'status': false,
                      'message': 'Database error finding group with name ' + name + '!'});
        } else if (groups.length > 0) {
            callback({'status': true, 'groups': groups});
        } else {
            callback({'status': false,
                      'message': 'Group with name ' + name + ' not found!'});
        }
    }); 
}

function createGroup(properties, callback) {
    group = new Group(properties);

    group.save(function(err) {
        if (err) {
            console.log(err.message);
            callback({'status': false,
                      'message': 'Error saving group!'});
            return;
        }
        callback({'status': true,
                  'group': group});
    });
}

function updateGroup(ident, properties, callback) {
    getGroup(ident, function(groupRes) {
        if (!groupRes.status) {
            callback({'status': false, 'message': groupRes.message});
            return;
        } else if (groupRes.groups.length > 1) {
            callback({'status': false,
                      'message': 'More than one group found with name ' + groupIdent + '. Use ID.'});
            return;
        }
        group = groupRes.groups[0];
        Object.assign(group, properties).save((err, group) => {
            if (err) {
                callback({'status': false, message: 'Error updating group!'});
            } else {
                callback({'status': true, 'group': group});
            }
        }); 
    });
}

function addUser(ident, userIdent, callback) {
    getGroup(ident, function(groupRes) {
        if (!groupRes.status) {
            callback({'status': false, 'message': groupRes.message});
            return;
        } else if (groupRes.groups.length > 1) {
            callback({'status': false,
                      'message': 'More than one group found with name ' + groupIdent + '. Use ID.'});
            return;
        }
        group = groupRes.groups[0];
        userController.getUser(userIdent, function(userRes) {
            if (!userRes.status) {
                callback({'status': false, 'message': userRes.message});
                return;
            }
            user = userRes.user;
            try {
                group.addUser(user._id, user.name);
                user.addGroup(group._id);
                callback({'status': true});
            } catch(err) {
                callback({'status': false,
                          'message': 'Error adding user to group.'});
            }
        });
    });
}

function deleteUser(ident, userIdent, callback) {
    getGroup(ident, function(groupRes) {
        if (!groupRes.status) {
            callback({'status': false, 'message': groupRes.message});
            return;
        } else if (groupRes.groups.length > 1) {
            callback({'status': false,
                      'message': 'More than one group found with name ' + groupIdent + '. Use ID.'});
            return;
        }
        group = groupRes.groups[0];
        userController.getUser(userIdent, function(userRes) {
            if (!userRes.status) {
                if (group.deleteUser(userIdent)) {
                    callback({'status': true, 'message': 'User not found in database and successfully removed from group.'});
                    return;
                } else {
                    callback({'status': false, 'message': userRes.message});
                    return;
                }
            }
            user = userRes.user;
            try {
                group.deleteUser(user._id);
                user.deleteGroup(group._id);
                callback({'status': true});
            } catch(err) {
                callback({'status': false,
                          'message': 'Error deleting user from group.'});
            }
        });
    });
}

function addGame(ident, gameIdent, callback) {
    getGroup(ident, function(groupRes) {
        if (!groupRes.status) {
            callback({'status': false, 'message': groupRes.message});
            return;
        } else if (groupRes.groups.length > 1) {
            callback({'status': false,
                      'message': 'More than one group found with name ' + groupIdent + '. Use ID.'});
            return;
        }
        group = groupRes.groups[0];
        gameController.getGameDb(gameIdent, function(gameRes) {
            if (!gameRes.status) {
                callback({'status': false, 'message': gameRes.message});
                return;
            }
            game = gameRes.game;
            try {
                group.addGame(game._id);
                callback({'status': true});
            } catch(err) {
                callback({'status': false,
                          'message': 'Error adding game to group.'});
            }
        });
    }); 
}

function deleteGame(ident, gameIdent, callback) {
    getGroup(ident, function(groupRes) {
        if (!groupRes.status) {
            callback({'status': false, 'message': groupRes.message});
            return;
        } else if (groupRes.groups.length > 1) {
            callback({'status': false,
                      'message': 'More than one group found with name ' + groupIdent + '. Use ID.'});
            return;
        }
        group = groupRes.groups[0];
        gameController.getGameDb(gameIdent, function(gameRes) {
            if (!gameRes.status) {
                callback({'status': false, 'message': gameRes.message});
                return;
            }
            game = gameRes.game;
            try {
                group.deleteGame(game._id);
                callback({'status': true});
            } catch(err) {
                callback({'status': false,
                          'message': 'Error deleting game from group.'});
            }
        });
    });
}

function deleteGroup(ident, callback) {
    deleteGroupById(ident, function(res) {
        if (res.status) {
            callback(res);
        } else {
            // If group not found by ID, try name.
            deleteGroupByName(ident, callback);
        }
    });
}

function deleteGroupById(id, callback) {
    Group.findByIdAndRemove(id, function(err, group) {
        if (err) {
            callback({'status': false,
                      'message': 'Database error finding group with id ' + id + '!'});
        } else if (group) {
            callback({'status': true});
        } else {
            callback({'status': false,
                      'message': 'group with ID ' + id + ' not found!'});
        }
    });
}

function deleteGroupByName(name, callback) {
    Group.find({name: name}, function(err, groups) {
        if (err) {
            callback({'status': false,
                      'message': 'Database error deleting group ' + name + '!'});
        } else if (groups.length == 0) {
            callback({'status': false,
                      'message': 'Group with the name ' + name + ' not found!'});
        } else if (groups.length > 1) {
            callback({'status': false,
                      'message': 'Multiple groups found with name ' + name + '. Must delete by ID.'});
        } else {
            var group = groups[0];
            try {
                group.remove();
                callback({'status': true});
            } catch(err) {
                callback({'status': false,
                          'message': 'Error deleting group ' + name + '!'});
            }
        }
    }); 
}

function updateStats(groupIdent, winners, players, game, callback) {
    getGroup(groupIdent, function(groupRes) {
        if (!groupRes.status) {
            callback({'status': false, 'message': groupRes.message});
            return;
        } else if (groupRes.groups.length > 1) {
            callback({'status': false,
                      'message': 'More than one group found with name ' + groupIdent + '. Use ID.'});
            return;
        }
        group = groupRes.groups[0];
        if (group.findGameIndex(game) < 0) {
            callback({'status': false,
                      'message': 'Game ' + game + ' not found in group ' + group.name});
            return;
        }
        for (var i = 0; i < group.users.length; i++) {
            for (var j = 0; j < group.users.stats.length; j++) {
                if (players.indexOf(group.users[i]) >= 0 && group.users[i].stats[j].game == game) {
                    if (winners.indexOf(group.users[i].username) >= 0) {
                        group.users[i].stats[j].wins += 1;
                    } else {
                        group.users[i].stats[j].losses += 1;
                    }
                }
            }
        }
    });
}


module.exports ={
    getGroups,
    getGroup,
    createGroup,
    updateGroup,
    addUser,
    deleteUser,
    addGame,
    deleteGame,
    deleteGroup,
    updateStats
};
