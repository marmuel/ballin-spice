// Register Angular Translate & Bootstrap UI
var app = angular.module("lexoffice", ['pascalprecht.translate', 'ui.bootstrap']);

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
}]).controller('CtrlInvoice', ['$scope', '$translate', '$modal', '$window',
function($scope, $translate, $modal, $window) {

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
		items : [{
			qty : 10,
			taxOne : '',
			taxTwo : '',
			description : 'Tablet',
			cost : 99.95
		}]
	};

	if (localStorage["lexoffice"] == "" || localStorage["lexoffice"] == null) {
		console.log('Sample Invoice');
		$scope.invoice = sample_invoice;
	} else {
		console.log('Stored Invoice');
		$scope.invoice = JSON.parse(localStorage["lexoffice"]);
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

	};

	$scope.editLogo = function() {
		$("#logoCompany").trigger("click");
	};

	$scope.showLogo = function() {
		$scope.logoRemoved = false;
	};

	//show and hide shipping costs //

	// set default to no

	$scope.radioModel = 'No';
	$scope.checkModel = {
		yes : false,
		no : true
	};

	$scope.shipping = {
		fields : [{
			shippingcosts : 0.00,
			isRowHidden : true
		}]

	};

	$scope.hideShippingCosts = function(field) {
		field.shippingcosts = 0.00;
		field.isRowHidden = true;
	};
	$scope.showShippingCosts = function(field) {
		field.shippingcosts = 0.00;
		field.isRowHidden = false;
	};

	$scope.removeItem = function(item) {
		$scope.invoice.items.splice($scope.invoice.items.indexOf(item), 1);
	};

	// Callculate Tax and dynamically add new rows for subtotals

	$scope.grouppedByPercentage = function() {
		var groups = {};
		$scope.invoice.items.forEach(function(invoice) {
			['taxOne', 'taxTwo'].forEach(function(key) {
				var perc = invoice[key];
				if (perc === '0' || perc === "") {
					return;
				}// ignore 0 percentage

				if (!groups[perc]) {
					groups[perc] = 0;
				}

				groups[perc] += invoice.cost * invoice.qty;
			});
		});
		return groups;
	};

	//---------- For alternative approach ----------\\
	$scope.$watch('invoice', function(newValue, oldValue) {
		// Arr for multiple Taxes
		$scope.groupsArr = convertToArray($scope.grouppedByPercentage());

		// Calculations (Taxes are calculated directly in the view)

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
			if (disCount == '' || disCount == 'NaN') {
				return;
			} else {
				return (($scope.invoice_sub_total() * disCount) / 100);
			}
		};

		// Grand Total / Balance
		$scope.calculate_grand_total = function() {
			localStorage["lexoffice"] = JSON.stringify($scope.invoice);
			//var disCount = parseFloat($scope.discount);
			disCount = $scope.invoice.discount;
			// check if discount-input is empty
			if (disCount === '' || disCount == '0') {
				console.log('kein Discount');
				return $scope.invoice_sub_total();
			} else {
				console.log('mit Discount');
				return $scope.invoice_sub_total() - (($scope.invoice_sub_total() * disCount) / 100);
				
			}

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

			localStorage["lexoffice"] = "";
			$scope.invoice = sample_invoice;

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

function readURL(input) {
	if (input.files && input.files[0]) {
		var reader = new FileReader();
		reader.onload = function(e) {
			$('#company_logo').attr('src', e.target.result);
		};
		reader.readAsDataURL(input.files[0]);
	}
}

// window.onbeforeunload = function(e) {
//   confirm('Are you sure you would like to close this tab? All your data will be lost');
// };

$(document).ready(function() {
	//set default currency
	$("#currency").val('USD');

	$("#currency").trigger('change');
	$("#logoCompany").change(function() {
		readURL(this);
	});
});

