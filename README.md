# secure-redirects

An Express middleware to stop unvalidated redirects and forwards.

## API

```js
var secureRedirects = require('secure-redirects')
```

## Why should I secure my Express redirects?

https://www.owasp.org/index.php/Top_10_2013-A10-Unvalidated_Redirects_and_Forwards

### secureRedirect()

Create a new `secure-redirect` Express middleware which stops insecure redirects outside of the current domain.

## Example

Simple app that will not allow redirects outside of the current domain

```js
var express = require('express')
var secureRedirects = require('secure-redirects')

var app = express()

app.use(secureRedirects())

app.get('/', function (request, response) {
    response.send('hello, world!')
})

app.get('/bad-redirect', function (request, response) {
    response.redirect('https://google.com');
})

app.get('/bad-user-redirect', function (request, response) {
    var redirectUrl = request.query.url;
    response.redirect(redirectUrl);
})
```

## TODO

* Add configuration
* Add custom logging
* Add custom redirect logic

## License

[MIT](LICENSE)
