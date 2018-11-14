({
	createItems: function(component) {
		const data = component.get("v.data");
		const al = data.config.ActionList;
		var actionCmps = [];
		const fireActionGroup = component.getReference("c.fireActionGroup");
		for(let x=0; x<al.length; x++) {
			const action = al[x];
			var attributes = {};
			attributes.value =  action.Name; 
			attributes.onclick =  fireActionGroup;
			attributes.class = "slds-button " + action.ButtonClass;
			attributes.iconName =  action.IconName;
			attributes.variant = action.Variant;
			attributes.alternativeText = action.AlternativeText;
			attributes.size = action.Size;
			attributes.disabled = action.Validation.Disabled;
			attributes.title = action.Title + (action.Validation.Disabled ? ": " + action.Validation.Message : '');

			if(!$A.util.isEmpty(action.IconName)) {
				var btnCmp = "lightning:buttonIconStateful";
				if (action.Type && action.Type === "Stateful") {
						attributes["aura:id"] = "btnStateful";
				} else {
					btnCmp = "lightning:buttonIcon";
				}
				actionCmps.push([btnCmp, attributes]);
			} else {
				actionCmps.push(["aura:html", {
					tag: "button", 
					body: action.Label, 
					HTMLAttributes: {
						value: action.Name, 
						onclick: fireActionGroup, 
						class: "slds-button slds-button--neutral " + action.ButtonClass, 
						disabled: action.Disabled
					}
				}]);
			}
		}
		$A.createComponents(actionCmps, function(cmps, status, errors) {
			component.set("v.actionList", cmps);
		});
	},

	fireActionGroup: function (component, event, helper) {
		var actionName;
		if (event.getSource) {
			var btn = event.getSource();
			actionName = btn.get("v.value");

			var selected = btn.get("v.selected")
			if (undefined != selected) {
				btn.set("v.selected", !selected);
			}
			if (btn.isInstanceOf("lightning:buttonIconStateful")) {
				helper.resetToggleActions(component, actionName);
			}
		} else {
			actionName = event.srcElement.value;
		}
		this.fireAction(component, event, helper, actionName);
	},

	resetToggleActions: function (component, currentAction) {
		const btnList = component.find('btnStateful');
		if (!$A.util.isEmpty(btnList)) {
			const callback = function(b) {
				if (currentAction == null || b.get("v.value") != currentAction) {
					b.set("v.selected", false);
				}
			}
			if (btnList.map) {
				btnList.map(callback);
			} else {
				callback(btnList);
			}
		}
	}
})