({
    onInit : function(component, event, helper) {
		const columns = [
			{PropertyName: 'IsComplete', Label: 'Complete', Type: 'Checkbox'},
			{PropertyName: 'IsApproved', Label: 'Approved', Type: 'BooleanIcon', TrueIcon: {IconName: 'utility:check', Size: 'small'}, FalseIcon: {IconName: 'utility:close', Size: 'small'}},
			{PropertyName: 'TotalPrice', Label: 'Total Price', Type: 'Currency'},
			{PropertyName: 'CreateDate', Label: 'Created', Type: 'Datetime'},
			{PropertyName: 'TotalProducts', Label: '# of Products', Type: 'Number'},
			{PropertyName: 'Name', Label: 'Name'},
			{PropertyName: 'StageName', Label: 'Stage'}
		];
		component.set("v.columns", columns);

		const demodata = [
			{IsComplete: true, IsApproved: true, TotalPrice: 12.50, CreateDate: "2018-03-12", TotalProducts: 3, Id: 1, Name: "New Opp", StageName: 'New'},
			{IsComplete: true, IsApproved: false, TotalPrice: 4.50, CreateDate: "2018-02-12", TotalProducts: 1, Id: 2, Name: "Renewal Opp", StageName: 'Needs Analysis'},
			{IsComplete: false, IsApproved: false, TotalPrice: 23.25, CreateDate: "2018-03-03", TotalProducts: 7, Id: 3, Name: "Another New One", StageName: 'Prospecting'},
			{IsComplete: true, IsApproved: true, TotalPrice: 120.50, CreateDate: "2017-11-22", TotalProducts: 13, Id: 4, Name: "Another Renewal", StageName: 'Proposal/Price Quote'},
			{IsComplete: true, IsApproved: true, TotalPrice: 18.50, CreateDate: "2017-06-08", TotalProducts: 6, Id: 5, Name: "Yet Another New One", StageName: 'Qualification'},
		];
		component.set("v.datarows", demodata);
    }
})
