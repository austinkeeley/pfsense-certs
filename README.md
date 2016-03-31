# pfsense-certs

pfSense 3.0 should have a REST API, but in the meantime, this is a library for
pulling user info and certificates from a pfSense server.

It uses the web connector interface, form-scraper, and cheerio to scrape the
forms and submit them to get the certificate data.


## .login(hostname, username, password, cb) 

Logs into a pfSense instance and sets the session token in the global 
request object

## .getUsers(hostname, cb)

Gets the users stored in the pfSense user database

## .getCerts(hostname, userID, cb)

Gets the certificate names for the specified user

## .exportCert(hostname, userID, certID, cb)

Gets the contents of a certificate

## .exportKey(hostname, userID, certID, cb)

Gets the contents of a private key
