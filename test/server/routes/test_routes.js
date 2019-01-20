const supertest = require('supertest');
const app = require('../../../app');
const server = app.server;
const request = supertest.agent(server);

describe('Routes', function() {
  /**
   * Import and run tests.
   * @param {string} name - The name of the test to run
   * @param {string} path - The path to the test
   */
  function importTest(name, path) {
    describe(name, function() {
      require(path)(request);
    });
  }

  after(function(done) {
    server.close();
    done();
  });

  importTest('Game Routes', './test_game');
  importTest('User Routes', './test_user');
});
