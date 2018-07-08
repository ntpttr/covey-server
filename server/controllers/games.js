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

function getGame(id, callback) {
    bgg('thing', {id: id, type: 'boardgame'})
    .then(function(results) {
        callback(results);
    });
}

module.exports = { getGame }