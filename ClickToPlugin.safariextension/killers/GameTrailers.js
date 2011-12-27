addKiller("GameTrailers", {

"canKill": function(data) {
	return data.location.indexOf("gametrailers.com") !== -1;
},
"process": function(data, callback) {
	console.log(data);
	
	var movieId;
	var matches = /\d+$/.exec(data.params.data);
	
	if( !matches || matches.length < 1)
		return;
	
	movieId = matches[0];
	var url = "http://www.gametrailers.com/neo/?page=xml.mediaplayer.Mediagen&movieId=" + movieId + "&width=0&height=0&prerollOption=&siteNameInAdTags=&ssc=&impressiontype=24&swfserver=media.mtvnservices.com&testmode=&hd=1&um=0";
	var sources = [];
	
	_this = this;
	var xhr = new XMLHttpRequest();
	xhr.open('GET', url, true);
	xhr.onload = function() {
	
		var doc = new DOMParser().parseFromString(xhr.responseText.replace(/^\s+/,''), "text/xml");		
		var renditions = doc.getElementsByTagName('rendition');
		
		for( var i = 0, max = renditions.length; i < max; i++ ) {

			var src = renditions[i].getElementsByTagName('src')[0];
			
			var info = {};
			info.height = renditions[i].getAttribute('height');
			info.format = info.height + "p";
			info.isNative = renditions[i].getAttribute('type').indexOf('mp4') !== -1;
			info.url = src.textContent;
			sources.push(info);
		};
		
//		<rendition bitrate="1200" duration="169" width="640" height="360" mediaid="725281" type="video/mp4">

				
		callback({
			"playlist": [{
				"title": data.title,
				"sources": sources
		 }]});
	};
	xhr.send();

		
}

});
