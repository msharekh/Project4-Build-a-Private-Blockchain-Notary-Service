var express = require('express');
var app = express();

// respond with "hello world" when a GET request is made to the homepage

app.get('/stars/:address', (req, res) => {
  var address = req.params.address;
  console.log('address', ':	', address);
  res.send('hello world');
});
