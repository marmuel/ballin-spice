
function InvoiceController($scope, $window) {
	
	$window.alert('Hello');

  $scope.logoRemoved = false;
  $scope.printMode = false;

 

  if(localStorage["invoice"] == "" || localStorage["invoice"] == null){
    $scope.invoice = sample_invoice;
  }
  else{
    $scope.invoice =  JSON.parse(localStorage["invoice"]);
  }
    $scope.addItem = function() {
        $scope.invoice.items.push({qty:0, cost:0, description:""});    
    }
    $scope.removeLogo = function(element) {
        var elem = angular.element("#remove_logo");
        if(elem.text() == "Show Logo"){
          elem.text("Remove Logo");
          $scope.logoRemoved = false;
        }
        else{
          elem.text("Show Logo");
          $scope.logoRemoved = true;
        }

    }

    $scope.editLogo = function(){
      $("#imgInp").trigger("click");
    }

    $scope.showLogo = function() {
        $scope.logoRemoved = false;
    }
    $scope.removeItem = function(item) {
        $scope.invoice.items.splice($scope.invoice.items.indexOf(item), 1);    
    }
    
    $scope.invoice_sub_total = function() {
        var total = 0.00;
        angular.forEach($scope.invoice.items, function(item, key){
          total += (item.qty * item.cost);
        });
        return total;
    }
    $scope.calculate_tax = function() {
        return (($scope.invoice.tax * $scope.invoice_sub_total())/100);
    }
    $scope.calculate_grand_total = function() {
        localStorage["invoice"] = JSON.stringify($scope.invoice);
        return $scope.calculate_tax() + $scope.invoice_sub_total();
    } 

    $scope.printInfo = function() {
      window.print();
    }

    $scope.clearLocalStorage = function(){
      var confirmClear = confirm("Are you sure you would like to clear the invoice?");
      if(confirmClear){
        localStorage["invoice"] = "";
        $scope.invoice = sample_invoice;
      }
    }


};

angular.module('lexoffice', []).directive('jqAnimate', function(){ 
  return function(scope, instanceElement){ 
      setTimeout(function() {instanceElement.show('slow');}, 0); 
  } 
});

function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            $('#company_logo').attr('src', e.target.result);
        }
        reader.readAsDataURL(input.files[0]);
    }
}

// window.onbeforeunload = function(e) {
//   confirm('Are you sure you would like to close this tab? All your data will be lost');
// };

$(document).ready(function(){
  $("#invoice_number").focus();
  $("#imgInp").change(function(){
    readURL(this);
  });
});