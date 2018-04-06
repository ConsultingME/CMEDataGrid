({
    onInit: function(component, event, helper) {
		const columns = [
			{PropertyName: 'IsComplete', Label: 'Complete', Type: 'Checkbox'},
			{PropertyName: 'IsApproved', Label: 'Approved', Type: 'BooleanIcon', TrueIcon: {IconName: 'utility:check', Size: 'small'}, FalseIcon: {IconName: 'utility:close', Size: 'small'}},
			{PropertyName: 'TotalPrice', Label: 'Total Price', Type: 'Currency'},
			{PropertyName: 'CreateDate', Label: 'Created', Type: 'Datetime'},
			{PropertyName: 'TotalProducts', Label: '# of Products', Type: 'Number'},
			{PropertyName: 'Name', Label: 'Name'},
			{PropertyName: 'StageName', Label: 'Stage'},
			{Label: 'Approval', Type: 'ActionGroup', ActionList: [
				{IconName: 'utility:check', Variant: 'bare', AlternativeText: 'Approve', Name: 'Approve', ButtonClass: 'green', Size: 'large', Title: 'Approve', DisabledValidator: helper.validateApproved},
				{Label: 'Deny', Name: 'Deny'}
			]},
			{Label: 'Actions', Type: 'ActionMenu', ActionList: [
				{Label: 'Clone', IconName: 'utility:copy', Variant: 'bare', AlternativeText: 'Clone', Name: 'Clone', Size: 'large'},
				{Label: 'Follow', IconName: 'utility:add', Variant: 'bare', AlternativeText: 'Follow', Name: 'Follow', Size: 'large'},
				{Label: 'Change Owner', IconName: 'utility:change_owner', Variant: 'bare', AlternativeText: 'Change Owner', Name: 'ChangeOwner', Size: 'large'}
			]}

		];
		component.set("v.columns", columns);

		const demodata = [
			{IsComplete: true, IsApproved: true, TotalPrice: 12.50, CreateDate: "2018-03-12T08:00:00-05:00", TotalProducts: 3, Id: 1, Name: "New Opp", StageName: 'New'},
			{IsComplete: true, IsApproved: false, TotalPrice: 4.50, CreateDate: "2018-02-12T08:00:00-05:00", TotalProducts: 1, Id: 2, Name: "Renewal Opp", StageName: 'Needs Analysis'},
			{IsComplete: false, IsApproved: false, TotalPrice: 23.25, CreateDate: "2018-03-03T08:00:00-05:00", TotalProducts: 7, Id: 3, Name: "Another New One", StageName: 'Prospecting'},
			{IsComplete: true, IsApproved: true, TotalPrice: 120.50, CreateDate: "2017-11-22T08:00:00-05:00", TotalProducts: 13, Id: 4, Name: "Another Renewal", StageName: 'Proposal/Price Quote'},
			{IsComplete: true, IsApproved: true, TotalPrice: 18.50, CreateDate: "2017-06-08T08:00:00-05:00", TotalProducts: 6, Id: 5, Name: "Yet Another New One", StageName: 'Qualification'},
		];
		component.set("v.datarows", demodata);
    },

	onGridAction: function(component, event, helper) {
		const params = event.getParams();
		alert('Action: ' + params.Action + '\r\n' + 'Name: ' + params.SelectedRow.Name);
	},

	onCustomAction: function(component, event, helper) {
		const grid = component.find("grid");
		console.log(grid.get("v.selectedrows"));
	},

	onActionSelected: function(component, event, helper) {
		const actions = component.find("actions");
		const data = component.get("v.datarows");

		var evaluator;
		switch(actions.get("v.value")) {
			case "ApprovedAction" :
				evaluator = function(dr) {
					var obj = {PrimaryKey: dr.Id, Selectable: dr.IsApproved === true};
					if (obj.Selectable === false)
						obj.Error = "Unapproved rows cannot be selected";
					return obj ;
				}
				break;
			case "Archive" :
				evaluator = function(dr) {
					var obj = {PrimaryKey: dr.Id, Selectable: dr.IsComplete === false};
					if (obj.Selectable === false)
						obj.Error = "Complete rows cannot be selected";
					return obj ;
				}
				break;
			default :
				evaluator = function(dr) {
					return {PrimaryKey: dr.Id, Selectable: false};
				}
				break;
		}
		const selectable = data.map(evaluator);

		const grid = component.find("grid");
		grid.updateSelectable(selectable);
	}
})