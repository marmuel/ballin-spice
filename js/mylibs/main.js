// Register Angular Translate & Bootstrap UI
var app = angular.module("lexoffice", ['pascalprecht.translate', 'ui.bootstrap', 'App.filters', ]);

//Translation
app.config(['$translateProvider',
function($translateProvider) {

	// Register a loader for the static files
	// So, the module will search missing translation tables under the specified urls.
	// Those urls are [prefix][langKey][suffix].
	$translateProvider.useStaticFilesLoader({
		prefix : 'l10n/',
		suffix : '.json'
	});

	// Tell the module what language to use by default
	$translateProvider.preferredLanguage('en_US');

	//START THE MAIN CONTROLLER
}]).controller('CtrlInvoice', ['$scope', '$translate', '$modal', '$window', '$filter', '$http',
function($scope, $translate, $modal, $window, $filter, $http) {

	$scope.setLang = function(langKey) {
		// You can change the language during runtime
		$translate.use(langKey);
	};

	//Invoice Control

	$scope.class = "glyphicon glyphicon-minus";
	$scope.logoRemoved = false;
	$scope.printMode = false;

	var sample_invoice = {
		invoice_number : 1000,
		discount : 0,
		shippingcosts : 0.00,
		items : [{
			qty : 10,
			taxOne : '',
			taxTwo : '',
			description : 'Tablet',
			cost : 99.95
		}],
		type: '',
		tocompany: '',
		toaddress: '',
		fromaddress:'',
		terms: '',
		notes:'',
		footer_left: '',
		footer_middle: '',
		footer_right: ''
	};

    var default_logo = "img/logo.jpg";

	if (localStorage["invoice"] == "" || localStorage["invoice"] == null) {
		console.log('Sample Invoice');
		$scope.invoice = sample_invoice;
	} else {
		console.log('Stored Invoice');
		$scope.invoice = JSON.parse(localStorage["invoice"]);
	}
	
	if (localStorage["logo"]) {
     $scope.logo = localStorage["logo"];
   } else {
     $scope.logo = default_logo;
   }
   
   
	$scope.addItem = function() {
		$scope.invoice.items.push({
			description : "",
			qty : 0,
			cost : 0,
			taxOne : '',
			taxTwo : ''
		});
	};



	$scope.removeLogo = function(element) {

		if ($scope.class === "glyphicon glyphicon-plus") {
			$scope.class = "glyphicon glyphicon-minus";
			$scope.logoRemoved = false;
		} else {
			$scope.class = "glyphicon glyphicon-plus";
			$scope.logoRemoved = true;
		}
           localStorage["logo"] = "";
	};

	$scope.editLogo = function() {
		$("#logoCompany").trigger("click");
	};

	$scope.showLogo = function() {
		$scope.logoRemoved = false;
	};

		
	// remove Row
	$scope.removeItem = function(item) {
		$scope.invoice.items.splice($scope.invoice.items.indexOf(item), 1);
	};


	// Callculate Tax and dynamically add new rows for subtotals

	$scope.grouppedByPercentage = function() {
		var groups = {};
		var discount = 0;
		var discount = $scope.invoice.discount;

		$scope.invoice.items.forEach(function(invoice) {
			['taxOne', 'taxTwo'].forEach(function(key) {
				var perc = invoice[key];
				if (perc === '0' || perc === "") {
					return;
				}// ignore 0 percentage

				if (!groups[perc]) {
					groups[perc] = 0;
				}
               
				groups[perc] += ((invoice.cost * invoice.qty) * (100 - discount)) / 100;
			});
		});

		return groups;

	};

	$scope.$watch('invoice', function(newValue, oldValue) {
		// Save in localstorage
		localStorage["invoice"] = JSON.stringify($scope.invoice);
		// Arr for multiple Taxes
		$scope.groupsArr = convertToArray($scope.grouppedByPercentage());

		// Taxes
		// pass the arr trough filter 'sumFilter'
		// Calculations (Taxes are calculated directly in the view)
		var taxTotal = $filter('sumFilter')($scope.groupsArr);

		// SubTotal
		$scope.invoice_sub_total = function() {
			var total = 0.00;
			angular.forEach($scope.invoice.items, function(item, key) {
				total += (item.qty * item.cost);
			});
			return total;
		};
		// Discount

		$scope.invoice_discount = function() {
			disCount = $scope.invoice.discount;
			return (($scope.invoice_sub_total() * disCount) / 100);
		};

		// Grand Total
		$scope.calculate_grand_total = function() {
			// Shipping
			shipPing = +$scope.invoice.shippingcosts;
			return $scope.invoice_sub_total() - $scope.invoice_discount() + shipPing + taxTotal;
		};

	}, true);

	function convertToArray(groups) {
		var arr = [];
		angular.forEach(groups, function(value, key) {
			arr.push({
				perc : key,
				sum : value
			});
		});
		return arr;
	}


	$scope.printInfo = function() {
		window.print();
	};

	// Modal Dialog Email

	$scope.openModalEmail = function(size) {
		var modalInstance = $modal.open({
			templateUrl : 'EmailModalContent.html',
			controller : ModalInstanceCtrl,
			size : size,
			resolve : {
				items : function() {
					return $scope.items;
				}
			}
		});
	};
	// Modal Dialog Reset

	$scope.openModalReset = function(size) {
		var modalInstance = $modal.open({
			templateUrl : 'ResetModalContent.html',
			controller : ModalInstanceCtrl,
			size : size,
			resolve : {
				items : function() {
					return $scope.items;
				}
			}
		});
	};

	// Please note that $modalInstance represents a modal window (instance) dependency.
	// It is not the same as the $modal service used above.

	var ModalInstanceCtrl = function($scope, $modalInstance, items) {
		// Email
		$scope.ok = function() {
			$modalInstance.dismiss('cancel');
			//do some stuff and send email after o.k.
		};

		$scope.cancel = function() {
			$modalInstance.dismiss('cancel');
		};

		$scope.resetStorage = function() {
			$modalInstance.dismiss('cancel');
			localStorage["invoice"] = "";
			localStorage["logo"] = "";
			console.log('localStorage cleared');
			$scope.invoice = sample_invoice;
			$window.location.reload();

		};
	};
}])

