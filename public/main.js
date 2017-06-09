$(document).ready(function(){
    getCampaignDef(function(err, campDef) {
        
        var campWidget = null;
        var campListWidget = null;
        
        var userWidget = new UserWidget(
            function(readyForChange) {
                //This code runs just before we change users. (Login, logout, etc.)
                //We save any campaign we were working on,
                //and then clear out the other two widgets.
                if (campWidget) {
                    campWidget.saveCampaign(function() {
                        campWidget = null;
                        campListWidget = null;
                        $("#camplist-container").empty();
                        $("#camplist-container").empty();
                        readyForChange();
                    });
                } else {
                    campWidget = null;
                    campListWidget = null;
                    $("#camplist-container").empty();
                    $("#camplist-container").empty();
                    readyForChange();
                }
            },
            function() {
                //This code runs after the user has changed.
                //We set everything up for them.
                campListWidget = new CampaignListWidget('camplist-container', function(campMeta) {
                    //this is the campaign selected event code...
                    campWidget.displayCampaign(campMeta.username, campMeta.campaignId);
                });
        
                campWidget = new CampaignWidget("campaign-container", userWidget, 'no camp yet', campDef, function() {
                    //Runs when the campaign saves, because a title change, etc, might be visible.
                    campListWidget.refresh();
                });
                    
            }
        );    
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