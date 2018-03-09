({
	handleSelectClicked: function (component, event, helper) {
		helper.handleSelectClicked(component, event, helper);
	},

	fireActionGroup: function (component, event, helper) {
		helper.fireActionGroup(component, event, helper);
	},

	fireActionText: function (component, event, helper) {
		helper.fireActionText(component, event, helper);
	},

	onActionMenuSelected: function (component, event, helper) {
		helper.fireActionMenu(component, event, helper);
	},

	onSelectChange: function (component, event, helper) {
		var v = component.find("theSelect");
		helper.updateSelectedValue(component, v.get("v.value"));
	},

	onSObjectLinkClick: function (component, event, helper) {
		const data = component.get("v.data");
		if (data.config.Format && data.config.Format.Disabled && data.config.Format.Disabled === true)
			return;

		helper.navigateToSObject(component);
	}
})