const express = require('express');
const router = express.Router();

const Group = require('../models/Group');
const User = require('../models/User');
const gameController = require('../controllers/games');
const groupController = require('../controllers/groups');
const userController = require('../controllers/users');

// List all groups
router.get('/', function(req, res) {
    Group.find({}, function(err, groups) {
        if (err) {
            res.json({'status': false,
                      'message': 'Database error finding groups!'});
        } else {
            res.json({'status': true,
                      'groups': groups});
        }
    });
});

// Get group by id
router.get('/:ident', function(req, res) {
    groupController.getGroup(req.params.ident, function(getRes) {
        res.json(getRes);
    });
});

// Create new group
router.post('/', function(req, res) {
    group = new Group(req.body);

    group.save(function(err) {
        if (err) {
            console.log(err.message);
            res.json({'status': false,
                      'message': 'Error saving group!'});
            return;
        }
        res.json({'status': true,
                  'group': group});
    });
});

// Delete group
router.delete('/:ident', function(req, res) {
    groupController.deleteGroup(req.params.ident, function(deleteRes) {
        res.json(deleteRes);
    });
});

// Add user to group
router.post('/:groupIdent/users/:userIdent', function (req, res, next) {
    var groupIdent = req.params.groupIdent;
    var userIdent = req.params.userIdent;
    groupController.getGroup(groupIdent, function(groupRes) {
        if (!groupRes.status) {
            res.json({'status': false, 'message': groupRes.message});
            return;
        } else if (groupRes.groups.length > 1) {
            res.json({'status': false,
                      'message': 'More than one group found with name ' + groupIdent + '. Use ID.'});
            return;
        }
        group = groupRes.groups[0];
        userController.getUser(userIdent, function(userRes) {
            if (!userRes.status) {
                res.json({'status': false, 'message': userRes.message});
                return;
            }
            user = userRes.user;
            try {
                group.addUser(user._id);
                user.addGroup(group._id);
                res.json({'status': true});
            } catch(err) {
                res.json({'status': false,
                          'message': 'Error adding user to group.'});
            }
        });
    });
});

// Remove user from group
router.delete('/:groupIdent/users/:userIdent', function(req, res) {
    var groupIdent = req.params.groupIdent;
    var userIdent = req.params.userIdent;
    groupController.getGroup(groupIdent, function(groupRes) {
        if (!groupRes.status) {
            res.json({'status': false, 'message': groupRes.message});
            return;
        } else if (groupRes.groups.length > 1) {
            res.json({'status': false,
                      'message': 'More than one group found with name ' + groupIdent + '. Use ID.'});
            return;
        }
        group = groupRes.groups[0];
        userController.getUser(userIdent, function(userRes) {
            if (!userRes.status) {
                res.json({'status': false, 'message': userRes.message});
                return;
            }
            user = userRes.user;
            try {
                group.deleteUser(user._id);
                user.deleteGroup(group._id);
                res.json({'status': true});
            } catch(err) {
                res.json({'status': false,
                          'message': 'Error deleting user from group.'});
            }
        });
    });
});

// Add game to group
router.post('/:groupIdent/games/:gameIdent', function (req, res, next) {
    var groupIdent = req.params.groupIdent;
    var gameIdent = req.params.gameIdent;
    groupController.getGroup(groupIdent, function(groupRes) {
        if (!groupRes.status) {
            res.json({'status': false, 'message': groupRes.message});
            return;
        } else if (groupRes.groups.length > 1) {
            res.json({'status': false,
                      'message': 'More than one group found with name ' + groupIdent + '. Use ID.'});
            return;
        }
        group = groupRes.groups[0];
        gameController.getGameDb(gameIdent, function(gameRes) {
            if (!gameRes.status) {
                res.json({'status': false, 'message': gameRes.message});
                return;
            }
            game = gameRes.game;
            try {
                group.addGame(game._id);
                res.json({'status': true});
            } catch(err) {
                res.json({'status': false,
                          'message': 'Error adding game to group.'});
            }
        });
    }); 
});

// Remove user from group
router.delete('/:groupIdent/games/:gameIdent', function(req, res) {
    var groupIdent = req.params.groupIdent;
    var gameIdent = req.params.gameIdent;
    groupController.getGroup(groupIdent, function(groupRes) {
        if (!groupRes.status) {
            res.json({'status': false, 'message': groupRes.message});
            return;
        } else if (groupRes.groups.length > 1) {
            res.json({'status': false,
                      'message': 'More than one group found with name ' + groupIdent + '. Use ID.'});
            return;
        }
        group = groupRes.groups[0];
        gameController.getGameDb(gameIdent, function(gameRes) {
            if (!gameRes.status) {
                res.json({'status': false, 'message': gameRes.message});
                return;
            }
            game = gameRes.game;
            try {
                group.deleteGame(game._id);
                res.json({'status': true});
            } catch(err) {
                res.json({'status': false,
                          'message': 'Error deleting game from group.'});
            }
        });
    });
});

module.exports = router;
