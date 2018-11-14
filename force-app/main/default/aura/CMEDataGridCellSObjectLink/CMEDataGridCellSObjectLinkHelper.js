({
    generateUrl : function(component) {
		const data = component.get("v.data");
		const isSFOne = component.get("v.isSFOne");
		if (isSFOne === true) {
			const navService = component.find("navService");
			const pageReference = {type: 'standard__recordPage', attributes: {objectApiName: data.config.SObjectType, actionName: 'view', recordId: data.value.RecordId}};
			navService.generateUrl(pageReference)
				.then($A.getCallback(function(url) {
					component.set("v.url", url);
				}));
		} else {
			component.set("v.url", '/' + data.value.RecordId);
		}
    }
})
