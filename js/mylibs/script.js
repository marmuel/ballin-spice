$(document).ready(function() {
	//set default currency
	$("#tax").trigger('change');
	$("#currency").trigger('change');
	$("#logoCompany").change(function() {
		readURL(this);
	});

	//autosize
	// set all textareas to autosize
	$('textarea').autosize();
	// destroy autosize for particular inputs
	$('.document-to-company').trigger('autosize.destroy');
	$('#document-type').trigger('autosize.destroy');
	$('.currency-label').trigger('autosize.destroy');
	$('.discount-row').trigger('autosize.destroy');
	$('#document-number-label').trigger('autosize.destroy');
	$('#document-number').trigger('autosize.destroy');
	$('#document-date').trigger('autosize.destroy');
	$('#document-due-label').trigger('autosize.destroy');

});

// trigger / change currency with timeout after updating the country
$("#country-select").change(function() {
	setTimeout(function() {
		$("#currency").trigger('change');
	}, 100);
});

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

var addressFormatted;

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
		addressFormatted = place.formatted_address;
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

$("#dropboxupload").click(function() {
	Dropbox.choose(options);
});
options = {
	success : function(files) {
		console.log(files);
		$('#company_logo').attr('src', files[0].link);
		localStorage["logo"] = files[0].link;
	},
	multiselect : false,
	linkType : "direct",
	extensions : ['.jpeg', '.gif', '.jpg', '.png'],
};

// Add formatted Address to textarea
function Country() {
	var toAddress = addressFormatted;
	toAddress = toAddress.replace(/, /gi, "\n").replace(/^,/, "");
	$("#document-to").val(toAddress);
}

// Add Class on hover and active cell
$(function() {
	var table = $('table').on('click', 'td', function() {
		$('.table tr td').removeClass('active');
		$(this).addClass('active');
		$('.toolbar').css('display', 'block');
	});
});
// Style the active cells
$("#left_align_btn").click(function() {
	$('td.active input, td.active textarea').css('text-align', 'left');
});
$("#right_align_btn").click(function() {
	$('td.active input, td.active textarea').css('text-align', 'right');
});
$("#center_align_btn").click(function() {
	$('td.active input, td.active textarea').css('text-align', 'center');
});

$("#bold_btn").click(function() {
	if ($('td.active input, td.active textarea').css('font-weight') == 'bold') {
		$('td.active input, td.active textarea').css('font-weight', 'normal');
	} else {
		$('td.active input, td.active textarea').css('font-weight', 'bold');
	}
});
$("#italic_btn").click(function() {
	if ($('td.active input, td.active textarea').css('font-style') == 'italic') {
		$('td.active input, td.active textarea').css('font-style', 'normal');
	} else {
		$('td.active input, td.active textarea').css('font-style', 'italic');
	}
});

/// google calendar api

var clientId = '716638134843-3h53o486dcghf977r5hk259k723jdg9g.apps.googleusercontent.com';
var apiKey = '0u40xship131D9pXAyPfByo2';
var scopes = 'https://www.googleapis.com/auth/calendar';

// boilerplate methods to check that the user is logged in and to handle authorization

function handleClientLoad() {
	gapi.client.setApiKey(apiKey);
	window.setTimeout(checkAuth, 1);
	checkAuth();
}

function checkAuth() {
	gapi.auth.authorize({
		client_id : clientId,
		scope : scopes,
		immediate : true
	}, handleAuthResult);
}

function handleAuthResult(authResult) {
	var authorizeButton = document.getElementById('authorize-button');
	if (authResult) {
		authorizeButton.style.visibility = 'hidden';
		makeApiCall();
	} else {
		authorizeButton.style.visibility = '';
		authorizeButton.onclick = handleAuthClick;
	}
}

function handleAuthClick(event) {
	gapi.auth.authorize({
		client_id : clientId,
		scope : scopes,
		immediate : false
	}, handleAuthResult);
	return false;
}
// add event to primary calendar
function makeApiCall() {
	gapi.client.load('calendar', 'v3', function() {
		var request = gapi.client.calendar.events.list({
			'calendarId' : 'primary'
		});

        var docno =  $('#document-number').val();
        var cus =  $('.to-company').val();       
        var summary = 'Invoice ' + docno + ' for Customer: ' + cus + ' is now overdue!';
        var dueDate = $('#dateHelper').val();
        
        // get offset
        
function pad(number, length){
    var str = "" + number;
    while (str.length < length) {
        str = '0'+str;
    }
    return str;
}

var offset = new Date().getTimezoneOffset();
offset = ((offset<0? '+':'-')+ // Note the reversed sign!
          pad(parseInt(Math.abs(offset/60)), 2)+
          pad(Math.abs(offset%60), 2));

        
        
        console.log(offset);
		request.execute(function() {
			var resource = {
				"summary" : summary,
				"start" : {
					"dateTime" : dueDate + "T10:00:00" + offset
				},
				"end" : {
					"dateTime" : dueDate + "T10:15:00" + offset
				}
			};
			var request = gapi.client.calendar.events.insert({
				'calendarId' : 'primary',
				'resource' : resource
			});
			request.execute(function(resp) {
				console.log(resp);
			});

		});
	});
}

