({
	onInit: function (component, event, helper) {
		helper.createItems(component);
	},

	fireActionGroup: function (component, event, helper) {
		helper.fireActionGroup(component, event, helper);
	},

	onResetToggleActions: function (component, event, helper) {
		const currentAction = null;
		helper.resetToggleActions(component, currentAction)
	}
})