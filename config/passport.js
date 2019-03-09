const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');

passport.use(new LocalStrategy(
    function(username, password, done) {
      User.findOne({username: username}).then(function(user) {
        if (!user) {
          return done(
              null,
              false,
              {'message': 'user not found'});
        }
        if (!user.validPassword(password)) {
          return done(
              null,
              false,
              {'message': 'password is incorrect'});
        }

        return done(null, user);
      }).catch(done);
    }
));
