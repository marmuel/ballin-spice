$(document).ready(function() {

	// trigger default values
	$('.tax-subtotal').hide();
	$("#tax").trigger("change");


	// set all textareas to autosize
	$('textarea').autosize();

	// destroy autosize for different inputs
	$('#document-to-company').trigger('autosize.destroy');
	$('#document-type').trigger('autosize.destroy');
	$('.currency-label').trigger('autosize.destroy');

});

// add dynamically rows for taxes
$('#tax').change(function() {
	colspan();
});
// TODO Not really a good way to set colspan...
$('#document-table').change(function() {
	colspan();
});	

// set correct colpsan for tfoot (subtotals) depending on count of Tax columns
function colspan() {

	var ts = $("#tax option:selected").index();
	var colspan = ts + 1;
	if (ts == "0") {
		$('.footer-labels').attr('colspan', 1);
	}
	if (ts == "1") {
		$('.footer-labels').attr('colspan', 2);
	}
	if (ts == "2") {
		$('.footer-labels').attr('colspan', 3);
	}
}

// autocomplete feature
// of the Google Places API to help users fill in the information.

// Use Google Search or not
var $googlesearch = $('#googlesearch');
var gbtnsearchagain = $('.address-controls');
var locationfield = $('#locationField');
var gaddressResult = $('#google-result');
var manaddress = $("#document-to");
var gaddress = $('#google-address');


// Search Again
var $gSearchAgain = $('#search-again');
$gSearchAgain.on('click', function() {
	// google address search
	(gaddress).hide();
	(manaddress).hide();
	(gbtnsearchagain).hide();
	$('#autocomplete').val('');
	(locationfield).show();
	(gaddressResult).hide();
	$('#autocomplete').focus();
});

// Accept Search
var $gSearchAccept = $('#search-accept');
$gSearchAccept.on('click', function() {
	
var gaddress = $('#google-address');
	(manaddress).show();
	(gbtnsearchagain).hide();
	$('#autocomplete').val('');
	(gaddressResult).hide();
		(gaddress).fadeOut();

	Country();
});

// Autocomplete

var placeSearch, autocomplete;
var componentForm = {
	street_number : 'short_name',
	route : 'long_name',
	locality : 'long_name',
	administrative_area_level_1 : 'short_name',
	country : 'long_name',
	postal_code : 'short_name'
};

function initialize() {
	// Create the autocomplete object, restricting the search
	// to geographical location types.
	autocomplete = new google.maps.places.Autocomplete(
	/** @type {HTMLInputElement} */(document.getElementById('autocomplete')), {
		types : ['geocode']
	});
	// When the user selects an address from the dropdown,
	// populate the address fields in the form.
	google.maps.event.addListener(autocomplete, 'place_changed', function() {
		fillInAddress();
	});
}

function fillInAddress() {
	var gaddressResult = $('#google-result');
	var gaddress = $('#google-address');
	var locationfield = $('#locationField');
	var gbtnsearchagain = $('.address-controls');

	(locationfield).fadeOut();
	(gaddress).fadeIn();
	(gaddressResult).fadeIn();
	(gbtnsearchagain).fadeIn();
	// Get the place details from the autocomplete object.
	var place = autocomplete.getPlace();
	for (var component in componentForm) {
		document.getElementById(component).value = '';
		document.getElementById(component).disabled = false;
	}

	// Get each component of the address from the place details
	// and fill the corresponding field on the form.
	for (var i = 0; i < place.address_components.length; i++) {
		var addressType = place.address_components[i].types[0];
		if (componentForm[addressType]) {
			var val = place.address_components[i][componentForm[addressType]];
			document.getElementById(addressType).value = val;
		}
	}
}

// Bias the autocomplete object to the user's geographical location,
// as supplied by the browser's 'navigator.geolocation' object.
function geolocate() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			var geolocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
			autocomplete.setBounds(new google.maps.LatLngBounds(geolocation, geolocation));
		});
	}
}


