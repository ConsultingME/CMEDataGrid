({
    validateApproved : function(datarow) {
		var result = {Disabled: false, Message: null};
		if (datarow.TotalPrice > 100) {
			result.Disabled = true;
			result.Message = "Opps over $100 must be approved some other way.";
		}
		return result;
    }
})