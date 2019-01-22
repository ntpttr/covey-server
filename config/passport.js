const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({username: username}).then(function(user) {
      if(!user || !user.validPassword(password)){
        return done(null, false, {'message': 'username or password is invalid'});
      }

      return done(null, user);
    }).catch(done);
  }
));
