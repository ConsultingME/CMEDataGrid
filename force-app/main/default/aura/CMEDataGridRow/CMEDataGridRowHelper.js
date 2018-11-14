({
	handleRowSelected: function (component, event, helper) {
		//console.log("row component handle selected");
		//component.set("v.selected", !component.get("v.selected"));
		var tr = component.find("tablerow");
		//console.log(tr.getElement().outerHTML);
		$A.util.toggleClass(tr, "canthisreallyjustbeanything"); 
		//console.log(tr.getElement().outerHTML);
	},

	actionFired: function (component, event, helper) {
		event.setParam("SelectedRow", component.get("v.data").datarow);
	},

	createCells: function(component) {
		var cells = [];
		const data = component.get("v.data");
		const typeMap = component.get("v.typeMap");

		if (component.get("v.selectAll") === true) {
			const attr = this.getCellAttributes(component, component.getReference("v.data"));
			attr.showNotSelectableIcon = component.getReference("v.showNotSelectableIcon");
			cells.push(["c:CMEDataGridCellSelect", attr]);
		}

		for (let x=0; x<data.cmeoutputlist.length; x++) {
			if (data.cmeoutputlist[x].visible === true) {
				let config = typeMap[data.cmeoutputlist[x].config.Type];
				if ($A.util.isEmpty(config)) {
					config = typeMap["default"];
				}
				let attributes = this.getCellAttributes(component, data.cmeoutputlist[x], config.auraid);
				cells.push([config.cmp, attributes]);
			}
		}

		$A.createComponents(cells, function(comp, status, errorMessage) {
			component.set("v.cells", comp);
		});
	},

	getCellAttributes: function(component, data, auraid) {
		var attr = {selectAll: true, data: data, isSFOne: component.getReference("v.isSFOne")};
		if (auraid) {
			attr["aura:id"] = auraid;
		}
		return attr;
	},

	resetCellToggleActions: function(cmp, sourceCmp) {
		if (cmp.getGlobalId() != sourceCmp) {
			cmp.resetToggleActions();
		}
	}
})