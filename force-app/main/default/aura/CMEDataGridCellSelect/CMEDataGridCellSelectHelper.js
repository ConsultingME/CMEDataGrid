({
	handleSelectClicked: function (component, event, helper) {
		//console.log('row selected');
		//console.log(component.get("v.data"));
		var evt = component.getEvent("rowSelected");
		evt.setParams({
			SelectedRow: component.get("v.data")
		});
		evt.fire();
	},
})
