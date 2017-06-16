$(document).ready(function(){
    getCampaignDef(function(err, campDef) {
        
        var campWidget = null;
        var campListWidget = null;
        
        var userWidget = new UserWidget(
            function(readyForChange) {
                //This code runs just before we change users. (Login, logout, etc.)
                //We save any campaign we were working on,
                // but we do NOT clear the campaign widget, so the new user can save a clone
                if (campWidget) {
                    campWidget.saveCampaign(function() {
                        campListWidget = null;
                        $("#camplist-container").empty();
                        readyForChange();
                    });
                } else {
                    campListWidget = null;
                    $("#camplist-container").empty();
                    readyForChange();
                }
            },
            function() {
                //This code runs after the user has changed.
                //Let campaign list do special formating of the current user's stuff
                campListWidget = new CampaignListWidget('camplist-container', function(campMeta) {
                    //this is the campaign selected event code...   
                    campWidget.displayCampaign(campMeta.username, campMeta.campaignId);
                });
                if (campWidget) {
                    //New user takes ownership of what's there, and can create a clone by saving it.
                    campWidget.newOwner(userWidget.getUsername());
                } else {
                    campWidget = new CampaignWidget("campaign-container", userWidget, 'no camp yet', campDef, function() {
                        //Runs when the campaign saves, because a title change, etc, might be visible.
                        campListWidget.refresh();
                });
                }
                    
            }
        );
        //And display everything on startup, too
        campWidget = new CampaignWidget("campaign-container", userWidget, 'no camp yet', campDef, function() {
            //Runs when the campaign saves, because a title change, etc, might be visible.
            campListWidget.refresh();
        });
        campListWidget = new CampaignListWidget('camplist-container', function(campMeta) {
            //this is the campaign selected event code...   
            campWidget.displayCampaign(campMeta.username, campMeta.campaignId);
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