var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

app.use(express.static(__dirname + '/static'));

var media;
var queue = []
io.on('connection', function (socket) {
	if (media) {
		socket.emit('sync', media);
	}
	socket.on('sync', function (data){
		data.playing = 0;
		data.duration = null;
		data.played = 0;
		queue.push(data);
		media = data;
		socket.emit('sync', data);
		socket.broadcast.emit('sync', data);
	});

	socket.on('play', function (data){
		media.playing += 1;
		if (media.playing == 1) {
			play(data);
		}
	});
});

function play(data) {
	media.duration = data.duration;
	playback = setInterval(function(){
		io.emit('time', {time: media.played});
		media.played += 1;
		status();
	}, 1000);
	function status (){
		if (media.played >= media.duration) {
			clearInterval(playback);
			io.emit('done');
			media = null;//media = next in queue?
		}
	}
}

var port = 5000;
var ip = '127.0.0.1';
server.listen(port, ip, function() {
	console.log("Listening on " + port);
});