class CountdownCounter {
	constructor(element) {
		this.element = $(element);
		this.shown = false;
		const ed = new Date(this.element.data('end-date'));
		this.endTS = Math.floor(ed.getTime() / 1000);
		this.update();
		setInterval(this.update.bind(this), 1000);
	}

	update  () {
		const now = Math.floor((new Date()).getTime() / 1000);
		const remaining = this.endTS - now;
		if (remaining > 0) {
			let second = remaining % 60;
			let minute = Math.floor(remaining / 60) % 60;
			let hour = Math.floor(remaining / (60 * 60)) % (24);
			let day = Math.floor(remaining / (60 * 60 * 24));

			this.element.find(':nth-child(1)').text(String(day).padStart(2, '0'));
			this.element.find(':nth-child(2)').text(String(hour).padStart(2, '0'));
			this.element.find(':nth-child(3)').text(String(minute).padStart(2, '0'));
			this.element.find(':nth-child(4)').text(String(second).padStart(2, '0'));
			if (!this.shown) {
				this.element.fadeTo(300, 1);
				this.shown = true;
			}
		}
	}

}

(function ($) {
	$.fn.countdownCounter = function () {
		return this.each(function () {
			new CountdownCounter(this);
		});
	};
})( jQuery );

$(document).ready(function() {
	$('.countdown-counter').countdownCounter();
});