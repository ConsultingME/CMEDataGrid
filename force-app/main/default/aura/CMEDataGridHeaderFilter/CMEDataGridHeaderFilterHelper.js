({
	filter: function (component, event, helper) {
		//console.log('cell sort');
		//debugger;
		var filterRequest = component.getEvent("filterRequested");
		var fs = event.getSource();

		filterRequest.setParams({
			column: fs.get("v.name"),
			value: fs.get("v.value")
		});
		filterRequest.fire();
	}
})