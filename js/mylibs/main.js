
function CtrlInvoice($scope, $http, $window) {

angular.module('lexoffice', ['ui.bootstrap']);


	$scope.class = "glyphicon glyphicon-minus";
	$scope.logoRemoved = false;
	$scope.printMode = false;

  var sample_invoice = {
            taxOne: 19, 
            taxTwo: 0, 
              items:[ {qty:10, description:'Computer', cost:9.95}]};

  if(localStorage["invoice"] == "" || localStorage["invoice"] == null){
    $scope.invoice = sample_invoice;
  }
  else{
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
		return (($scope.invoice.taxOne * $scope.invoice_sub_total()) / 100);
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
}

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
