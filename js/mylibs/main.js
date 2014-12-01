// Register Angular Translate & Bootstrap UI
var app = angular.module("lexoffice", ['pascalprecht.translate', 'ui.bootstrap', 'App.filters', 'tmh.dynamicLocale']);

//Translation
app.config(['$translateProvider',
function($translateProvider) {
	// Register a loader for the static files
	// So, the module will search missing translation tables under the specified urls.
	// Those urls are [prefix][langKey][suffix].
	$translateProvider.useStaticFilesLoader({
		prefix : 'i18n/',
		suffix : '.json'
	});

	// Get stored default language or tell the module what language to use by default

	if (localStorage["language"] == "" || localStorage["language"] == null) {
		var locale = 'en_US';
		console.log('Default Language');
		$translateProvider.preferredLanguage(locale);
	} else {
		console.log('Stored Language');
		storedLocale = JSON.parse(localStorage["language"]);
		$translateProvider.preferredLanguage(storedLocale);
	}

	//START THE MAIN CONTROLLER
}]).controller('NewInvoiceCtrl', ['$scope', '$translate', '$modal', '$window', '$filter', '$http', '$timeout', '$locale', 'tmhDynamicLocale',
function($scope, $translate, $modal, $window, $filter, $http, $timeout, $locale, tmhDynamicLocale) {
	// populate Language Dropdown

	// language setting
	$scope.setLang = function(langKey) {
		// store language local
		localStorage["language"] = JSON.stringify(langKey);
		// set language
		$translate.use(langKey);
	};

	// load, populate and order Json in country select
	$scope.data = {
		locations : {
			countries : []
		}
	};
	// SET DEFAULTS
	// Set default shipping-button
	$scope.radioShipping = '0';

	// set default Country
	$scope.data.locations.countries.$default = 'United States';
	$scope.data.locations.countries.$resolved = false;

	// set default locale to USA
	// for more informations: https://github.com/lgalfaso/angular-dynamic-locale
	tmhDynamicLocale.set('en-us');

	// Populate countries.json in Country Select
	$http.get('i18n/countries.json').success(function(countries) {
		$scope.data.locations.countries.length = 0;
		// actually filter is set to none. to activate choose for e.g. (countries, 'name')
		Array.prototype.push.apply($scope.data.locations.countries, $filter('orderBy')(countries, ''));
		$scope.selectionCountry || ($scope.selectionCountry = $filter('filter')($scope.data.locations.countries, {name: $scope.data.locations.countries.$default})[0]);
		$scope.data.locations.countries.$resolved = true;
		//console.log($scope.data.locations.countries);
	});

	// pre set currency select
	$scope.updateCountry = function(item) {

		// get locale from the country select / countries.json
		var selLocale = $scope.selectionCountry.i18n;
		// set locale
		// for more informations: https://github.com/lgalfaso/angular-dynamic-locale
		tmhDynamicLocale.set(selLocale);
		console.log('changed locale to: ', selLocale);

		var selCountry = $scope.selectionCountry.currencies;
		var selCurrency = document.getElementById('currency').options;
		for (var i = 0; i < selCurrency.length; i++) {
			if (selCurrency[i].value.indexOf(selCountry) == 0) {
				selCurrency[i].selected = true;
			};
			if (document.getElementById('country-select').value == '') {
				selCurrency[0].selected = true;
			};
		};
		// TODO Update Currency Format Inputs Unit Price
		//  var priceControl = $scope.invoice.items;
		//  var uCost = $scope.invoice.items['cost'];
		//   for(var i=0;i<priceControl.length;i++) {
		//   	var uCost = 0;
		//   	var uCost = $scope.invoice.items[i].cost;
		//   	$scope.invoice.items[i].cost = ($filter('currency' )($scope.invoice.items[i].cost, ''));
		//    console.log(($filter('currency' )($scope.invoice.items[i].cost, '')));
		//    };
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
			cost : 599.95
		}],
		type : '',
		tocompany : '',
		toaddress : '',
		fromaddress : '',
		terms : '',
		notes : '',
		footer_left : '',
		footer_middle : '',
		footer_right : ''
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

	// font management

	$scope.fonts = [{
		id : '0',
		value : 'Arial',
		label : 'Arial'
	}, {
		id : '1',
		value : 'Tahoma',
		label : 'Tahoma'
	}, {
		id : '2',
		value : 'Times New Roman',
		label : 'Times New Roman'
	}, {
		id : '3',
		value : 'Verdana',
		label : 'Verdana'
	}, {
		id : '4',
		value : 'Impact',
		label : 'Impact'
	}, {
		id : '5',
		value : 'Comic Sans MS',
		label : 'Comic Sans MS'
	}];
	//$scope.font = $scope.fonts[0]; // Arial hidden select
	$scope.OnItemClick = function(font) {// set hidden select
		$scope.font = font;
		// Save in localstorage
		//console.log($scope.font);
		localStorage["font"] = JSON.stringify(font);
		localStorage.setItem('font', JSON.stringify(font));

	};

	// get font from localstorage

	if ((localStorage.getItem('font')) == '' || (localStorage.getItem('font')) == null) {
		var storedFont = localStorage.getItem('font');
		$scope.font = $scope.fonts[1];
	} else {
		var storedFont = localStorage.getItem('font');
		var storedFontId = JSON.parse(storedFont).id;
		$scope.font = $scope.fonts[storedFontId];
	}

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
			shipPing = +$scope.radioShipping;
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

	// Clear Taxes in Column depending on select #tax

	$scope.resetTaxes = function() {

		var taxSelect = $scope.taxOption;

		if (taxSelect === '2') {
			var tItems = $scope.invoice.items;
			angular.forEach(tItems, function(item) {
				item.taxTwo = "";
			});
		};
		if (taxSelect === '1') {
			var tItems = $scope.invoice.items;
			angular.forEach(tItems, function(item) {
				item.taxTwo = "";
			});

			var tItems = $scope.invoice.items;
			angular.forEach(tItems, function(item) {
				item.taxOne = "";
			});
		};

	};
	
	// Date Picker
	
	$scope.today = function() {
    $scope.dt = new Date();
    $scope.duedt = new Date();
  };
  $scope.today();

  $scope.showWeeks = true;
  $scope.toggleWeeks = function () {
    $scope.showWeeks = ! $scope.showWeeks;
  };

  $scope.clear = function () {
    $scope.dt = null;
  };

  $scope.toggleMin = function() {
    $scope.minDate = ( $scope.minDate ) ? null : new Date();
  };
  $scope.toggleMin();

  $scope.open = function() {
    $timeout(function() {
    alert('invdate');	
      $scope.opened = true;
    });
  };
    $scope.opendue = function() {
    $timeout(function() {
    alert('duedate');	
      $scope.dueopened = true;
    });
  };

  $scope.dateOptions = {
    'year-format': "'yy'",
    'starting-day': 1
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
	
	// get Design from localstorage or default values

	if ((localStorage.getItem('design')) == '' || (localStorage.getItem('design')) == null) {
		var storedDesign = localStorage.getItem('design');
		console.log('no storedDesign, set to theme-1 border-2');
		$scope.selectedTheme = 'theme-1 border-2';
	} else {
		var storedDesign = localStorage.getItem("design");
		console.log('yes storedDesign!' + storedDesign);
		$scope.selectedTheme = eval(storedDesign);
	}


	// Modal Dialog Theme
	$scope.openModalTheme = function(size) {
		var modalInstance = $modal.open({
			templateUrl : 'ThemeModalContent.html',
			controller : ModalInstanceCtrl,
			size : size,
			resolve : {
				items : function() {
					return $scope.items;
				}
			}
		});
		modalInstance.result.then(function(selectedItem) {
			
			$scope.selectedTheme = selectedItem;
			$scope.selectedBorder = selectedItem;
		});
	};

	// Please note that $modalInstance represents a modal window (instance) dependency.
	// It is not the same as the $modal service used above.

	var ModalInstanceCtrl = function($scope, $modalInstance, items) {
		$scope.selectedTheme = {
			theme : 'theme-1'
		};
		$scope.selectedBorder = {
			border : 'border-1'
		};
		

		$scope.selectDesign = function() {	
				var t = $scope.selectedTheme.theme;
				var b = $scope.selectedBorder.border;
				d = t + ' ' + b;
						
		// Save in localstorage
		var design = d;
		console.log($scope.selectedTheme.theme);
		localStorage["design"] = JSON.stringify(design);
		localStorage.setItem('design', JSON.stringify(design));
			
			$modalInstance.close(
				
				$scope.selectedTheme.theme = d
			);					
		};

		$scope.cancel = function() {
			$modalInstance.dismiss('cancel');
		};

		// Email
		$scope.resetStorage = function() {
			$modalInstance.dismiss('cancel');
			localStorage["invoice"] = "";
			localStorage["logo"] = "";
			localStorage["font"] = "";
			localStorage["design"] = "";
			console.log('localStorage cleared');
			$scope.invoice = sample_invoice;
			$window.location.reload();
		};
		$scope.selectTheme = function() {
			changeTheme();
			$modalInstance.dismiss('cancel');
		};
	};
	$scope.printInfo = function() {
		window.print();
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
})
// Set Focus on Inputs for e.g. Google Address Search

.directive('focusMe', function($timeout) {
	return {
		link : function(scope, element, attrs) {
			scope.$watch(attrs.focusMe, function(value) {
				if (value === true) {
					$timeout(function() {
						element[0].focus();
						scope[attrs.focusMe] = false;
					});
				}
			});
		}
	};
})
// Format Inputs to Currency Format

.directive('blurToCurrency', function($filter) {
	return {
		scope : {
			amount : '='
		},
		link : function(scope, el, attrs) {
			el.val($filter('currency' )(scope.amount, ''));

			el.bind('focus', function() {
				el.val(scope.amount);
			});

			el.bind('input', function() {
				scope.amount = el.val();
				scope.$apply();
			});

			el.bind('blur', function() {
				el.val($filter('currency')(scope.amount, ''));
			});
		}
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

