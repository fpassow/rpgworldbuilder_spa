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
    this.editor = null;
    this.isEditing = false;
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
        thiz.isEditing = true;
        $("#campaign-thecampaign").empty();
        thiz.editor = new RwbWidget("campaign-thecampaign", def, thiz.campaign, function(campy){
            alert('wire up the save button');
        });
        $("#campaign-delete").show();
    }
    function _showStatic() {
        thiz.isEditing = false;
        $("#campaign-thecampaign").empty();
        drawStatic("campaign-thecampaign", def, thiz.campaign)
        $("#campaign-delete").hide();
    }
    function _showEmpty() {
        thiz.isEditing = false;
        $("#campaign-thecampaign").empty();
        $("#campaign-delete").hide();
    }
    
    $("#campaign-new").on('click', createNewCampaign);
    function createNewCampaign() {
        thiz.campaign = {};
        thiz.campaign.username = userWidget.getUsername();
        thiz.campaign.campaignId = "ID" + Math.random();
        storeCampaign(thiz.userWidget.getUsername(), thiz.userWidget.getPassword(), thiz.campaign, function(err, camp) {
            if (err) {
                alert(JSON.stringify(err));
            } else {
                thiz.displayCampaign(thiz.userWidget.getUsername(), thiz.campaign.campaignId);
                thiz.externalChange();
                _showEditor();
            }
        });
    }
    
    $("#campaign-save").on('click', saveCampaign);
    function saveCampaign() {
        var camp = thiz.editor.getState();
        camp.username = thiz.userWidget.getUsername();
        camp.campaignId = thiz.campaign.campaignId;
        thiz.campaign = camp;
        storeCampaign(thiz.userWidget.getUsername(), userWidget.getPassword(), thiz.campaign, function(err) {
            if (err) {
                alert(JSON.stringify(err));
            } else {
                alert("Saved");
                thiz.externalChange();
            }                
        });
    }
    
    $("#campaign-clone").on('click', clone);
    function clone() {
        if (thiz.campaign) {
            thiz.campaign.username = userWidget.getUsername();
            thiz.campaign.campaignId = "ID" + Math.random();
            storeCampaign(thiz.userWidget.getUsername(), thiz.userWidget.getPassword(), thiz.campaign, function(err, camp) {
                if (err) {
                    alert(JSON.stringify(err));
                } else {
                    thiz.displayCampaign(thiz.userWidget.getUsername(), thiz.campaign.campaignId);
                    thiz.externalChange();
                }
            });
        } else {
            alert('Nothing to clone');
        }
    }
    
    $("#campaign-delete").on('click', deleteThisCampaign);
    function deleteThisCampaign() {
        if (confirm('Delete this campaign?')) {
            deleteCampaign(thiz.userWidget.getUsername(), thiz.userWidget.getPassword(), thiz.campaign.campaignId, function(err) {
                if (err) {
                    alert(JSON.stringify(err));
                } else {
                    _showEmpty();
                    externalChange();
                }
            });
            
        }
    }
    
    
    function drawStatic(selector, rwbDef, data) {
        var parent = $("#" + selector);
        parent.append('<h2>' + data['title'] + '</h2>');
    
        //def.fields[0]  is the title
        var field, i;
        for (i = 1; i < rwbDef.fields.length; i++) {
            if (rwbDef.fields[i].isarrayfield) {
                parent.append('<h3>' + rwbDef.fields[i].label + '</h3>');
                var arr = data[rwbDef.fields[i].name];
                if (arr.length) {
                    arr.forEach(function(x, index) {
                        parent.append('<div>' + x + '</div>')
                    });
                }
            } else {
                parent.append('<h3>' + rwbDef.fields[i].label + '</h3>');
                parent.append('<div>' + data[rwbDef.fields[i].name] + '</div>');
            }
        }
    }

}
  