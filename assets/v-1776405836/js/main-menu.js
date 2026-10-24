// Main menu change background on scroll (OBSOLETE)
function top_menu_bg_update() {
	if ($(this).scrollTop() > 0) {
		$('nav.top').addClass('scrolled');
	}  else {
		$('nav.top').removeClass('scrolled');
	}
}
$(document).scroll(top_menu_bg_update);
$(document).ready(top_menu_bg_update);

$('nav.top .micon a').click(function() {
	$('nav.top .micon input').prop('checked', false);
});