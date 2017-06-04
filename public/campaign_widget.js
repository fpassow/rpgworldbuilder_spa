/*
 * selector        jQuery selector for the container to put this widget into
 * userWidget      Used to get current user and password
 * aCampaign       Metadata for first campaign to display
 * def             Form definition object
 * externalChange  Callback called when campaign is cloned, deleted.
 *                   or any other change that might have to be reflected 
 *                   by other components.
 *
 * displayCampaign(username, campaignId) causes this widget to load
 *          and display a new campaign.
 */

function CampaignWidget(selector, userWidget, aCampaign, def, externalChange) {
    var parent = $("#" + selector);
    this.externalChange = externalChange || function() {};
    this.campaign = aCampaign;
    this.userWidget = userWidget;
    var thiz = this;
    
    //Checks user vs current user and displays static view or editing view.
    //Also displays or hides delete button.
    this.displayCampaign = function(username, campaignId) {
        loadCampaign(username, campaignId, function(err, campaign) {
            if (err) {
                alert(JSON.stringify(err));
            } else {
                thiz.campaign = campaign;
                if (thiz.userWidget.getUsername() == campaign.username) {
                    _showEditor();
                } else {
                    _showStatic();
                }
            }
        });
    }
    
    function _showEditor() {
        $("#campaign-thecampaign").empty();
        new RwbWidget("campaign-thecampaign", def, thiz.campaign, function(campy){
            alert('wire up the save button');
        });
        $("#campaign-delete").show();
    }
    function _showStatic() {
        $("#campaign-thecampaign").empty();
        $("#campaign-thecampaign").text(JSON.stringify(thiz.campaign));
        $("#campaign-delete").hide();
    }
    
    $("#campaign-clone").on('click', clone);
    function clone() {
        if (thiz.campaign) {
            storeCampaign(username, password, campaign, function(err, camp) {
                if (err) {
                    alert(JSON.stringify(err));
                } else {
                    thiz.displayCampaign(thiz.userWidget.getUsername(), camp.campaignId);
                    thiz.externalChange();
                }
            });
        } else {
            alert('Nothing to clone');
        }
    }
    
    $("#campaign-delete").on('click', deleteThisCampaign);
    function deleteThisCampaign() {
        alert('TODO');
    }

}
  