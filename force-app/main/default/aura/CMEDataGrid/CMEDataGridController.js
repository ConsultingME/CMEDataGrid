({
	onInit: function (component, event, helper) {
		helper.detectContainer(component);
	},

	handleSortRequest: function (component, event, helper) {
		//console.log('container controller handlesort');
		helper.toggleFilterSpinner(component, component.get("v.spinnerId"), true);
		//using setTimeout here to allow Lightning to complete a rendering cycle
		//which displays the spinner. the callback fires immediately and hides
		//the spinner upon completion. CU 15 AUG 2017
		window.setTimeout($A.getCallback(function() {
			helper.handleSortRequest(component, event, helper);
		}), 0);
	},

	handleFilterRequest: function (component, event, helper) {
		//console.log('container controller handlesort');
		//helper.toggleFilterSpinner(component, "cme-datagrid-clientworking", true);
		//using setTimeout here to allow Lightning to complete a rendering cycle
		//which displays the spinner. the callback fires immediately and hides
		//the spinner upon completion. CU 15 AUG 2017
		//window.setTimeout($A.getCallback(function() {
		//	helper.filterByCol(component, event, helper);
		//}), 0);

		//var filterOptions = event.getParams();
		//var fl = component.get("v.filterlist");
		//for (var x = 0; x < fl.length; x++) {
		//	if (fl[x].field === filterOptions.column) {
		//		fl.splice(x, 1);
		//		break;
		//	}
		//}
		//if ("All" !== filterOptions.value) {
		//	fl.push({type: 'Col', field: filterOptions.column, value: filterOptions.value});
		//}
		//console.log(fl);
		//component.set("v.filterlist", fl);
		helper.processFilter(component, event.getParams());
	},

	onFilterByTextChange: function (component, event, helper) {
		var filterValue = component.find("filterText").get("v.value");
		//console.log(filterValue.length);
		if (filterValue.length != 1) {
			//helper.toggleFilterSpinner(component, "cme-datagrid-clientworking", true);
			//using setTimeout here to allow Lightning to complete a rendering cycle
			//which displays the spinner. the callback fires immediately and hides
			//the spinner upon completion. CU 15 AUG 2017
			//window.setTimeout($A.getCallback(function() {
			//	helper.filterByText(component, helper, filterValue);
			//}), 0);
			var fl = component.get("v.filterlist");
			for (var x = 0; x < fl.length; x++) {
				if (fl[x].type === 'Text') {
					fl.splice(x, 1);
					break;
				}
			}
			if (filterValue.length > 1) {
				fl.push({type: 'Text', field: null, value: filterValue});
			}
			component.set("v.filterlist", fl);
		}
	},

	selectAllClicked: function (component, event, helper) {
		helper.selectAll(component, event, helper);
	},

	datarowsChanged: function (component, event, helper) {
		helper.datarowsChanged(component, event, helper);
	},

	internaldatarowsChanged: function (component, event, helper) {
		helper.internaldatarowsChanged(component, event, helper);
	},

	handleRowSelected: function (component, event, helper) {
		helper.handleRowSelected(component, event, helper);
	},

	updateSelectable: function (component, event, helper) {
		helper.updateSelectable(component, event, helper);
	},

	onFilterListChanged: function (component, event, helper) {
		helper.toggleFilterSpinner(component, component.get("v.spinnerId"), true);
		//using setTimeout here to allow Lightning to complete a rendering cycle
		//which displays the spinner. the callback fires immediately and hides
		//the spinner upon completion. CU 15 AUG 2017
		window.setTimeout($A.getCallback(function() {
			helper.filter(component, helper);
		}), 0);
	},

	onDisplayedRowsChanged: function (component, event, helper) {
		helper.setSelectedList(component);
		helper.initPaging(component);
	},

	onPreviousPage: function (component, event, helper) {
		//console.log('previous page');
		component.set("v.movetopage", component.get("v.currentpage")-1);
	},

	onNextPage: function (component, event, helper) {
		//console.log('next page');
		component.set("v.movetopage", component.get("v.currentpage")+1);
	},

	onFirstPage: function (component, event, helper) {
		//console.log('previous page');
		component.set("v.movetopage", 0);
	},

	onLastPage: function (component, event, helper) {
		//console.log('next page');
		component.set("v.movetopage", component.get("v.pages").length-1);
	},

	onCurrentPageChanged: function (component, event, helper) {
		helper.toggleFilterSpinner(component, component.get("v.spinnerId"), true);
		//using setTimeout here to allow Lightning to complete a rendering cycle
		//which displays the spinner. the callback fires immediately and hides
		//the spinner upon completion. CU 15 AUG 2017
		window.setTimeout($A.getCallback(function() {
			helper.setPaging(component, helper);
		}), 0);
	},

	onPageSizeChanged: function (component, event, helper) {
		//component.set("v.pageSize", component.find("pageSizeSelect").get("v.value"));
		helper.initPaging(component);
	}
})