//coma dot converter (custom directive)

.directive("comaDotConverter", function() {
	return {
		require : 'ngModel',
		link : function(scope, element, attrs, modelCtrl) {

			modelCtrl.$parsers.push(function(inputValue) {

				if ( typeof (inputValue) == "undefined")
					return '';
				var transformedInput = inputValue.replace(/,/g, '.');

				if (transformedInput != inputValue) {
					modelCtrl.$setViewValue(transformedInput);
					modelCtrl.$render();
				}

				return transformedInput;
			});
		}
	};

})
// Animation for e.g. Row add / delete

.directive('jqAnimate', function() {
	return function(scope, instanceElement) {
		setTimeout(function() {
			instanceElement.show('slow');
		}, 0);
	};
});
// ACHTUNG WENN EINE WEITERE DIREKTIVE HINZUKOMMT ; semicolon ENTFERNEN!!!!!

// Tax Sum

angular.module('App.filters', []).filter('sumFilter', [
function() {
	// filter for tax sum
	return function(groups, lenght) {
		var taxTotal = 0;
		for ( i = 0; i < groups.length; i++) {
			taxTotal = taxTotal + ((groups[i].perc * groups[i].sum) / 100);
		};
		return taxTotal;
	};
}]);

function readURL(input) {
	console.log(input);
	if (input.files && input.files[0]) {
		var reader = new FileReader();
		reader.onload = function(e) {
			$('#company_logo').attr('src', e.target.result);
			localStorage["logo"] = e.target.result;
		};
		reader.readAsDataURL(input.files[0]);
	}
}

// jQUERY

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


// set colspan for footer labels and subtotals, depending on no. of tax columns
$('#document-table').change(function() {
	colspan();
});	
$('#discount').change(function() {
	colspan();
});
$('#tax').change(function() {
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

function dropboxupload() {
	Dropbox.choose(options);
    };
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