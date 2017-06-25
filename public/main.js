
$(document).ready(function(){    getCampaignDef(function(err, campDef) {

    //A bag of stateless functions. Each takes model and controller and 
    //  sets up a different UI in the browser
    var views = new Views();

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
                    //Model has user, currentCampaign, campaigList, campaignsCache. But only init with data for a campaignList
                    model = new Model(campsMeta, def);
                    controller = new Controller(model, views);
                    controller.initUI();
                }
            });
        }
    });
});
