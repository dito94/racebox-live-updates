function validate_contact_form(element) {
	let form = $('form.contact-us');
	let name_input = form.find('input#inp_name');
	let email_input = form.find('input#inp_email');
	let message_input = form.find('textarea');
	let subject_input = form.find('input#inp_subject');
	let tc_cb = form.find('input#inp_tc');

	form.find('input, textarea, .cbcontainer').removeClass('error');
	let ret = true;
	if (name_input.val().length == 0 && (element==null || element == name_input[0]) ) {
		name_input.addClass('error');
		ret = false;
	}
	if (email_input.val().length == 0 && (element==null || element == email_input[0]) ) {
		email_input.addClass('error');
		ret = false;
	}
	if (subject_input.val().length == 0 && (element==null || element == subject_input[0]) ) {
		subject_input.addClass('error');
		ret = false;
	}
	if (message_input.val().length == 0 && (element==null || element == message_input[0]) ) {
		message_input.addClass('error');
		ret = false;
	}
	
	if (! tc_cb.prop('checked') && (element==null || element == tc_cb[0]) ) {
		tc_cb.parent('.cbcontainer').addClass('error');
		ret = false;
	}
	
	if (ret == true) {
		ret = {
			'name': name_input.val(),
			'email': email_input.val(),
			'message': message_input.val(),
			'tc': tc_cb.prop('checked'),
			'topic': $('#inp_topic').val(),
			'subject': subject_input.val()
		};
	}
	return ret;
}

function submit (validation, token) {
	var form = $('form.contact-us');
	form.addClass('sending');
	form.addClass('loading');
	form.find(':input').prop('disabled', true);
	form.removeClass('done');
	form.removeClass('senderror');
	
	validation['cf-turnstile-response'] = token;
	fetch(form.data('target'), {
		method: 'POST',
		body: JSON.stringify(validation),
		headers: { 'Content-Type': 'application/json'},
	})
	.then(response=>response.json())
	.then(function(data) {
		if (data.error) {
			// we assume we were valid
			form.addClass('senderror');
			alert(data.text ? data.text : 'Could not send your inquiry. Please try again');
		} else {
			if (data.ticketId) {
				form.find('.ticket').text(data.ticketId);
			}
			form.addClass('done');

			try { window.gtag('event', 'Contact'); } catch (e) {}
			try { fbq('track', 'Contact'); } catch (e) {}
		}
	})
	.catch (function (error) {
		console.log(error);
		form.addClass('senderror');
		alert('Could not send your inquiry. Please try again');
		form.removeClass('senderror');
	})
	.finally(function() {
		form.removeClass('sending');
		form.removeClass('loading');
		form.find(':input').prop('disabled', false);
		if (window.turnstile) {
			turnstile.reset();
		}
	});
}

$('form.contact-us').submit(function(event) {
	event.preventDefault();
	// validate
	let validation = validate_contact_form(null);
	if (false == validation) {
		return false;
	}
	
	var token = null;
	if (window.turnstile) {
		token = turnstile.getResponse();
		if (!token) {
			alert('Please confirm you are not a robot!');
			return false;
		}
	}
	
	submit(validation, token);
});

$(document).ready(function () {
	$('form.contact-us input[type~=text], form.contact-us textarea').on('input', function (e) {
		validate_contact_form(e.target);
	});
	$('form.contact-us input[type~=checkbox]').on('click', function(e) {
		validate_contact_form(e.target);
	});
})