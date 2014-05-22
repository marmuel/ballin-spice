// Register Angular Translate & Bootstrap UI
var app = angular.module("lexoffice",['pascalprecht.translate', 'ui.bootstrap']);

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
}]).controller('CtrlInvoice', ['$scope', '$translate', '$modal', function($scope, $translate, $modal) {

	$scope.setLang = function(langKey) {
		// You can change the language during runtime
		$translate.use(langKey);
	};

//Invoice Control

	$scope.class = "glyphicon glyphicon-minus";
	$scope.logoRemoved = false;
	$scope.printMode = false;

  var sample_invoice = {
  	        invoice_number: 1000,
              items:[ {qty:10, taxOne: 19.00, taxTwo: 0.00, description:'Tablet', cost:9.95}]};

    if(localStorage["invoice"] == "" || localStorage["invoice"] == null){
  	console.log('Sample Invoice');
    $scope.invoice = sample_invoice;
  }
  else{
  	console.log('Stored Invoice');
    $scope.invoice =  JSON.parse(localStorage["invoice"]);
  }
    $scope.addItem = function() {
        $scope.invoice.items.push({description:"", qty:0, cost:0, taxOne:0, taxTwo:0});    
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
    yes: false,
    no: true
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


	// add discount percent to discount label

	$("#discount").change(function() {
		var percent = $(this).val();
		$('.discount-row').val($('.discount-row').val() + ' ' + percent + ' %');
	});

	$scope.removeItem = function(item) {
		$scope.invoice.items.splice($scope.invoice.items.indexOf(item), 1);
	};

	$scope.invoice_sub_total = function() {
		var total = 0.00;
		angular.forEach($scope.invoice.items, function(item, key) {
			total += (item.qty * item.cost);
		});
		return total;
	};
	    $scope.calculate_tax = function() {
        return (($scope.invoice.taxOne * $scope.invoice_sub_total())/100);
    };
	$scope.calculate_grand_total = function() {
		localStorage["invoice"] = JSON.stringify($scope.invoice);
		return $scope.calculate_tax() + $scope.invoice_sub_total();
	};

	$scope.printInfo = function() {
		window.print();
	};

	$scope.clearLocalStorage = function() {
		var confirmClear = confirm("Are you sure you would like to clear the invoice?");
		if (confirmClear) {
			localStorage["invoice"] = "";
			$scope.invoice = sample_invoice;
		}
	};
	
// Callculate Tax and dynamically add new rows for subtotals

//TODO Check Performance: Actually two approaches to calculate taxes and add dynamically subtotal rows
 
    $scope.grouppedByPercentage = function () {
        var groups = {};
        $scope.invoice.items.forEach(function (invoice) {
            ['taxOne', 'taxTwo'].forEach(function (key) {
                var perc = invoice[key];
                if (perc === '0') { return; }   // ignore 0 percentage

                if (!groups[perc]) {
                    groups[perc] = 0;
                }
                groups[perc] += parseFloat(invoice.amount);
            });
        });
        return groups;
    };

//---------- For alternative approach ----------\\    
    $scope.$watch('invoice', function (newValue, oldValue) {
        $scope.groupsArr = convertToArray($scope.grouppedByPercentage());
    }, true);

    function convertToArray(groups) {
        var arr = [];
        angular.forEach(groups, function (value, key) {
            arr.push({perc: key, sum: value});
        });
        return arr;
    }
	
	
// Modal Dialog 
	
	$scope.open = function (size) {
    var modalInstance = $modal.open({
      templateUrl: 'EmailModalContent.html',
      controller: ModalInstanceCtrl,
      size: size,
      resolve: {
        items: function () {
          return $scope.items;
        }
      }
    });
  };
// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.

var ModalInstanceCtrl = function ($scope, $modalInstance, items) {

  $scope.ok = function () {
    $modalInstance.dismiss('cancel');
    //do some stuff and send email after o.k. 
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};
  
}])



//coma dot converter (custom directive)

.directive("comaDotConverter",function(){
   return {
            require: 'ngModel',
            link: function (scope, element, attrs, modelCtrl) {
              
                modelCtrl.$parsers.push(function(inputValue) {
                    
                    if (typeof (inputValue) == "undefined") return '';
                    var transformedInput = inputValue.replace(/,/g,'.');
                    
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

.directive('jqAnimate', function(){ 
  return function(scope, instanceElement){ 
      setTimeout(function() {instanceElement.show('slow');}, 0); 
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
	$("#invoice_number").focus();
	//set default currency
	$("#currency").val('USD');
	$("#currency").trigger('change');
	$("#logoCompany").change(function() {
		readURL(this);
	});
});

