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
}])
.controller('NewInvoiceCtrl', ['$scope', '$translate', '$modal', '$window', '$filter', '$http', '$timeout', '$locale',
function($scope, $translate, $modal, $window, $filter, $http, $timeout, $locale) {
	
   // load, populate and order Json in country select
   $scope.data = {
    locations: {
      countries: []
    }
  };
  // set default 
  $scope.data.locations.countries.$default = 'United States';
  $scope.data.locations.countries.$resolved = false;
  
  $http.get('l10n/countries.json').success(function(countries) {
    $scope.data.locations.countries.length = 0;
    // actually filter is set to none. to activate choose for e.g. (countries, 'name')
    Array.prototype.push.apply($scope.data.locations.countries, $filter('orderBy')(countries, ''));
    $scope.selectionCountry || ($scope.selectionCountry = $filter('filter')($scope.data.locations.countries, {name: $scope.data.locations.countries.$default})[0]);
    $scope.data.locations.countries.$resolved = true; 
  });
      
   // pre set currency select  
  
  $scope.updateCountry = function() {

  var selCountry=$scope.selectionCountry.currencies[0];
  var selCurrency=document.getElementById('currency').options;
  for(var i=0;i<selCurrency.length;i++) {
    if(selCurrency[i].value.indexOf(selCountry)==0){
      selCurrency[i].selected=true;
    };
    if(document.getElementById('country').value==''){
      selCurrency[0].selected=true;
    };
  };
};

 
	// Set default shipping-button

	$scope.radioShipping = '0';


	
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
   
    // Register Currency Format Inputs and set seperators
    $locale.NUMBER_FORMATS.GROUP_SEP = ",";

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
    link: function(scope, element, attrs) {
      scope.$watch(attrs.focusMe, function(value) {
        if(value === true) { 
          $timeout(function() {
            element[0].focus();
            scope[attrs.focusMe] = false;
          });
        }
      });
    }
  };
})
// Directive Input to Currency Format Source http://jsfiddle.net/KPeBD/78/
.directive('numericInput', function($filter, $browser, $locale) {
    return {
        require: 'ngModel',
        link: function($scope, $element, $attrs, ngModelCtrl) {
            var replaceRegex = new RegExp($locale.NUMBER_FORMATS.GROUP_SEP, 'g');
            var fraction = $attrs.fraction || $locale.NUMBER_FORMATS.PATTERNS[0].maxFrac;
            var listener = function() {
                var value = $element.val().replace(replaceRegex, '');
                $element.val($filter('number')(value, fraction));
            };
            
            // This runs when we update the text field
            ngModelCtrl.$parsers.push(function(viewValue) {
                var newVal = viewValue.replace(replaceRegex, '');
                var newValAsNumber = newVal * 1;
                
                // check if new value is numeric, and set control validity
                if (isNaN(newValAsNumber)){
                    ngModelCtrl.$setValidity(ngModelCtrl.$name+'Numeric', false);
                }
                else{
                    newVal = newValAsNumber.toFixed(fraction);
                    ngModelCtrl.$setValidity(ngModelCtrl.$name+'Numeric', true);
                }
                return newVal;
                
            });
            
            // This runs when the model gets updated on the scope directly and keeps our view in sync
            ngModelCtrl.$render = function() {
                $element.val($filter('number')(ngModelCtrl.$viewValue, fraction));
            };
            
            $element.bind('change', listener);
            $element.bind('keydown', function(event) {
                var key = event.keyCode;
                // If the keys include the CTRL, SHIFT, ALT, or META keys, home, end, or the arrow keys, do nothing.
                // This lets us support copy and paste too
                if (key == 91 || (15 < key && key < 19) || (35 <= key && key <= 40)); 
                    return; 
                //$browser.defer(listener) // Have to do this or changes don't get picked up properly
            });
            
            //$element.bind('paste cut', function() {
//                $browser.defer(listener)  
//            })
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



