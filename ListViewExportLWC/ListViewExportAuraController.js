({
    doInit: function(component, event, helper) {
        var pageRef = component.get("v.pageReference");
        if (pageRef && pageRef.state) {
            component.set("v.filterId", pageRef.state.c__filterName);
            component.set("v.sessionId", pageRef.state.c__sessionId);
            component.set("v.ObjectName", pageRef.state.c__Object);
            component.set("v.recordIdsCsv", pageRef.state.c__selectedRecords);
            component.set("v.fieldNamesCsv", pageRef.state.c__fieldNames);
        } else {
            console.log('DEBUG: Page reference not found.');
        }
    },

    reInit: function(component, event, helper) {
        $A.get('e.force:refreshView').fire();
    }
})
