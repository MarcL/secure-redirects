# secure-redirects

> An Express middleware to stop unvalidated redirects and forwards.

[![Build Status](https://travis-ci.org/MarcL/secure-redirects.svg?branch=master)](https://travis-ci.org/MarcL/secure-redirects)

## Installation

```
npm install --save secure-redirects
```

## Why should I secure my Express redirects?

https://www.owasp.org/index.php/Top_10_2013-A10-Unvalidated_Redirects_and_Forwards

## API

```js
var secureRedirects = require('secure-redirects')
```

### secureRedirects(options)

Create a new `secureRedirects` middleware by using the default options. By default, you don't need to pass any options into it and it will lock your redirects to your current domain. This happens by comparing the redirection URL host against the current host to see if they differ.

#### options.validator

If you need custom functionality then you can pass in a custom validator function. This should be a function which returns a boolean which should be `true` if the redirection host is valid or `false` if the redirection host is invalid. The redirection hostname and the current hostname will be passed to the validator.

```js
var secureRedirects = require('secure-redirects')

var options = {
    // Only allow redirection to google.com
    validator: function(redirectHostname, currentHostname) {
        return (redirectHostname === 'google.com');
    }
}
app.use(secureRedirects(options));
```

#### options.logger

The logger defaults to `console` but you can pass another logger object, such as [Winston](https://github.com/winstonjs/winston) into the options if required. The logger is assumed to contain a `warn` property which is called if the redirection URL is being re-written.

```js
var secureRedirects = require('secure-redirects')

var options = {
    logger: myCustomLogger
}
app.use(secureRedirects(options));
```


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

## License

[MIT](LICENSE)
