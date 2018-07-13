const Game = require('../models/Game');

var bggOptions = {
    timeout: 10000, // timeout of 10s (5s is the default)
  
    // see https://github.com/cujojs/rest/blob/master/docs/interceptors.md#module-rest/interceptor/retry
    retry: {
      initial: 100,
      multiplier: 2,
      max: 15e3
    }
}

var bgg = require('bgg')(bggOptions);

function getGamesDb(callback) {
    Game.find({}, function(err, games) {
        if (err) {
            callback({'status': false,
                      'message': 'Database error finding games!'});
        } else {
            callback({'status': true,
                      'games': games});
        }
    });
}

function getGameDb(ident, callback) {
    getGameByIdDb(ident, function(res) {
        if (res.status) {
            callback(res);
        } else {
            // If game not found by ID, try name.
            getGameByNameDb(ident, callback);
        }
    });
}

function getGameByIdDb(id, callback) {
    Game.findById(id, function(err, game) {
        if (err) {
            callback({'status': false,
                      'message': 'Database error finding game with id ' + id + '!'});
        } else if (game) {
            callback({'status': true, 'game': game});
        } else {
            callback({'status': false,
                      'message': 'Game with ID ' + id + ' not found in the database.'});
        }
    });
}

function getGameByNameDb(name, callback) {
    Game.findOne({name: name.toLowerCase()}, function(err, game) {
        if (err) {
            callback({'status': false,
                      'message': 'Database error finding game with name ' + name + '!'});
        } else if (game) {
            callback({'status': true, 'game': game});
        } else {
            callback({'status': false,
                      'message': 'Game with name ' + name + ' not found in the database.'});
        }
    });
}

function saveGameDb(name, callback) {
    getGameBgg(name, function(getRes) {
        if (getRes.status) {
            game = new Game(getRes.game);

            game.save(function(err) {
                if (err) {
                    var errMessage = '';
                    if (err.code === 11000) {
                        // Game already saved in the database
                        errMessage = 'Game already saved!';
                    } else {
                        errMessage = 'Error saving game!';
                    }
                    callback({'status': false,
                              'message': errMessage});
                    return;
                }
                callback({'status': true,
                          'game': game});
            });
        } else {
            callback({'status': false,
                      'message': getRes.message});
        }
    });
}

function deleteGame(ident, callback) {
    deleteGameById(ident, function(res) {
        if (res.status) {
            callback(res);
        } else {
            // If game not found by ID, try name.
            deleteGameByName(ident, callback);
        }
    });
}

function deleteGameById(id, callback) {
    Game.findByIdAndRemove(id, function(err, game) {
        if (err) {
            callback({'status': false,
                      'message': 'Database error finding game with id ' + id + '!'});
        } else if (game) {
            callback({'status': true});
        } else {
            callback({'status': false,
                      'message': 'Game with ID ' + id + ' not found in the database.'});
        }
    });
}

function deleteGameByName(name, callback) {
    Game.findOneAndRemove({name: name.toLowerCase()}, function(err, game) {
        if (err) {
            callback({'status': false,
                      'message': 'Database error deleting game ' + name + '!'});
        } else if (game) {
            callback({'status': true,
                      'message': 'Game ' + name + ' deleted successfully.'});
        } else {
            callback({'status': false,
                      'message': 'Game ' + name + ' not found in the database.'});
        }
    });
}

function getGameBgg(name, callback) {
    //TODO(ntpttr): Add error handling if bgg can't connect.
    searchGameBgg(name, function(search) {
        if (search.err) {
            callback({'status': false, 'message': search.err}); 
        }
        if (search.items.total != 1) {
            callback({'status': false, 'message': 'Game ' + name + ' not found!'});
            return;
        }
        var id = search.items.item.id;
        getGameByIdBgg(id, function(game) {
            if (game.err) {
                callback({'status': false, 'message': game.err});
            }
            var item = game.items.item;
            var name;
            // Get primary name from list of possible alternates
            for (i=0; i<item.name.length; i++) {
                if (item.name[i].type == 'primary') {
                    name = item.name[i].value.toLowerCase();
                    break;
                }
            }
            gameDetail = {
                'name': name,
                'description': item.description,
                'thumbnail': item.thumbnail,
                'image': item.image,
                'minPlayers': item.minplayers.value,
                'maxPlayers': item.maxplayers.value,
                'playingTime': item.playingtime.value
            }
            callback({'status': true, 'game': gameDetail});
        });
    });
}

function getGameByIdBgg(id, callback) {
    try {
        bgg('thing', {
            id: id,
        })
        .then(function(results) {
            callback(results);
        });
    } catch(err) {
        callback({'err': 'Error getting game from BGG API!'});
    }
}

function searchGameBgg(name, callback) {
    try {
        bgg('search', {
            query: name,
            type: 'boardgame',
            exact: 1
        })
        .then(function(results) {
            callback(results);
        });
    } catch(err) {
        callback({'err': 'Error searching for game with BGG API!'});
    }
}

module.exports = {
    getGamesDb,
    getGameDb,
    saveGameDb,
    deleteGame,
    getGameBgg
}
