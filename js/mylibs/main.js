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
}]).controller('CtrlInvoice', ['$scope', '$translate', '$modal', '$window', '$filter', '$http', '$timeout',
function($scope, $translate, $modal, $window, $filter, $http, $timeout) {

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



