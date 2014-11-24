var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

app.get('/', function(req, res) {
  res.sendFile(__dirname + 'views/index.html');
});

var port = 5000;
var ip = '127.0.0.1';
server.listen(port, ip, function() {
	console.log("Listening on " + port);
});