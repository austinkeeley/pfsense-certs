var request = require('request');
var fScraper = require('form-scraper');
var pRequest = require('promisified-request');
var cheerio = require('cheerio');

request = request.defaults({jar: true});


/*
 * Logs into pfSense and sets the global session ID
 */
var login = function(hostname, username, password, cb) {
  var promise = pRequest.create(request);
  var formStructure = fScraper.fetchForm('#iform', 'http://' + hostname + '/index.php', promise);
  fScraper.submitForm({
    usernamefld: username,
    passwordfld: password,
    login: 'Login'
  }, fScraper.provideForm(formStructure), promise).then(function(response) {
    if (response.statusCode === 302) {
      if (!response.headers['set-cookie']) {
        cb('Cookie not set', null);
      }
      response.headers['set-cookie'].forEach(function(cookie) {
        var pair = cookie.split(';');
        var keyValue = pair[0].split('=');
        if (keyValue[0] === 'PHPSESSID') {
          cb(null, keyValue[1]);
          found = true;
          return;
        }
      });
      if (!found) { cb('Cookie not set', null); }

    }
    else {
      cb('Incorrect username or password', null);
    }
  });
};

/*
 * Gets the pfSense users
 */
var getUsers = function(hostname, cb) {
  request.get('http://' + hostname + '/system_usermanager.php', function(err, response) {
    var $ = cheerio.load(response.body);
    var results = [];
    var id = 0;
    $('.sortable > tbody > tr').map(function(index, row) {
      var cols = [];
      $(row).find('td').each(function(index, col) {
        cols.push($(col).text());
      });
      var username = cols[1].trim();
      var fullName = cols[4].trim();
      var disabled = cols[5].trim() === '*';
      var groups = cols[6].trim().split(',');

      results.push({
        id: id++,
        username: username,
        fullName: fullName,
        disabled: disabled,
        groups: groups
      });

    });
    cb(null, results);
  });
};

module.exports = {
  login: login,
  getUsers: getUsers
};
