({
	filter: function (component, event, helper) {
		//console.log('cell sort');
		//debugger;
		var filterRequest = component.getEvent("filterRequested");
		var fs = event.getSource();
		var filterValue = fs.get("v.value");

		
		var filter = component.get("v.filter");
		if (filterValue !== 'All' && filter.Type === 'Datetime') {
			if (filterValue.map) {
				var fl = [];
				filterValue.map(function(fv) {
					var fo = filter.FilterOptions.filter(function(fo) {
						return fo.value === fv;
					});
					fl.push(fo[0].sortValue);
				});
				filterValue = fl;
			} else {
				var fo = filter.FilterOptions.filter(function(fo) {
					return fo.value === filterValue;
				});
				filterValue = fo[0].sortValue;
			}
		}

		filterRequest.setParams({
			column: fs.get("v.name"),
			value: filterValue
		});
		filterRequest.fire();

		var selectedValues = component.get("v.selectedFilters");
		for(var x=0; x<selectedValues.length; x++) {
			const num = Number(selectedValues[x]);
			if (!Number.isNaN(num)) {
				selectedValues[x] = num;
			}
		}
		component.set("v.selectedFilters", selectedValues);
	}
})