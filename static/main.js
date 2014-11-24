'use strict';
var sync = io.connect(window.location.origin);
var played = 0;
function start () {
	sync.on('news', function (data){
		console.log(data);
	});

	sync.on('sync', function (data){
		console.log(data);
		if (typeof data.played !== 'undefined') { played = data.played; }
		var params = { allowScriptAccess: 'always' };
		var attr = { id: 'youtube' };
		var url = 'https://youtube.com/v/'+data.url+'?enablejsapi=1&version=3&playerapiid=ytplayer';
		swfobject.embedSWF(url, 'media', 640, 480, '8', null, null, params, attr);
	});

	sync.on('time', function(data){
		console.log(data.time)
		if (typeof player !== 'undefined') {
			if (player.getCurrentTime()-5 > data.time || player.getCurrentTime()+5 < data.time) {
				console.log('attempting to sync');
				player.seekTo(data.time, false);
			}
		}
	});

	sync.on('done', function(){
		played = 0;
		player.stopVideo();
	});

	e("send").addEventListener('submit', function(event){
		event.stopPropagation();
		event.preventDefault();
		var url = e('url').value;
		//send(url);
		sync.emit('sync', {url:url, type:'youtube'});
		e('url').value = "";
	});

	function send(url){
		sync.emit('sync', {url:url});
		//e('media').textContent = url;
	}
	window.sync = sync;
}

function e(elem){
	return document.getElementById(elem);
}

function onYouTubePlayerReady(playerId){
	console.log(playerId)
	var player = e('youtube');
	window.player = player;
	if (played > 0) {
		player.seekTo(data.time, true);
	} else {
		sync.emit('play', {duration:player.getDuration()});
		player.playVideo();
	}
}

//kick off the party when the DOM is ready.
document.addEventListener("DOMContentLoaded", function(event) {
	//go go
	start();
});