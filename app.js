var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

app.use(express.static(__dirname + '/static'));

var media;
io.on('connection', function (socket) {
	if (media) {
		socket.emit('sync', media);
	}
	socket.on('sync', function (data){
		socket.emit('sync', data);
		socket.broadcast.emit('sync', data);
		media = data;
	});
	socket.on('time', function (data){
		socket.broadcast.emit('time', data);
	});
});

var port = 5000;
var ip = '127.0.0.1';
server.listen(port, ip, function() {
	console.log("Listening on " + port);
});