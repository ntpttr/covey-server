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

function getGameByName(name, callback) {
    //TODO(ntpttr): Add error handling if bgg can't connect.
    searchGame(name, function(search) {
        if (search.items.total != 1) {
            callback({'status': false, 'message': 'Game ' + name + ' not found!'});
            return;
        }
        var id = search.items.item.id;
        getGameById(id, function(game) {
            var item = game.items.item;
            var name;
            // Get primary name from list of possible alternates
            for (i=0; i<item.name.length; i++) {
                if (item.name[i].type == 'primary') {
                    name = item.name[i].value;
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

function getGameById(id, callback) {
    bgg('thing', {
        id: id,
        type: 'boardgame'
    })
    .then(function(results) {
        callback(results);
    });
}

function searchGame(name, callback) {
    bgg('search', {
        query: name,
        type: 'boardgame',
        exact: 1
    })
    .then(function(results) {
        callback(results);
    });
}

module.exports = { getGameByName }
