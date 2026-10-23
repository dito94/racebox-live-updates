$(document).ready(function () {
	$('.bottom-popup-element').each(function(i, node) {
		var trackedElement = $(node).data('track-element-id');
		trackedElement = $('#' + trackedElement)
		if (trackedElement.length > 0) {
			trackedElement = trackedElement[0];
			let intersectionObserver = new IntersectionObserver((entries, observer) => {
				$(node).toggleClass('visible', !entries[0].isIntersecting);
			});
			intersectionObserver.observe(trackedElement);
		}
	});
});