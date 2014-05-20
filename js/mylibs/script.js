$(document).ready(function() {
	// empty all inputs of tbody

	//$("#document-table> tbody").not(':first').empty();

	// trigger default values
	$('.tax-subtotal').hide();
	$("#tax").trigger("change");


	// add class for styling
	$("#document-table").tableDnD({
		onDragClass : "myDragClass"
		//dragHandle: ".dragHandle"
	});
	// add class for hover move icon
	$('table tr:not(".nodrag")').hover(function() {
		$(this.cells[0]).addClass('showDragHandle');
	}, function() {
		$(this.cells[0]).removeClass('showDragHandle');
	});

	// set all textareas to autosize
	$('textarea').autosize();

	// destroy autosize for different inputs
	$('#document-tocompany').trigger('autosize.destroy');
	$('#document-type').trigger('autosize.destroy');
	//$('.document-inputs-googlesearch').trigger('autosize.destroy');

});

// add dynamically rows for taxes
$('#tax').change(function() {
	delTaxSubtotalRows();
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
var gaddressResult = $('#addressresult');
var manaddress = $("#document-to");

$googlesearch.on('click', function() {
	// Init Modal Email-Dialog Translation 
	// google address search
	(manaddress).hide();
	(gaddressResult).hide();
	(gbtnsearchagain).hide();
	$('#autocomplete').val('');
	(locationfield).show();
	$('#autocomplete').focus();

});

// Search Again
var $gSearchAgain = $('#search-again');
$gSearchAgain.on('click', function() {
	// google address search
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
	
var gaddress = $('#googleaddress');
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
	var gaddressResult = $('#addressresult');
	var gaddress = $('#googleaddress');
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


$("#document-table tbody .tax1-row, .tax2-row").on("change", function() {
	var a = {}, l = 0;
	// remove all tax rows - TODO: Performance?
	delTaxSubtotalRows();

	$('.tax2-row, .tax1-row').each(function() {
		if ($(this).val() != "") {
            taxPercent = "";
            taxSelector = ""; 
			var taxPercent = $(this).val();
			var taxSelector = "tax" + taxPercent;
			if ($('#document-table tfoot tr').hasClass(taxSelector)) {
				//taxSelector class is available
				console.log('ist schon da');
				return false;
			} else {
				//taxSelector class is not available

				var $newTaxSubtotalRow = $('<tr class="nodrag taxrow tax-subtotal tax' + taxPercent + '"><td colspan="3" class="noline" style="cursor: default;"></td><td class="nodrag footer-labels"><textarea type="text" class="table-inputs tax-row" translate="inv.table.taxtotal1" style="cursor: default; overflow: hidden; word-wrap: break-word; resize: none; height: 38px;"></textarea></td><td style="cursor: default;" class="nodrag"><input class="table-inputs tax-total" disabled="disabled" value="0"></td><td style="cursor: default;" class="nodrag currency-column"><textarea type="text" class="table-inputs currency-label" style="cursor: default; overflow: hidden; word-wrap: break-word; resize: none; height: 38px;" disabled="disabled"></textarea></td></tr>');              
				$trLast = $('#document-table').find("tr.taxrow:last");
				// detect if shipping-row exists (for the correct position of taxSubtotalRow)
				var preRow = '';
				if ($(".trShipping").is(":visible")) {
					var preRow = '#document-table .trShipping';
				} else {
					var preRow = '#document-table .trBalance';
				}
				$(preRow).before($newTaxSubtotalRow);
				
				$(".tax-row:last").i18n();	
				txt = $('textarea.tax-row:last').text();
				newTxt = txt + " " + taxPercent + " %";
				colspan();
				$('textarea.tax-row:last').text(newTxt);
				console.log(txt);
			}

		} else {
			return;
		}
	});
});

// remove all TaxSubtotalRows
function delTaxSubtotalRows() {
	$('.taxrow').each(function() {
		$(this).remove();

	});
}


