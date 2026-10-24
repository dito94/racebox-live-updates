class NewsletterSubscribePopup {
	constructor(element) {
		this.element = $(element);
		this.element.find('form').on('submit', this.submit.bind(this));
		this.element.find('.close').on('click', this.close.bind(this));
		this.emailInput = this.element.find('input[type~=email]');
		this.agreeCheckbox = this.element.find('input#PPTCAcceptCheckbox');
		this.isSubscribed = false;
		if (typeof localStorage != 'undefined' && localStorage.getItem('newsletterSubsribedEmail')) {
			this.element.addClass('subscribed');
			this.element.find('.subscribed-email').text(localStorage.getItem('newsletterSubsribedEmail'));
			this.isSubscribed = true;
		}
		this.element.find('a.reset').on('click', this.reset.bind(this));
	}
	
	open(event) {
		if (event) {
			event.preventDefault();
		}
		this.element.css('display', 'block');	
		this.element.removeClass('loading');
		
		try {
			gtag('event', 'discount_popup_open');
			fbq('trackCustom', 'DiscountPopupOpen');
		} catch (error) {}
	}
	
	close(event) {
		if (event) {
			event.preventDefault();
		}
		this.element.css('display', 'none');
		
		if (this.onClose) {
			this.onClose(this.isSubscribed);
		}
	}
	
	submit(event) {
		if (event) {
			event.preventDefault();
		}
		const email = this.emailInput.val();
		const pptAgreed = this.agreeCheckbox.prop('checked');
		
		if (! /\S+@\S+\.\S+/.test(email)) {
			alert('This does not look like a valid email address');
			return;
		}
		if (!pptAgreed) {
			alert('You cannot subscribe unless you agree to our Privacy Policy and Terms and Conditions');
			return;
		}
		
		let data = {action: 'subscribe', email: email, agreed: pptAgreed};
		this.element.addClass('loading');
		
		try {
			gtag('event', 'discount_popup_subscribe');
			fbq('trackCustom', 'DiscountPopupSubscribe');
		} catch (error) {}
		
		fetch(this.element.data('url'), {
			method: 'POST',
			headers: { 'Content-Type': 'application/json'},
			body: JSON.stringify(data)
		})
		.then ((res) => res.json())
		.then ((data) => this.submitResponse(data))
		.finally(() => this.element.removeClass('loading'));
	}
	
	submitResponse(data) {
		if (data.error) {
			this.element.removeClass('subscribed');
			this.element.find('.error').text(error); 
		} else {
			this.element.addClass('subscribed');
			const email = this.emailInput.val();
			this.element.find('.subscribed-email').text(email);
			this.element.find('.subscribed .code').text(data.code);
			if (typeof localStorage != 'undefined') {
				localStorage.setItem('newsletterSubsribedEmail', email);
			}
			this.isSubscribed = true;
		}
	}
	
	reset (event) {
		if (event) {
			event.preventDefault();
		}
		this.element.removeClass('subscribed');
		if (typeof localStorage != 'undefined') {
			localStorage.removeItem('newsletterSubsribedEmail');
		}
		this.isSubscribed = false;
	}

	startAutoShowTimer() {
		this.autoShowTimer = setTimeout(this.open.bind(this), 5000);
	}
	holdAutoShowTimer() {
		if (this.autoShowTimer) {
			this.autoTimerWasHeld = true;
			clearTimeout(this.autoShowTimer);
			this.autoShowTimer = null;
		}
	}
	resumeAutoShowTimer() {
		if (this.autoTimerWasHeld) {
			this.autoTimerWasHeld = false;
			this.startAutoShowTimer();
		}
	}

}

$(function() {
	window.newsletterSubscribePopup = new NewsletterSubscribePopup('#newsletter-subscribe-popup');
	$('.newsletter-popup-trigger').on('click', function(event) {
		window.newsletterSubscribePopup.open(event);
	});
	
	window.newsletterSubscribePopup.onClose = function(subscribed) {
		$('.newsletter-popup-trigger.fixed').toggle(subscribed);
		if (!subscribed) {
			Cookies.set('newsletter-subscribe-popup-dismissed', true, {expires: 7});
		}
	};
	
	if (!window.newsletterSubscribePopup.isSubscribed) {
		$('.newsletter-popup-trigger.fixed').show();
		if (!Cookies.get('newsletter-subscribe-popup-dismissed')) {
			window.newsletterSubscribePopup.startAutoShowTimer();
		}
	} else {
		$('.newsletter-popup-trigger.fixed').hide();
	}
});
