const Game = require('../models/Game');

const bggOptions = {
  timeout: 10000, // timeout of 10s (5s is the default)

  // see https://github.com/cujojs/rest/blob/master/docs/interceptors.md#module-rest/interceptor/retry
  retry: {
    initial: 100,
    multiplier: 2,
    max: 15e3,
  },
};

const bgg = require('bgg')(bggOptions);

/**
 * Gets list of games from the database.
 * @param {schema} gameSchea - The game mongoose schema.
 * @param {function} callback - The callback function.
 */
function getGamesDb(gameSchema, callback) {
  gameSchema.find({}, function(err, games) {
    if (err) {
      callback({
        'status': false,
        'message': 'Database error finding games!'});
    } else {
      callback({
        'status': true,
        'games': games});
    }
  });
}

/**
 * Gets a specific game from the database.
 * @param {schema} gameSchema - The game mongoose schema.
 * @param {string} ident - The identity of the game, either ID or name.
 * @param {function} callback - The callback function.
 */
function getGameDb(gameSchema, ident, callback) {
  getGameByIdDb(gameSchema, ident, function(res) {
    if (res.status) {
      callback(res);
    } else {
      // If game not found by ID, try name.
      getGameByNameDb(gameSchema, ident, callback);
    }
  });
}

/**
 * Get a specific game using its ID.
 * @param {schema} gameSchema - The game mongoose schema.
 * @param {string} id - The game ID.
 * @param {function} callback - The callback function.
 */
function getGameByIdDb(gameSchema, id, callback) {
  gameSchema.findById(id, function(err, game) {
    if (err) {
      callback({
        'status': false,
        'message': 'Database error finding game with id ' + id + '!'});
    } else if (game) {
      callback({'status': true, 'game': game});
    } else {
      callback({
        'status': false,
        'message': 'Game with ID ' + id + ' not found in the database.'});
    }
  });
}

/**
 * Get a specific game using its name.
 * @param {schema} gameSchema - The game mongoose schema.
 * @param {string} name - The name of the game.
 * @param {function} callback - The callback function.
 */
function getGameByNameDb(gameSchema, name, callback) {
  gameSchema.findOne({name: name.toLowerCase()}, function(err, game) {
    if (err) {
      callback({
        'status': false,
        'message': 'Database error finding game with name ' + name + '!'});
    } else if (game) {
      callback({'status': true, 'game': game});
    } else {
      callback({
        'status': false,
        'message': 'Game with name ' + name + ' not found in the database.'});
    }
  });
}

/**
 * Save a game to the database.
 * @param {Game} game - The game mongoose object.
 * @param {function} callback - The callback function.
 */
function saveGameDb(game, callback) {
  game.save(function(err) {
    if (err) {
      let errMessage = '';
      if (err.code === 11000) {
        // Game already saved in the database
        errMessage = 'Game already saved!';
      } else {
        errMessage = 'Error saving game!';
      }
      callback({'status': false, 'message': errMessage});
      return;
    }
    callback({'status': true, 'game': game});
  });
}

/**
 * Save a custom game not from the BoardGameGeek API.
 * @param {schema} gameSchema - The game mongoose schema.
 * @param {object} properties - The game properties.
 * @param {function} callback - The callback function.
 */
function saveCustomGame(gameSchema, properties, callback) {
  const game = new gameSchema(properties);
  saveGameDb(game, callback);
}

/**
 * Save a game from the BoardGameGeek API to the database.
 * @param {schema} gameSchema - The game mongoose schema.
 * @param {string} name - The name of the board game.
 * @param {function} callback - The callback function.
 */
function saveBggGame(gameSchema, name, callback) {
  getGameBgg(name, function(getRes) {
    if (getRes.status) {
      const game = new gameSchema(getRes.game);
      saveGameDb(game, callback);
    } else {
      callback({'status': false, 'message': getRes.message});
    }
  });
}

/**
 * Delete a game from the database.
 * @param {schema} gameSchema - The game mongoose schema.
 * @param {string} ident - The identity of the game, either ID or name.
 * @param {function} callback - The callback function.
 */
function deleteGame(gameSchema, ident, callback) {
  deleteGameById(gameSchema, ident, function(res) {
    if (res.status) {
      callback(res);
    } else {
      // If game not found by ID, try name.
      deleteGameByName(gameSchema, ident, callback);
    }
  });
}

/**
 * Delete a specific game from the database using its ID.
 * @param {schema} gameSchema - The game mongoose schema.
 * @param {string} id - The game ID.
 * @param {function} callback - The callback function.
 */
function deleteGameById(gameSchema, id, callback) {
  gameSchema.findByIdAndRemove(id, function(err, game) {
    if (err) {
      callback({
        'status': false,
        'message': 'Database error finding game with id ' + id + '!'});
    } else if (game) {
      callback({'status': true});
    } else {
      callback({
        'status': false,
        'message': 'Game with ID ' + id + ' not found in the database.'});
    }
  });
}

/**
 * Delete a specific game from the database using its name.
 * @param {schema} gameSchema - The game mongoose schema.
 * @param {string} name - The name of the game.
 * @param {function} callback - The callback function.
 */
function deleteGameByName(gameSchema, name, callback) {
  gameSchema.findOneAndRemove({name: name.toLowerCase()}, function(err, game) {
    if (err) {
      callback({
        'status': false,
        'message': 'Database error deleting game ' + name + '!'});
    } else if (game) {
      callback({
        'status': true,
        'message': 'Game ' + name + ' deleted successfully.'});
    } else {
      callback({
        'status': false,
        'message': 'Game ' + name + ' not found in the database.'});
    }
  });
}

/**
 * Get a game from the BoardGameGeek API using its name.
 * @param {string} name - The name of the game.
 * @param {function} callback - The callback function.
 */
function getGameBgg(name, callback) {
  // TODO(ntpttr): Add error handling if bgg can't connect.
  searchGameBgg(name, function(search) {
    if (search.err) {
      callback({'status': false, 'message': search.err});
    }
    if (search.items.total != 1) {
      callback({'status': false, 'message': 'Game ' + name + ' not found!'});
      return;
    }
    const id = search.items.item.id;
    getGameByIdBgg(id, function(game) {
      if (game.err) {
        callback({'status': false, 'message': game.err});
      }
      const item = game.items.item;
      let name;
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
        'playingTime': item.playingtime.value,
      };
      callback({'status': true, 'game': gameDetail});
    });
  });
}

/**
 * Get a game from the BoardGameGeek API using its BGG ID.
 * @param {string} id - The BGG ID of the game.
 * @param {function} callback - The callback function.
 */
function getGameByIdBgg(id, callback) {
  try {
    bgg('thing', {
      id: id,
    }).then(function(results) {
      callback(results);
    });
  } catch (err) {
    callback({'err': 'Error getting game from BGG API!'});
  }
}

/**
 * Search for a game by name using the BoardGameGeek API.
 * @param {string} name - The name of the game.
 * @param {function} callback - The callback function.
 */
function searchGameBgg(name, callback) {
  try {
    bgg('search', {
      query: name,
      type: 'boardgame',
      exact: 1,
    }).then(function(results) {
      callback(results);
    });
  } catch (err) {
    callback({'err': 'Error searching for game with BGG API!'});
  }
}

module.exports = {
  getGamesDb,
  getGameDb,
  saveCustomGame,
  saveBggGame,
  deleteGame,
  getGameBgg,
};
