# pfsense-certs

pfSense 3.0 should have a REST API, but in the meantime, this is a library for
pulling user info and certificates from a pfSense server.

It uses the web connector interface, form-scraper, and cheerio to scrape the
forms and submit them to get the certificate data.

## Installation
You will probably want both this package and `pfsense-session` so you can create session
objects.

    npm install pfsense-session
    npm install pfsense-certs

To use each function, you will need a `session` object, which can be created using
the `pfsense-session`'s `login` method.

## Example

Get all certificates for all users and dump to the console

    var pfSenseSession = require('pfsense-session');
    var pfSenseCerts = require('./pfsense-certs');

    pfSenseSession.login('your-pfsense-hostname-here', 'admin', 'pfsense', function(err, session) {

      pfSenseCerts.getUsers(session, function(err, users) {
        users.forEach(function(user) {
          pfSenseCerts.getCerts(session, user.id, function(err, certs) {
            certs.forEach(function(cert) {
              pfSenseCerts.exportCert(session, user.id, cert.id, function(err, certData) {
                console.log(certData);
              });
            });
          });
        });
      });
    });

### .getUsers(session, cb)

Gets the users stored in the pfSense user database

### .getCerts(session, userID, cb)

Gets the certificate names for the specified user

### .exportCert(session, userID, certID, cb)

Gets the contents of a certificate

### .exportKey(session, userID, certID, cb)

Gets the contents of a private key
