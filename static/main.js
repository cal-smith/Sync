'use strict';
SC.initialize({
	client_id: "09d14c4e812e7b9f44d72e45b7c86725"
});
var sync = io.connect(window.location.origin+':8000');
var played = 0;
function start () {
	sync.on('news', function (data){
		console.log(data);
	});

	sync.on('sync', function (data){
		console.log(data);
		window.data = data;
		if (typeof data.played !== 'undefined') { played = data.played; }
		if (data.type == 'youtube') {
			var params = { allowScriptAccess: 'always' };
			var attr = { id: 'youtube' };
			var url = 'https://youtube.com/v/'+data.url+'?enablejsapi=1&version=3&playerapiid=youtube';
			swfobject.embedSWF(url, 'youtube', 640, 480, '8', null, null, params, attr);
		}
		if (data.type == 'soundcloud') {
			SC.get('/resolve', { url: data.url }, function(track) {
				SC.stream(track.uri, function(sound){
					soundcloud(sound, track);
				});
			});
		}
	});

	sync.on('time', function(data){
		console.log(data.time*1000)
		if (data.type == 'youtube' && typeof player !== 'undefined') {
			if (player.getCurrentTime()-5 > data.time || player.getCurrentTime()+5 < data.time) {
				console.log('attempting to sync');
				player.seekTo(data.time, false);
			}
		}
		if (data.type == 'soundcloud' && typeof sound !== 'undefined') {
			if (sound.position-5000 > data.time*1000 || sound.position+5000 < data.time*1000) {
				sound.setPosition(data.time*1000 + (Date.now() - data.delta));
				console.log('attempting to sync', sound.position, data.time*1000 + (Date.now() - data.delta));
			}
		}
	});

	sync.on('done', function(){
		played = 0;
		console.log('done');
		var done = window.setInterval( function(){
			if (data.type == 'youtube' && player.getCurrentTime() >= player.getDuration()){
				e('youtube').remove();
				e('media').innerHTML += '<div id="youtube"></div>';
				//player.stopVideo();
				stop();
			}
			if (data.type == 'soundcloud' && sound.position >= sound.duration) {
				//delete sound manager stuff
				e('media').style.background = "white";
			}
		}, 500);
		function stop(){
			window.clearInterval(done);
		}
	});

	sync.on('queue', function(data){
		e('queue').textContent = JSON.stringify({data:data}) + JSON.stringify(window.data);
		console.log(data);
	});

	sync.on('errors', function(data){
		console.log(data);
	});

	e("send").addEventListener('submit', function(event){
		event.stopPropagation();
		event.preventDefault();
		var url = e('url').value;
		sync.emit('sync', {url:url});
		e('url').value = "";
	});

	function send(url){
		sync.emit('sync', {url:url});
	}
	window.sync = sync;
}

function e(elem){
	return document.getElementById(elem);
}

function onYouTubePlayerReady(playerId){
	var player = e('youtube');
	window.player = player;
	if (played > 0) {
		player.seekTo(data.time, true);
	} else {
		sync.emit('play', {duration:player.getDuration(), type:'youtube'});
		player.playVideo();
	}
}

function soundcloud (sound, track){
	console.log(track, track.artwork_url.replace('large', 'original'), track.user.username, track.user.avatar_url.replace('large', 'original'));
	track.user.avatar_url.replace('large', 'original')
	e('media').style.background = 'url("'+track.artwork_url.replace('large', 'original')+'")';
	e('media').style['background-size'] = 'cover';
	if (played > 0) {
		sound.play();
		sound.setPosition((Date.now() - data.delta) + (data.played * 1000));
	} else {
		sync.emit('play', {duration:track.duration/1000, type:'soundcloud'});
		sound.play();
	}
	window.sound = sound;
	window.track = track;
}

//kick off the party when the DOM is ready.
document.addEventListener("DOMContentLoaded", function(event) {
	//go go
	start();
});