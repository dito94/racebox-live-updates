
function openCountrySelect(currentCountry, event) {
	try { gtag('event', 'OpenCountrySelect', {'event_category': 'CountrySelect'}); } catch (e) {}
	if (!window.countrySelectModalContainer) {
		window.countrySelectModalContainer = $('#country-select-modal');
		// fire ajax to load the list of countries
		$.get(window.countrySelectModalContainer.data('countries-url'), function (countries) {
			let select = window.countrySelectModalContainer.find('select');
			select.html('');
			for (var code in countries) {
				var opt = document.createElement('option');
				opt.value = code;
				opt.innerHTML = countries[code];
				opt.selected = (code == currentCountry);
				select.append(opt);
			}
			window.countrySelectModalContainer.find('div.loaded').css('display', 'block');
			window.countrySelectModalContainer.find('div.loading').css('display', 'none');
			
			window.countrySelectModalContainer.find('form').submit(function (event) {
				event.preventDefault();
				let form = $(this);
				form.find('button').prop('disabled', true);
				form.find('select').prop('disabled', true);
				
				let selected = form.find('select').val();
				form.addClass('sending');
				$.post(form[0].action, {country: selected}, function (res) {
					window.location.reload();
				});
				try { gtag('event', 'SubmitCountrySelect', {'event_category': 'CountrySelect'}); } catch (e) {}
			});
			
			select.focus();
		});
	}
	window.countrySelectModalContainer.css('display', 'block');
	event.preventDefault();
}

function closeCountrySelect(event) {
	if (window.countrySelectModalContainer) {
		window.countrySelectModalContainer.css('display', 'none');
		event.preventDefault();
	}
}

window.onclick = function (event) {
	if (window.countrySelectModalContainer && event.target == window.countrySelectModalContainer) {
		closeCountrySelect();
		event.preventDefault();
	}
}

$(document).ready(function() {
	$('.country-select-open-button').click(function (event) {
		openCountrySelect($(this).data('current-selected'), event);
	});
	$('#country-select-modal span.close').click(closeCountrySelect);
});