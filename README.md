# secure-redirects

An Express middleware to stop unvalidated redirects and forwards.

## Why should I secure my Express redirects?

https://www.owasp.org/index.php/Top_10_2013-A10-Unvalidated_Redirects_and_Forwards

## API

```js
var secureRedirects = require('secure-redirects')
```

### secureRedirects(options)

Create a new `secureRedirects` middleware by using the default options. By default, you don't need to pass any options into it and it will lock your redirects to your current domain. This happens by comparing the redirection URL host against the current host to see if they differ.

#### options.validator

If you need custom functionality then you can pass in a custom validator function. This should be a function which returns a boolean which should be `true` if the redirection host is invalid. The redirection hostname and the currenthostname will be passed to the validator.

```js
var secureRedirects = require('secure-redirects')

var options = {
    // Disallow redirection to google.com
    validator: function(redirectHostname, currentHostname) {
        return (redirectHostname === 'google.com');
    }
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

## TODO

* Add configuration
* Add custom logging
* Add custom redirect logic

## License

[MIT](LICENSE)
