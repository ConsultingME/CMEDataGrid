({
	handleRowSelected: function (component, event, helper) {
		//console.log("row component handle selected");
		//component.set("v.selected", !component.get("v.selected"));
		var tr = component.find("tablerow");
		//console.log(tr.getElement().outerHTML);
		$A.util.toggleClass(tr, "canthisreallyjustbeanything"); 
		//console.log(tr.getElement().outerHTML);
	},

	actionFired: function (component, event, helper) {
		event.setParam("SelectedRow", component.get("v.data").datarow);
	}
})