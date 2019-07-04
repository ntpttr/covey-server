// server/controllers/play.js

/**
 * Records a new play for a group
 * @param {schema} Play - The play mongoose schema
 * @param {String} gameName - The game name
 * @param {String} groupName - The group name
 * @param {Array} players - The players
 * @param {function} callback = The callback function
 */
function addPlay(Play, gameName, groupName, players, callback) {
  play = new Play({
    game: gameName,
    group: groupName,
    players: players,
  });

  play.save(function(err) {
    if (err) {
      callback(500, {
        'error': err,
      });
      return;
    }

    callback(201, {
      'play': play,
    });
  });
}

/**
 * Get all plays for a given group
 * @param {schema} Play - The play mongoose schema
 * @param {String} groupName - The group name
 * @param {function} callback - The callback function
 */
function getGroupPlays(Play, groupName, callback) {
  Play.find({group: groupName}, function(err, plays) {
    if (err) {
      callback(500, {
        'error': err,
      });

      return;
    }

    callback(200, {
      'plays': plays,
    });
  });
}

/**
 * Get all plays for a given user
 * @param {schema} Play - The play mongoose schema
 * @param {String} username - The username to search for
 * @param {function} callback - The callback function
 */
function getUserPlays(Play, username, callback) {
  // TODO: Figure out checking if username is in list of players when querying
  Play.find({user: username}, function(err, plays) {
    if (err) {
      callback(500, {
        'error': err,
      });

      return;
    }

    callback(200, {
      'plays': plays,
    });
  });
}

/**
 * Get all plays for a given user
 * @param {schema} Play - The play mongoose schema
 * @param {String} id - The play ID
 * @param {function} callback - The callback function
 */
function deletePlay(Play, id, callback) {
  Play.findByIdAndRemove(id, function(err, play) {
    if (err) {
      callback(500, {
        'error': err,
      });
    } else if (play) {
      callback(200, {
        'message': 'Play deleted successfully',
      });
    } else {
      callback(404, {
        'message': 'Play not found',
      });
    }
  });
}

module.exports = {
  addPlay,
  getGroupPlays,
  getUserPlays,
  deletePlay,
};
