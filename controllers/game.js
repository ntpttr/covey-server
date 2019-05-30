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
 * Save a game to the database.
 * @param {Game} Game - The game mongoose schema.
 * @param {object} properties - The game properties.
 * @param {function} callback - The callback function.
 */
function saveGame(Game, properties, callback) {
  const game = new Game(properties);

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
 * Delete a specific game from the database using its name.
 * @param {schema} Game - The game mongoose schema.
 * @param {string} name - The name of the game.
 * @param {function} callback - The callback function.
 */
function deleteGame(Game, name, callback) {
  Game.findOneAndRemove({name: name}, function(err, game) {
    if (err) {
      callback(500, {
        'message': err,
      });
    } else if (game) {
      callback(200, {
        'message': 'Game ' + name + ' successfully deleted.',
      });
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
  searchGameBggExactMatch(name, function(searchStatus, searchBody) {
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
      showcount: 10,
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
 * Search for a game by name using the BoardGameGeek API,
 * only returning an exact match.
 * @param {string} name - The name of the game.
 * @param {function} callback - The callback function.
 */
function searchGameBggExactMatch(name, callback) {
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
  saveGame,
  deleteGame,
  getGameBgg,
  searchGameBgg,
};
