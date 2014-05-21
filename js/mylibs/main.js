var app = angular.module("lexoffice",['pascalprecht.translate']);
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
}]).controller('CtrlInvoice', ['$scope', '$translate', function($scope, $translate) {

	$scope.setLang = function(langKey) {
		// You can change the language during runtime
		$translate.use(langKey);
	};

//Register Bootstrap UI for Angular (Actually not in use)

angular.module('lexoffice', ['ui.bootstrap']);


//Invoice Control

	$scope.class = "glyphicon glyphicon-minus";
	$scope.logoRemoved = false;
	$scope.printMode = false;

  var sample_invoice = {
  	        invoice_number: 1000,
            taxOne: 19.00, 
            taxTwo: 0.00, 
              items:[ {qty:10, description:'Tablet', cost:9.95}]};

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
})



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

