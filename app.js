var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var url = require('url');

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

app.use(express.static(__dirname + '/static'));

var media = {playing:0};
var queue = []
io.on('connection', function (socket) {
	if (media) {
		console.log(media.played)
		media.delta = Date.now();
		socket.emit('sync', media);
		socket.emit('queue', queue);
	}
	socket.on('sync', function (data){
		data.url = url.parse(data.url, true);
		if ((data.url.host == null || data.url.host == '') || data.url.protocol.indexOf('http') == -1) {
			console.log('fail');
			socket.emit('errors', {error: 'bad url'});
			return;
		}
		console.log(media);
		data.playing = 0;
		data.duration = null;
		data.played = 0;
		console.log(data.url.host);
		if (data.url.host.indexOf('youtube') !== -1) {
			data.type = 'youtube';
			data.url = data.url.query.v;
		}else if (data.url.host.indexOf('soundcloud') !== -1) {
			data.type = 'soundcloud';
			data.url = data.url.href;
		}
		queue.push(data);
		if (queue.length == 1 && media.playing == 0) {
			io.emit('sync', data);
			if (media.playing == 0) {
				media = queue.pop();
			}
		} else if (media.playing == 0){
			media = queue.pop();
		}
		socket.emit('queue', queue);
		socket.broadcast.emit('queue', queue);
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
		io.emit('time', {time: media.played, type:data.type, delta:Date.now()});
		media.played += 1;
		status();
	}, 1000);
	function status (){
		if (media.played >= media.duration) {
			clearInterval(playback);
			io.emit('done');
			if (queue.length > 0) {
				media = queue.pop();
				io.emit('queue', queue);
				io.emit('sync', media);
			} else {
				media = {playing:0};
				io.emit('queue', queue);
			}
		}
	}
}

var port = process.env.OPENSHIFT_INTERNAL_PORT || process.env.OPENSHIFT_NODEJS_PORT  || 5000;
var ip = process.env.OPENSHIFT_INTERNAL_IP || process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1' || 'localhost';
server.listen(port, ip, function() {
	console.log("Listening on " + port);
});