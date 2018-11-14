({
	fireActionText: function (component, event, helper) {
		helper.fireAction(component, event, helper, component.get("v.data").config.ActionName);
	}
})