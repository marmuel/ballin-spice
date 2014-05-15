// format Address Google Address Autofill and merge Inputs document-inputs-googlesearch of Google Search Result to one Textarea
function Country() {
	var gStreetNo = $('textarea#street_number').val();
	var gStreet = $('textarea#route').val();
	var gCity = $('textarea#locality').val();
	var gArea1 = $('textarea#administrative_area_level_1').val();
	var gZip = $('textarea#postal_code').val();
	var gCountry = $('textarea#country').val();
	// USA Format
	if (gCountry == "Deutschland") {

		$("#document-to").val(gStreet + " " + gStreetNo + "\n" + gZip + " " + gCity);
	} else {
		// others for e.g. Germany
		$("#document-to").val(gStreetNo + " " + gStreet + "\n" + gCity + "\n" + gArea1 + " " + gZip + "\n" + gCountry);
	}
}

// calculation USA

$("#document-table tbody input, #discount, #tax, .shipping-total").on("change", function() {
	
	// replace comma with dot if user inputs comma
	
	$("#document-table tbody input, #discount, #tax, .shipping-total").each(function() {
    $(this).val($(this).val().replace(/,/g, "."));
  });

	// calculate rows
	$('#document-table tbody tr').each(function() {
		var quantity = $(this).find('input.quantity').val();
		var unitprice = $(this).find('input.unitprice').val();
		var amountTotal = (quantity * unitprice);
		$(this).find('input.grossprice').val(amountTotal);
		$('input.grossprice').val(amountTotal.toFixed(2));
	});
	//END .each

	// calculate subtotals

	var subTotal = 0;
	var amountRows = $(".grossprice");
	$.each(amountRows, function(number) {
		subTotal += parseInt($(this).val());
	});

	$('input.sub-total').val(subTotal.toFixed(2));

	// calculate discount

	var discount = 0;
	var percentage = $('#discount').val();

	var discount = subTotal * (percentage / 100);
	$('input.discount-total').val(-discount.toFixed(2));

	// get shipping costs
	var shippingcosts = $('.shipping-total').val();

	// calculate balance
	var balance = 0;

	balance = Number(subTotal) + Number(-discount) + Number(shippingcosts);

	//$('input.balance').val(balance);
	
	$('input.balance').val(balance.toFixed(2));

	return false;
});
