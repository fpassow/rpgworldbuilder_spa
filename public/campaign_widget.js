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
 *
 * newOwner(username)  Change username on any existing campaign object in CampaignWidget and/or
 *                     its RwbWidget. Also generate a new campaignId, because that might help us later.
 *                     Be just return if things don't exist.
 */

function CampaignWidget(selector, userWidget, aCampaign, def, externalChange) {
    var parent = $("#" + selector);
    this.externalChange = externalChange || function() {};
    this.campaign = aCampaign;
    this.userWidget = userWidget;
    this.editor = null;
    this.isEditing = false;
    var thiz = this;
    
    /* 
     * Public API
     */
    this.newOwner = function(newUserName) {
        if (thiz.campaign) {
            thiz.campaign.username = newUserName;
            thiz.campaign.campaignId = "ID" + Math.random();
            
            if (thiz.isEditing) {
                $("#campaign-save").show();
                $("#campaign-import").show();
                $("#campaign-clone").show();
                $("#campaign-delete").show();
            } else {
                $("#campaign-save").hide();
                $("#campaign-import").hide();
                $("#campaign-clone").show();
                $("#campaign-delete").hide();
            }
        }   
    }
    
   /*
    * Public API: 
    *    displayCampaign(username, campaignId)   Load the specified campaign from the server
    *    refresh()  Save and update yourself. Used when another widget has changed.
    *    saveCampaign() Tell the widget to save now.
    */

    this.displayCampaign = function(username, campaignId) {
        if (!username || !campaignId) {
            return;
        }
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
    //Save, reload, redraw
    this.refresh = function() {
        thiz.saveCampaign(function() {
            //restart from where we check if it's ours.
            thiz.displayCampaign(thiz.campaign.username, thiz.campaign.campaignId);
        });
    }
    
    //fires callback when done.
    this.saveCampaign = function(done) {
        if (!thiz.isEditing || !thiz.userWidget.isLoggedIn()) {
            done();
            return;
        }
        thiz.showMessage("Saving.....");
        var camp = thiz.editor.getState();
        camp.username = thiz.userWidget.getUsername();
        camp.campaignId = thiz.campaign.campaignId;
        thiz.campaign = camp;
        storeCampaign(thiz.userWidget.getUsername(), userWidget.getPassword(), thiz.campaign, function(err) {
            //Clear "Saving..." message. But make sure it lasts at least half a second.
            setTimeout(function(){thiz.showMessage("");}, 500);
            if (err) {
                alert(JSON.stringify(err));
            }
            done();            
        });
    }    
    
    this.showMessage = function(message) {
        $("#campaign-message").html(message);
    }
    
    function _showEditor() {
        thiz.isEditing = true;
        $("#campaign-thecampaign").empty();
        thiz.editor = new RwbWidget("campaign-thecampaign", def, thiz.campaign, function(campy){
            //Save triggered by Save button, or by logging out out or switching campaigns
        });
        $("#campaign-save").show();
        $("#campaign-import").show();
        $("#campaign-clone").show();
        $("#campaign-delete").show();
    }
    function _showStatic() {
        thiz.isEditing = false;
        thiz.editor = null;
        $("#campaign-thecampaign").empty();
        drawStatic("campaign-thecampaign", def, thiz.campaign);
        $("#campaign-save").hide();
        $("#campaign-import").hide();
        if (userWidget.isLoggedIn()) {
            $("#campaign-clone").show();
        } else {
        	$("#campaign-clone").hide();
        }
        $("#campaign-delete").hide();
    }
    function _showEmpty() {
        thiz.isEditing = false;
        $("#campaign-thecampaign").empty();
        $("#campaign-delete").hide();
        $("#campaign-save").hide();
        $("#campaign-import").hide();
        $("#campaign-clone").hide();
    }
    
    $("#campaign-new").on('click', createNewCampaign);
    function createNewCampaign() {
        thiz.campaign = {};
        thiz.campaign.campaignId = "ID" + Math.random();
        thiz.campaign.username = userWidget.getUsername();
        if (!thiz.campaign.username) {
            _showEditor();
            return;
        }
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
    
    $("#campaign-save").on('click', function(){
        if (thiz.userWidget.isLoggedIn()) {
            thiz.saveCampaign(function() {
                //After saving, tell the world.
                thiz.externalChange();
            });
        } else {
            _showSaveWindow();
        }
    });
    
    function _showSaveWindow() {
        drawStatic("savebox-content", def, thiz.campaign);
        $("#savebox").css("display", "block");
    }
    function _hideSaveWindow() {
        $("#savebox").css("display", "none");
    }
    $("#savebox-print").on('click', function() {window.print();});
    $("#savebox-close").on('click', _hideSaveWindow);

    
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
        var titleElement = $("<h2></h2>");
        titleElement.html(escapeHtml(data['title']));
        parent.append(titleElement);
    
        //def.fields[0]  is the title
        var field, i;
        var div;
        for (i = 1; i < rwbDef.fields.length; i++) {
            parent.append('<h3>' + rwbDef.fields[i].label + '</h3>');
            if (rwbDef.fields[i].isarrayfield) {
                var arr = data[rwbDef.fields[i].name];
                if (arr.length) {
                    arr.forEach(function(x, index) {
                        div = $("<div></div>");
                        div.html(escapeHtml(x));
                        parent.append(div)
                    });
                }
            } else {
                div = $("<div></div>");
                div.html(escapeHtml(data[rwbDef.fields[i].name]));
                parent.append(div);
            }
        }
    }

    $("#campaign-import").on('click', showImportWindow);
    function showImportWindow() {


    }

    //Empty when created
    _showEmpty();

}
  