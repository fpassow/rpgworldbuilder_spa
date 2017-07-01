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

    //Wire events from the static html

    $("#user-login-button").on('click',eventUserLogin); 
	$("#user-password").on('keyup', function(e) {
	    if (e.keyCode === 13) {//return key
	        eventUserLogin();
	    }
	});
    $("#user-new-button").on('click', eventUserNew);
    $("#user-logout-button").on('click',eventUserLogout);
    $("#user-gotochangepw-button").on('click',eventUserGotochangepw);
	$("#user-deleteuser").on('click', eventUserDeleteuser);
	$("#user-changepw-button").on('click', eventUserChangepw);
	$("#user-changepw-cancel").on('click', eventUserChangepwCancel);
	$("#user-createnew-button").on('click', eventUserCreatenew);
	$("#user-createnew-cancel").on('click', eventUserCreatenewCancel);
	$("#campaign-new").on('click', eventCampaignNew);
	$("#campaign-save").on('click', eventCampaignSave);
	$("#campaign-import").on('click', eventCampaignImport);// TODO <<<------------<<<<<<
	$("#campaign-clone").on('click', eventCampaignClone);
	$("#campaign-delete").on('click', eventCampaignDelete);
	$("#savebox-print").on('click', eventSaveboxPrint);
	$("#savebox-close").on('click', eventSaveboxClose);
	$("#hintbox-close").on('click', eventHintboxClose);

    //Events from dynamically generated HTML:
    //  Clicking delete on an array field item callscontroller.deleteArrayFieldItem(fieldName, arrayIndex)
    //  Clicking [Add] or hitting return on the input for an array field calls controller.saveInputs();
    //  Clicking a campaign in the CamplaignList calls controller.selectCampaign(campMeta);


    //Utility function to pull data from the user section INPUT elements
    function _readUserInputs() {
    	var ui = {};
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
            val = $("#campedit-" + name + "-input").val();
            if (val && val.trim().length) {
            	if (field.isarrayfield) {
                    if (!model.campaign[field.name[]) {
                    	model.campaign[field.name] = [];
                    }
                    model.campaign[field.name].push(val);
            	} else {
            		model.campaign[field.name] = val;
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
    	var n = uin.username;
    	var p = uin.password;
        checkUser($(n, p, function(err) {
            if (err) {
                model.user.username = n;
                model.user.password = null;
                model.user.loggedIn = false;
                model.userMessage = "Login failed:" + JSON.stringify(err);
            } else {
                model.model.username = n;
                model.password = p;
                model.loggedIn = true;
                model.userMessage = "Logged in as <b>" + u + "</b>";
            }
            views.standardView(model, thiz);
        });
    };

    this.eventUserLogout = function() {
    	//The server has no concept of "logged in". So we're just dropping local state.
    	model.user.username = null;
        model.user.password = null;
        model.user.loggedIn = false;
        views.standardView(model, thiz);
    };

    this.eventUserNew = function() {
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
                    model.loggedIn = true;
                    model.usermessage = "Logged in as <b>" + n + "</b>";
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
    	var newPw1 = ui.changepw.new1;
    	var newPw2 = ui.changepw.new2;
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

    this.eventUserChangepwCancel = function() {
        $("#user-state-loggedin").show();
        $("#user-state-changingpw").hide();
        $("#user-state-notloggedin").hide();
        $("#user-state-createnew").hide();

    };

    this.eventUserCreatenew = function() {
        $("#user-state-loggedin").hide();
        $("#user-state-changingpw").hide();
        $("#user-state-notloggedin").hide();
        $("#user-state-createnew").show();
    }

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
    }

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
        var inputs = _readCampaignInputs();
    	if (!model.user.loggedIn) {
    		views.printView(model, thiz);
    	} else {
            _saveCampaignToServer();
            views.standardView(model, thiz);
        }
    }

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
                    	    model.campaignList = campsMeta;----------------------
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
        model.campaign.username = model.user.username;
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
                    	    model.campaignList = campsMeta;----------------------
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

    this.importCampaign = 'TODO';

    this.eventSaveboxPrint = function() {
        window.print();
    }

    this.eventSaveboxClose = function() {
    	$("#savebox").hide();
    }

    this.eventHintboxClose = function() {
    	$("#hintbox").hide();
    }



}