/*
  This controller has references to the model and the views, but keeps no other state of its own,
  and the model is just data. (And server access details are hidden in clientlib.sj.)

  The controller receives very simple UI events, basically just clicks. The event processing code
  has utility methods to pull user inputs from the UI, and clientlib.js functions to talk to the server.
*/

function Controller(model, views) {

	this.model = model;
	this.views = views
	thiz = this;

    //Utility function to pull data from the user section INPUT elements
    function _readUserInputs() {
    	var uin = {};
    	uin.login = {};
    	uin.create = {};
    	uin.changepw = {};

        uin.login.username = $("#user-username").val();
        uin.login.password = $("#user-password").val( );
    	
    	uin.create.username = $("#user-createnew-username").val();
        uin.create.password1 = $("#user-createnew-password1").val();
        uin.create.password2 = $("#user-createnew-password2").val();

        uin.changepw.old = $("#user-changepw-old").val();
        uin.changepw.new1 = $("#user-changepw-new1").val();
        uin.changepw.new2 = $("#user-changepw-new2").val()

        return uin;
    }

    //Utility function to pull data from the user section INPUT elements
    //  **and** add them to model.campaign
    function _readCampaignInputs() {
        //INPUT fields have ID's campedit-<name>-input
        var fields = model.def.fields;
        var field, val;
        for (var i = 0; i < fields.length; i++) {
            field = fields[i];
            val = $("#campedit-" + field.name + "-input").val();
            if (val) {
            	if (field.isarrayfield) {
                    if (!model.campaign[field.name]) {
                    	model.campaign[field.name] = [];
                    }
                    model.campaign[field.name].push(val);
            	} else {
            		model.campaign[field.name] = val;
            	}
            }
        }
    }


/* USEFUL FOR CAMAPIGN AREA BUTTON CONTROL
        $("#campaign-new").show();
        $("#campaign-save").hide();
        $("#campaign-import").hide();
        $("#campaign-clone").hide();
        $("#campaign-delete").hide();
        */

    this.eventUserGotochangepw = function() {
        $("#user-state-notloggedin").hide();
        $("#user-state-loggedin").hide();
        $("#user-state-changingpw").show();
        $("#user-state-createnew").hide();
    };

    this.eventUserLogin = function() {
    	var uin = _readUserInputs();
    	var n = uin.login.username;
    	var p = uin.login.password;
        checkUser(n, p, function(err) {
            if (err) {
                model.user.username = n;
                model.user.password = null;
                model.user.loggedIn = false;
                model.userMessage = "Login failed:" + JSON.stringify(err);
            } else {
                model.user.username = n;
                model.user.password = p;
                model.user.loggedIn = true;
                model.userMessage = "Logged in as <b>" + n + "</b>";
                //If I was anonymousEditing a campaign, make it my own.
                if (model.anonymousEditing && model.campaign) {
                	_readCampaignInputs();
                    model.campaign.username = n;
                	model.anonymousEditing = false;
                }
            }
            views.standardView(model, thiz);
        });
    };

    this.eventUserLogout = function() {
    	//The server has no concept of "logged in". So we're just dropping local state.
    	model.user.username = null;
        model.user.password = null;
        model.user.loggedIn = false;
        model.userMessage = '';
        views.standardView(model, thiz);
    };

    this.eventUserCreateNew = function() {
    	var uin = _readUserInputs();
    	var n = uin.create.username;
        var p = uin.create.password1;
        var pp = uin.create.password2;
        if (n && n.length && p && p.length && pp && pp.length && p === pp) {
            createUser(n, p, function(err) {
                if (err) {
                    alert(JSON.stringify(err));
                } else {
                    model.user.username = n;
                    model.user.password = p;
                    model.user.loggedIn = true;
                    model.userMessage = "Logged in as <b>" + n + "</b>";
                    //If I was anonymousEditing a campaign, make it my own.
                    if (model.anonymousEditing && model.campaign) {
                    	_readCampaignInputs();
                        model.campaign.username = n;
                	    model.anonymousEditing = false;
                    }
                    views.standardView(model, thiz);
                }
            });
        } else {
        	alert("Please enter a username and a password. And the passwords must match.");
        	//No need to redraw
        }
    };

    this.eventUserDeleteuser = function() {alert('FUNCTION NOT WRITTEN YET');};

    this.eventUserChangepw = function() {
    	var uin = _readUserInputs();
    	var oldPw = uin.changepw.old;
    	var newPw1 = uin.changepw.new1;
    	var newPw2 = uin.changepw.new2;
        if (!(oldPw && newPw1 && newPw2 && oldPw.length && newPw1.length && newPw2.length)) {
            alert('All three fields are required.');
            return;//no need to redraw
        }
        if (newPw1 !== newPw2) {
            alert('New password fields must match.');
            return;//no need to redraw
        }
        changePassword(thiz.model.user.username, oldPw, newPw1, function(err) {
            if (err) {
                alert(JSON.stringify(err));
                //No need to redraw
            } else {
                thiz.model.user.password = newPw1;
                alert('Password changed.');
                thiz.views.standardView(model, thiz);
            }
        });
    };

    this.eventUserChangepwCancel  = function() {
        $("#user-state-loggedin").show();
        $("#user-state-changingpw").hide();
        $("#user-state-notloggedin").hide();
        $("#user-state-createnew").hide();
    };

    this.eventUserNew = function() {
        $("#user-state-loggedin").hide();
        $("#user-state-changingpw").hide();
        $("#user-state-notloggedin").hide();
        $("#user-state-createnew").show();
    };

    this.eventUserCreatenewCancel = function() {
        $("#user-state-changingpw").hide();
        $("#user-state-createnew").hide();
        if (model.user.loggedIn) {
            $("#user-state-loggedin").show();
            $("#user-state-notloggedin").hide();
        } else {
            $("#user-state-loggedin").hide();
            $("#user-state-notloggedin").show();
        }
    };

    // Called when user clicks a campaign in the campaign list.
    this.selectCampaign = function(campMeta) {
        loadCampaign(campMeta.username, campMeta.campaignId, function(err, camp) {
            if (err) {
                alert(JSON.stringify(err));
            } else {
                model.campaign = camp;
                views.standardView(model, thiz);
            }
        });
    };

    this.eventCampaignSave = function() {
    	//Update model from INPUTs
        _readCampaignInputs();
    	if (!model.user.loggedIn) {
    		views.printView(model, thiz);
    	} else {
            _saveCampaignToServer();
            views.standardView(model, thiz);
        }
    };

    function _saveCampaignToServer() {
        _writeCampaignMessage("Saving.....");
        storeCampaign(model.user.username, model.user.password, model.campaign, function(err) {
            //Clear "Saving..." message. But make sure it lasts at least half a second.
            if (err) {
                alert(JSON.stringify(err));
                model.campaignMessage = "";
                views.standardView(model, thiz);
            } else {
            	//Refresh the campaign list
                findCampaignsMetadata({}, function(err, campsMeta) {
            	    if (err) {
                        alert(JSON>stringify(err));
                        model.campaignMessage = "";
            	        views.standardView(model, thiz);
                    } else {
                	    model.campaignList = campsMeta;
                        setTimeout(function() {
            	            model.campaignMessage = "";
            	            views.standardView(model, thiz);
                        }, 500);
                    }
                });
            }
        });            
    };

    function _writeCampaignMessage(msg) {
    	$("#campaign-message").html(msg);
    }

    this.eventCampaignClone = function() {
        if (model.campaign) {
            model.campaign.username = model.user.username;
            model.campaign.campaignId = "ID" + Math.random();
            _saveCampaignToServer();//Also displays a view
        } else {
            alert('Nothing to clone');
            views.standardView(model, thiz);
        }
    };

    this.eventCampaignNew = function() {
        model.campaign = {};
        model.campaign.campaignId = "ID" + Math.random();
        if (model.user.loggedIn) {
        	model.campaign.username = model.user.username;
        } else {
        	model.anonymousEditing = true;
        }
        //No point in saving an empty campaign
        views.standardView(model, thiz);
    };
    
    this.eventCampaignDelete = function() {
        if (confirm('Delete this campaign?')) {
            deleteCampaign(model.user.username, model.user.password, model.campaign.campaignId, function(err) {
                if (err) {
                    alert(JSON.stringify(err));
                } else {
                	model.campaign = null;
                    findCampaignsMetadata({}, function(err, campsMeta) {
                	    if (err) {
                            alert(JSON>stringify(err));
                            model.campaignMessage = "";
                	        views.standardView(model, thiz);
                        } else {
                    	    model.campaignList = campsMeta;
                            setTimeout(function() {
                	            model.campaignMessage = "";
                	            views.standardView(model, thiz);
                            }, 500);
                        }
                    });
                }
            });
        }
    };

    this.importCampaign = function() {alert('TODO')};

    this.eventSaveboxPrint = function() {
        window.print();
    };

    this.eventSaveboxClose = function() {
    	$("#savebox").hide();
    };

    this.eventHintboxClose = function() {
    	$("#hintbox").hide();
    };

    this.deleteArrayFieldItem = function(fieldName, arrayIndex) {
        model.campaign[fieldName].splice(arrayIndex, 1);
        views.standardView(model, thiz);
    };

    //Collect inputs from the campaign editor and add them to the model
    /*this.saveInputs = function() {
DONE ELSEWHERE
    };*/

  
    //Wire events from the static html

    $("#user-login-button").on('click', this.eventUserLogin); 
	$("#user-password").on('keyup', function(e) {
	    if (e.keyCode === 13) {//return key
	        thiz.eventUserLogin();
	    }
	});
    $("#user-new-button").on('click', this.eventUserNew);
    $("#user-logout-button").on('click', this.eventUserLogout);
    $("#user-gotochangepw-button").on('click', this.eventUserGotochangepw);
	$("#user-deleteuser").on('click', this.eventUserDeleteuser);
	$("#user-changepw-button").on('click', this.eventUserChangepw);
	$("#user-changepw-cancel").on('click', this.eventUserChangepwCancel);
	$("#user-createnew-button").on('click', this.eventUserCreateNew);
	$("#user-createnew-cancel").on('click', this.eventUserCreatenewCancel);
	$("#campaign-new").on('click', this.eventCampaignNew);
	$("#campaign-save").on('click', this.eventCampaignSave);
	$("#campaign-import").on('click', this.eventCampaignImport);// TODO <<<------------<<<<<<
	$("#campaign-clone").on('click', this.eventCampaignClone);
	$("#campaign-delete").on('click', this.eventCampaignDelete);
	$("#savebox-print").on('click', this.eventSaveboxPrint);
	$("#savebox-close").on('click', this.eventSaveboxClose);
	$("#hintbox-close").on('click', this.eventHintboxClose);

	//Events from dynamically generated HTML:
    //  Clicking delete on an array field item calls controller.deleteArrayFieldItem(fieldName, arrayIndex)
    //  Clicking a campaign in the CamplaignList calls controller.selectCampaign(campMeta);


}