$(document).ready(function(){
    getCampaignDef(function(err, campDef) {
        var userWidget = new UserWidget(function(u,p) {alert('Changed user: ' + u + ' ' + p);});
        
        var campListWidget = new CampaignListWidget('camplist-container', function(campMeta) {
            //this is the campaign selected event code...
            campWidget.displayCampaign(campMeta.username, campMeta.campaignId);
        });
        
        var campWidget = new CampaignWidget("campaign-container", userWidget, 'no camp yet', campDef, function() {
            //redraw because a campagin was deleted (,etc.?)
            campListWidget.redraw();
        });
        
    });        
});



/*

---Widgets----------------------

CampaignWidget
    Model: one campaign object
    Events: onChange, onSave

CampaignListWidget
    Internally displays, sorts, searches, etc. and can clone or create a new campaign
    Model: A collection of Campaign objects
    Event: campaignSelected
                                          NOT SURE WHO OWNS IMPORT...

CurrentUserWidget
    Model: username, password
    Events: userChanged

---About M, V, and C----------------------

The server side is the model, storing persistent state, offering
domain-specific operations for manipulating that state, and enforcing
rules about how it may be manipulated.

The widgets can be seen as view elements. And the logic wiring view to 
model in main.js is a controller.

Internally, individual widgets have actual, visible views, in-memory model state which
is separate from the DOM, and controller logic between them.

   THINK ABOUT THIS AGAIN AFTER I'VE WRITTEN MORE CODE!!!!!
*/