({
	init: function (component, event, helper) {
		if (component.get("v.sortBy") && component.get("v.config").PropertyName === component.get("v.sortBy"))
			component.set("v.sorted", true);
	},

	sort: function (component, event, helper) {
		//console.log('cell sort');
		var sortRequest = component.getEvent("sortRequested");
		var sortAsc = component.get("v.sortAsc");
		if (null == sortAsc)
			sortAsc = true;
		else
			sortAsc = !sortAsc;

		sortRequest.setParams({
			SortBy: component.get("v.config").PropertyName,
			SortAsc: sortAsc
		});
		sortRequest.fire();
		component.set("v.sorted", true);
		component.set("v.sortAsc", sortAsc);
	},

	filter: function (component, event, helper) {
		//console.log('cell sort');
		//debugger;
		var filterRequest = component.getEvent("filterRequested");
		var filterValue = event.detail.menuItem.get("v.value");

		filterRequest.setParams({
			column: component.get("v.config").PropertyName,
			value: filterValue
		});
		var filter = component.find("filter");
		filter.set("v.visible", false);
		filter.focus();
		filterRequest.fire();
		component.set("v.isFiltered", filterValue != 'All');
	},

	handleSortChanged: function (component, event, helper) {
		var reqSortBy = component.get("v.sortBy");
		var thisSortBy = component.get("v.config").PropertyName;
		//console.log(reqSortBy + " - " + thisSortBy);
		if (reqSortBy !== thisSortBy)
			component.set("v.sorted", false);
	}

})