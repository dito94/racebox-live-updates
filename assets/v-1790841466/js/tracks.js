function parseURLHash() {
	var hash = window.location.hash.substr(1);
	return hash.split('&').reduce(function (result, item) {
	    var parts = item.split('=');
	    result[parts[0]] = decodeURIComponent(parts[1]);
	    return result;
	}, {});
}

function getURLHashParam(name) {
	var parts = parseURLHash();
	return (parts[name] ? parts[name] : null);
}

function setURLHashParams(parts) {
	var components = [];
	for (name in parts) {
		if (name) {
			components.push(name + '=' + encodeURIComponent(parts[name]));
		}
	}
	window.location.hash = components.join('&');
}
function setURLHashParam(name, val) {
	var parts = parseURLHash();
	parts[name] = val;
	setURLHashParams(parts);
}

function unsetURLHashParam(name) {
	var parts = parseURLHash();
	delete (parts[name]);
	setURLHashParams(parts);
}

function displayConfigurations(track) {
	const element = $('#trackConfigurationsList'); 
	element.text('Loading');
	element.addClass('loading');
	$('#tracksContainer').addClass('list');
	$.get($('#mapContainer').data('uri') + '?tid=' + track.id, function(res) {
		if (res) {
			element.text('');
			element.removeClass('loading');
			element.append($('<a href="#" class="back">&laquo; back to all tracks</a>').click(function(e) { e.preventDefault(); clearDisplayedConfigurations(); }));
			element.append($('<h3>' + track.name + '</h3>'));
			const innerElement = $('<div></div>');
			element.append(innerElement);
			const hide_name = res.length == 1;
			res.forEach(function(cfg, idx) {
				innerElement.append('<div>' +
						(cfg.name && !hide_name ? ('<h4>' + cfg.name + '</h4>') : '') + 
						'<img src="' + window.tracksBaseURI + '/' + track.id + '/' + cfg.id +'.svg?w=280&amp;h=280" />' +
						'</div>'
						);
			});
			/*
			$([document.documentElement, document.body]).animate({
		        scrollTop: element.offset().top
		    }, 500);*/
		}
	});
}

function clearDisplayedConfigurations() {
	const element = $('#trackConfigurationsList');
	element.text('');
	$('#tracksContainer').removeClass('list');
}

function onSearchResultOptionClick(e) {
	e.preventDefault();
	focusTrack(e.data.trackId);
	clearDisplayedConfigurations();
}

function getSearchResultOptionElement(name, trackId) {
	return $('<a href="#">' + name + '</a>').
		on('click', null, {trackId: trackId}, onSearchResultOptionClick);
}

function updateSearchResults() {
	const text = $('#search-form input').val().toLowerCase();
	const elem = $('#search-form .ac');
	elem.text('')
	if (text.length === 0) {
		elem.html('<p>Enter track name</p>');
		return;
	}
	
	let matched = 0;
	window.tracks.forEach(function (itm, idx) {
		if (itm.track.name.toLowerCase().indexOf(text) > -1) {
			let t = getSearchResultOptionElement(itm.track.name, itm.track.id);
			elem.append(t);
			matched ++;
		}
	});
	if (matched == 0) {
		elem.html('<p>No results found</p>');
	}
}

function focusTrack(id) {
	window.tracks.forEach(function (itm, idx) {
		if (id == itm.track.id) {
			new google.maps.event.trigger(itm.marker, 'click');
			window.map.setCenter(itm.marker.position);
			window.map.setZoom(10);
		}
	})
}

function initMap() {
	$('#search-form').submit(function(e) {
		e.preventDefault();
	});
	$('#search-form input').on('input', function () {
		updateSearchResults();
	});
	$('#search-form input').focus(function() {
		$('#search-form .ac').css('display', 'block');
		$('#search-form input').trigger('input');
	});
	$('#search-form input').blur(function() {
		setTimeout(function() { $('#search-form .ac').css('display', 'none'); }, 250);
	});
		
	const element = $('#mapContainer');
	const map = new google.maps.Map(element[0], {
	    center: { lat: 0, lng: 0 },
	    zoom: 2,
	    streetViewControl: false,
	    fullscreenControl: false
	});
	window.map = map;
	const infoWindow = new google.maps.InfoWindow({
	    content: "",
	    disableAutoPan: true
	  });
	$.get(element.data('uri'), function(res) {
		window.tracks = [];
		res.forEach(function(track, idx) {
			const marker = new google.maps.Marker({
			    position: {lat: track.c[0], lng: track.c[1]},
			    map: map,
			  });
			marker.addListener('click', function() {
				const ce = $('<div class="ifw">' +
							'<img src="' + window.tracksBaseURI + '/' + track.id + '/default.svg?w=80&amp;h=80&amp;ncl" />' +
							'<div>' +
								'<h3>' + track.name + '</h3>' +
								'<a href="#" class="show-all-configurations">Show all configurations</a>' +
							'</div>' +
							'</div>');
				infoWindow.setContent(ce[0]);
				infoWindow.open(map, marker);
				setURLHashParam('t', track.id);
				clearDisplayedConfigurations();
				ce.find('a.show-all-configurations').click(function (e) {
					e.preventDefault();
					console.log (track);
					displayConfigurations(track);
				});
			});
			window.tracks.push({marker: marker, track: track});
		});
		
		if (getURLHashParam('t')) {
			focusTrack(getURLHashParam('t'));			
		}
	});
	
	if (window.detectedCountry && !getURLHashParam('t')) {
		geocoder = new google.maps.Geocoder();
		geocoder.geocode({'address': window.detectedCountry}, function(results, status) {
			if (status == 'OK') {
				map.setCenter(results[0].geometry.location);
				map.fitBounds(results[0].geometry.viewport);
			}
		});
	}
}

$(function () {
	initMap();
});