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



$(".unitprice input").on("change", function() {
	
	// replace comma with dot if user inputs comma
	
	$(".unitprice input").each(function() {
    $(this).val($(this).val().replace(/,/g, "."));
  });

});
