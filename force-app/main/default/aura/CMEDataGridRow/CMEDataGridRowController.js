({
	onInit: function (component, event, helper) {
		helper.createCells(component);
	},

	handleRowSelected: function (component, event, helper) {
		helper.handleRowSelected(component, event, helper);
	},

	actionFired: function (component, event, helper) {
		helper.actionFired(component, event, helper);
	},

	onResetToggleActions: function (component, event, helper) {
		const sourceCmp = event.getParam("arguments").sourceCmp;
		const typeMap = component.get("v.typeMap");
		const cells = component.find(typeMap["ActionGroup"].auraid);
		if (cells.map) {
			cells.map(function(c) {
				helper.resetCellToggleActions(c, sourceCmp);
			});
		} else {
			helper.resetCellToggleActions(cells, sourceCmp);
		}
	}

})