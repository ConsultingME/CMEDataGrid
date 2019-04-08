({
    onInit: function(component, event, helper) {
		const data = component.get("v.data");
		const val = (data.value) ? data.value : false;
		var iconName = data.config.TrueIcon;
		if (val !== true) {
			iconName = data.config.FalseIcon;
		}
		component.set("v.altText", data.config.AlternativeText);
		component.set("v.class", data.config.ButtonClass);
		component.set("v.iconName", iconName);
		component.set("v.size", data.config.Size);
		component.set("v.title", data.config.Title);
		component.set("v.variant", data.config.Variant);
    }
})