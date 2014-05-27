
// set colspan for footer labels and subtotals, depending on no. of tax columns
$('#document-table').change(function() {
	alert('Änderungen!');
	colspan();
});	
$('#discount').change(function() {
	alert('Änderungen!');
	colspan();
});
$('#tax').change(function() {
	alert('Änderungen!');
	colspan();
});

// set correct colpsan for tfoot (subtotals) depending on count of Tax columns
function colspan() {
	
	alert('Änderungen!');

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

// google address autocomplete feature
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


// DROPBOX LOGO UPLOAD

$( "#dropboxupload" ).click(function() {
	Dropbox.choose(options);
    });
	options = {
		success : function(files) {
		console.log(files);
		$('#company_logo').attr('src',  files[0].link);	
		localStorage["logo"] = files[0].link;					
		},
		multiselect : false, 
		linkType: "direct",
		extensions : ['.jpeg', '.gif', '.jpg', '.png'],
};

$(document).ready(function() {
	//set default currency
	$("#currency").val('USD');
	$("#tax").trigger("change");

	$("#currency").trigger('change');
	$("#logoCompany").change(function() {
		readURL(this);
	});

	// toggle shipping-button

   $ (function (){
   	var d = "";
   	var d = $('.shipping-total').val();
   	if (d != 0) {
   		$('.shipping-yes').click();
   	} else {
   		$('.shipping-no').click();
   	}
   	});
   	

	// set all textareas to autosize
	$('textarea').autosize();

	// destroy autosize for different inputs
	$('#document-to-company').trigger('autosize.destroy');
	$('#document-type').trigger('autosize.destroy');
	$('.currency-label').trigger('autosize.destroy');

});
