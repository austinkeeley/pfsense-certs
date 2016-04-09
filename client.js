var request = require('request');
var fScraper = require('form-scraper');
var pRequest = require('promisified-request');
var cheerio = require('cheerio');

/*
 * Gets the pfSense users
 */
var getUsers = function(session, cb) {
  request.get({
    url: 'http://' + session.hostname + '/system_usermanager.php',
    headers: {
      'Cookie': 'PHPSESSID=' + session.token
    }
  }, function(err, response) {
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


/*
 * Gets the certificates and private keys for a user
 */
var getCerts = function(session, userID, cb) {

  var r = request.defaults({
    headers: {
      'Cookie': 'PHPSESSID=' + session.token
    }
  });

  var promise = pRequest.create(r);
  var formStructure = fScraper.fetchForm('#iform2', 'http://' + session.hostname + '/system_usermanager.php', promise);
  formStructure.then(function(form) {
    r.post('http://' + session.hostname + '/system_usermanager.php', {
      form: {
        __csrf_magic: form.data.__csrf_magic,
        act: 'edit',
        userid: userID
      }
    }, function(err, response) {

      var $ = cheerio.load(response.body);
      var rows = $('table[summary="certificates"] tr');
      rows = rows.slice(1, rows.length - 1);
      var results = [];
      var certID = 0;

      rows.map(function(index, row) {
        var cols = [];
        $(row).find('td').each(function(index, col) {
          cols.push($(col).text());
        });

        var certName = cols[0].trim();
        var rootCAName = cols[1].trim();
        results.push({
          id: certID++,
          name: certName,
          ca: rootCAName
        });

      });
      cb(null, results);
    });

  },
  function(err) {
    cb(err, null);
  });
};

/*
 * Exports a single certificate
 */
var exportCert = function(session, userID, certID, cb) {

  var r = request.defaults({
    headers: {
      'Cookie': 'PHPSESSID=' + session.token
    }
  });

  var promise = pRequest.create(r);
  var formStructure = fScraper.fetchForm('#iform2', 'http://' + session.hostname + '/system_usermanager.php', promise);
  formStructure.then(function(form) {
    r.post('http://' + session.hostname + '/system_usermanager.php', {
      form: {
        __csrf_magic: form.data.__csrf_magic,
        act: 'expcert',
        userid: userID,
        certid: certID
      }
    }, function(err, response) {
      cb(null, response.body);
    });
  },
  function(err) {
    cb(err, null);
  });
};


/*
 * Exports a single private key
 */
var exportKey = function(session, userID, certID, cb) {

  var r = request.defaults({
    headers: {
      'Cookie': 'PHPSESSID=' + session.token
    }
  });

  var promise = pRequest.create(r);
  var formStructure = fScraper.fetchForm('#iform2', 'http://' + session.hostname + '/system_usermanager.php', promise);
  formStructure.then(function(form) {
    r.post('http://' + session.hostname + '/system_usermanager.php', {
      form: {
        __csrf_magic: form.data.__csrf_magic,
        act: 'expckey',
        userid: userID,
        certid: certID
      }
    }, function(err, response) {
      cb(null, response.body);
    });
  },
  function(err) {
    cb(err, null);
  });
};

module.exports = {
  getUsers: getUsers,
  getCerts: getCerts,
  exportCert: exportCert,
  exportKey: exportKey
};
