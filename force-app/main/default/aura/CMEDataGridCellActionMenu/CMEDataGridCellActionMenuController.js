({
	onActionMenuSelected: function (component, event, helper) {
		helper.fireAction(component, event, helper, event.getParam("value"));
	}
})