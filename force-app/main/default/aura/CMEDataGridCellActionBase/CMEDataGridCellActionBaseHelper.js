({
	fireAction: function (component, event, helper, actionName) {
		var evt = component.getEvent("ActionFired");
		evt.setParams({
			Action: actionName
		});
		evt.fire();
	}
})