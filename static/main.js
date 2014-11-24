'use strict';
var sync = io.connect(window.location.origin);
var master = false;
function start () {
	sync.on('news', function (data){
		console.log(data);
	});

	sync.on('sync', function (data){
		console.log(data);
		var params = { allowScriptAccess: "always" };
		var attr = { id: "youtube" };
		var url = 'https://youtube.com/v/'+data.url+'?enablejsapi=1&version=3&playerapiid=ytplayer';
		swfobject.embedSWF(url, 'media', 640, 480, '8', null, null, params, attr);
	});

	sync.on('time', function(data){
		console.log('time', data.time);
		if (player) {
			if (player.getCurrentTime()-5 > data.time || player.getCurrentTime()+5 < data.time) {
				console.log('attempting to sync');
				player.seekTo(data.time, false);
			}
		}
	});

	e("send").addEventListener('submit', function(event){
		event.stopPropagation();
		event.preventDefault();
		var url = e('url').value;
		//send(url);
		master = true;
		sync.emit('sync', {url:url});
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
}

window.setInterval(function(){
	if (typeof player !== 'undefined') {
		player.playVideo();
		if (master) {
			sync.emit('time', {time:player.getCurrentTime()});
		}
	}
}, 500);

//kick off the party when the DOM is ready.
document.addEventListener("DOMContentLoaded", function(event) {
	//go go
	start();
});