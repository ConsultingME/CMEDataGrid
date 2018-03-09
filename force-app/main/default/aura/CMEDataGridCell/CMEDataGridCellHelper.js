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

	fireActionGroup: function (component, event, helper) {
		var actionName = event.getSource ? event.getSource().get("v.value") : event.srcElement.value;
		this.fireAction(component, event, helper, actionName);
	},

	fireActionText: function (component, event, helper) {
		this.fireAction(component, event, helper, component.get("v.data").config.ActionName);
	},

	fireActionMenu: function (component, event, helper) {
		this.fireAction(component, event, helper, event.getParam("value"));
	},

	fireAction: function (component, event, helper, actionName) {
		var evt = component.getEvent("ActionFired");
		//component.get("v.data").config.ActionName
		evt.setParams({
			Action: actionName
		});
		evt.fire();
	},

	updateSelectedValue: function (component, value) {
		
		
	},

	navigateToSObject: function(component) {
		const recordId = component.get("v.data").value.RecordId;
		if ($A.util.isEmpty(recordId) != true) {
			var navEvt = $A.get("e.force:navigateToSObject");
			navEvt.setParams({
				recordId: recordId
			});
			navEvt.fire();
		}
	}
})