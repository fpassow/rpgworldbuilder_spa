
$(document).ready(function() {    

    //A bag of stateless functions. Each takes model and controller and 
    //  sets up a different UI in the browser
    var views = new AdminViews();

    var model;
    var controller;

    getCampaignDef(function(err, def) {
        if (err) {
            alert(JSON.stringify(err));
        } else {
            findCampaignsMetadata({}, function(err, campsMeta) {
                if (err) {
                    alert(JSON>stringify(err));
                } else {
                    //Model has user, currentCampaign, campaigList, campaignsCache. 
                    //But it only gets the definitions object and data for a campaignList on startup
                    model = new Model(campsMeta, def);
                    listUsers(function(err, userList) {
                        if (err) {
                            alert(JSON.stringify(err));
                        } else {
                            model.userList = userList;
                            controller = new AdminController(model, views);
                            views.standardView(model, controller);
                        }
                    });  
                }
            });
        }
    });
});
