// server/controllers/gameController.js

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
 * @param {schema} Game - The game mongoose schema.
 * @param {function} callback - The callback function.
 */
function listGamesDb(Game, callback) {
  Game.find({}, function(err, games) {
    if (err) {
      callback(500, {
        'message': err,
      });
    } else {
      callback(200, {
        'games': games,
      });
    }
  });
}

/**
 * Gets a specific game from the database.
 * @param {schema} Game - The game mongoose schema.
 * @param {string} ident - The identity of the game, either ID or name.
 * @param {function} callback - The callback function.
 */
function getGameDb(Game, ident, callback) {
  getGameByIdDb(Game, ident, function(status, body) {
    if (status == 200) {
      callback(status, body);
    } else {
      // If game not found by ID, try name.
      getGameByNameDb(Game, ident, callback);
    }
  });
}

/**
 * Get a specific game using its ID.
 * @param {schema} Game - The game mongoose schema.
 * @param {string} id - The game ID.
 * @param {function} callback - The callback function.
 */
function getGameByIdDb(Game, id, callback) {
  Game.findById(id, function(err, game) {
    if (err) {
      callback(500, {
        'message': err,
      });
    } else if (game) {
      callback(200, {
        'game': game,
      });
    } else {
      callback(404, {
        'message': 'Game ' + id + ' not found in the database.',
      });
    }
  });
}

/**
 * Get a specific game using its name.
 * @param {schema} Game - The game mongoose schema.
 * @param {string} name - The name of the game.
 * @param {function} callback - The callback function.
 */
function getGameByNameDb(Game, name, callback) {
  Game.findOne({name: name.toLowerCase()}, function(err, game) {
    if (err) {
      callback(500, {
        'message': err,
      });
    } else if (game) {
      callback(200, {
        'game': game,
      });
    } else {
      callback(404, {
        'message': 'Game ' + name + ' not found in the database.',
      });
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
      if (err.code === 11000) {
        // Duplicate game found
        callback(409, {
          'message': 'Game ' + game.name + ' already exists.',
        });
        return;
      } else {
        callback(500, {
          'message': err,
        });
        return;
      }
    }
    callback(201, {
      'game': game,
    });
  });
}

/**
 * Save a custom game not from the BoardGameGeek API.
 * @param {schema} Game - The game mongoose schema.
 * @param {object} properties - The game properties.
 * @param {function} callback - The callback function.
 */
function saveCustomGame(Game, properties, callback) {
  const game = new Game(properties);
  saveGameDb(game, callback);
}

/**
 * Save a game from the BoardGameGeek API to the database.
 * @param {schema} Game - The game mongoose schema.
 * @param {string} name - The name of the board game.
 * @param {function} callback - The callback function.
 */
function saveBggGame(Game, name, callback) {
  getGameBgg(name, function(status, body) {
    if (status == 200) {
      const game = new Game(body.game);
      saveGameDb(game, callback);
    } else {
      callback(status, body);
    }
  });
}

/**
 * Delete a game from the database.
 * @param {schema} Game - The game mongoose schema.
 * @param {string} ident - The identity of the game, either ID or name.
 * @param {function} callback - The callback function.
 */
function deleteGame(Game, ident, callback) {
  deleteGameById(Game, ident, function(status, body) {
    if (status == 200) {
      callback(status, body);
    } else {
      // If game not found by ID, try name.
      deleteGameByName(Game, ident, callback);
    }
  });
}

/**
 * Delete a specific game from the database using its ID.
 * @param {schema} Game - The game mongoose schema.
 * @param {string} id - The game ID.
 * @param {function} callback - The callback function.
 */
function deleteGameById(Game, id, callback) {
  Game.findByIdAndRemove(id, function(err, game) {
    if (err) {
      callback(500, {
        'message': err,
      });
    } else if (game) {
      callback(200, {});
    } else {
      callback(404, {
        'message': 'Game ' + id + ' not found in the database.',
      });
    }
  });
}

/**
 * Delete a specific game from the database using its name.
 * @param {schema} Game - The game mongoose schema.
 * @param {string} name - The name of the game.
 * @param {function} callback - The callback function.
 */
function deleteGameByName(Game, name, callback) {
  Game.findOneAndRemove({name: name.toLowerCase()}, function(err, game) {
    if (err) {
      callback(500, {
        'message': err,
      });
    } else if (game) {
      callback(200, {});
    } else {
      callback(404, {
        'message': 'Game ' + name + ' not found in the database.',
      });
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
  searchGameBgg(name, function(searchStatus, searchBody) {
    if (searchStatus != 200) {
      callback(searchStatus, searchBody);
    }
    if (searchBody.items.total != 1) {
      callback(404, {
        'message': 'Game ' + name + ' not found!',
      });
      return;
    }
    const id = searchBody.items.item.id;
    getGameByIdBgg(id, function(getStatus, getBody) {
      if (getStatus != 200) {
        callback(getStatus, getBody);
      }
      const item = getBody.items.item;
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
      callback(200, {
        'game': gameDetail,
      });
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
      callback(200, results);
    });
  } catch (err) {
    callback(500, {
      'message': err,
    });
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
      callback(200, results);
    });
  } catch (err) {
    callback(500, {
      'message': err,
    });
  }
}

module.exports = {
  listGamesDb,
  getGameDb,
  saveCustomGame,
  saveBggGame,
  deleteGame,
  getGameBgg,
};
