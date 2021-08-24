const request = require('request');

request(process.argv[2], { json: false }, (err, res, body) => {
  if (err) { return console.log(err); }
  console.log(body.url);
  console.log(body.explanation);
});