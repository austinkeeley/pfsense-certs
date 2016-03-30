var request = require('request');
var fScraper = require('form-scraper');
var pRequest = require('promisified-request');
var cheerio = require('cheerio');

request = request.defaults({jar: true});


/*
 * Logs into pfSense
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

var getUsers = function(hostname, token, cb) {
  request.get('http://' + hostname + '/system_usermanager.php', function(err, response) {
    var $ = cheerio.load(response.body);
    var results = [];
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
        username: username,
        fullName: fullName,
        disabled: disabled,
        groups: groups
      });

    });
    cb(null, results);
  });
};

var hostname = '192.168.56.101'

login(hostname, 'admin', 'pfsense', function(err, token) {
  if (err) {
    console.log(err);
    return;
  }
  getUsers(hostname, token, function(err, users) {
    console.log(users);
  });

});
