({
    onInit: function(component, event, helper) {
		const data = component.get("v.data");
		const val = (data.value) ? data.value : false;
		var config = data.config.TrueIcon;
		if (val !== true) {
			config = data.config.FalseIcon;
		}
		component.set("v.altText", config.AlternativeText);
		component.set("v.class", config.ButtonClass);
		component.set("v.iconName", config.IconName);
		component.set("v.size", config.Size);
		component.set("v.title", config.Title);
		component.set("v.variant", config.Variant);
    }
})