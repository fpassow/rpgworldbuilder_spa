/*
  This controller has references to the model and the views, but keeps no other state of its own,
  and the model is just data. (And server access details are hidden in clientlib.sj.)

  The controller receives very simple UI events, basically just clicks. The event processing code
  has utility methods to pull user inputs from the UI, and clientlib.js functions to talk to the server.
*/

	MOVE ALL THIS WIRING INTO THE CONTROLLER SO EVENT PROCESSOR FUNCTIONS ARE IN SCOPE

    //Wire events from the static html

    $("#user-loginbutton").on('click',eventUserLogin);
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
	$("#user-createnew-cancel").on('click', eventUserCreatnew);
	$("#campaign-new").on('click', eventCampaignNew);
	$("#campaign-save").on('click', eventCampaignSave);
	$("#campaign-import").on('click', eventCampaignImport);
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
    function _readCampaignInputs() {
        //INPUT fields have ID's campedit-<name>-input
        inputs = {};
        var name;
        for (var i = 0; i < rwbDef.fields.length; i++) {
            name = rwbDef.fields[i].name;
            inputs[name] = $("#campedit-" + name + "-input").val();
        }
        return inputs;
    }


    //END OF UI INTERCONNECTION CODE.




function Controller(model, views) {

	this.model = model;
	this.views = views
	thiz = this;

	thiz.initUI = function initUI() {
		thiz.views.initUI(thiz.model, thiz);
	};

    //These just request a channge in the UI.
	thiz.showLogin = function() {

	};
    thiz.showChangePassword = function() {

	};
	thiz.cancelChangePassword = function() {

	};
    thiz.showNewUser = function() {

	};
	thiz.cancelNewUser = function() {

	};

	thiz.saveInputs = function(inputValues) {
        //for each field in the def
           //look for name as key in inputValues
           //if there's an interesting string
               //if this is a simple field, set it on model.campaign.name
               //if this is an array field, append it to model.comapaign.name
        //save to server
        //redraw without waiting
	};
	thiz.deleteArrayFieldItem = function(fieldName, arrayIndex, inputValues) {
        //delete the given array item
        //call savveInputs(inputValues)
        //redraw without waiting
	};

    this.login = function(n, p) {
        checkUser($(n, p, function(err) {
            if (err) {
                thiz.user.username = n;
                thiz.user.password = null;
                thiz.user.loggedIn = false;
                thiz.userMessage = "Login failed:" + JSON.stringify(err));
            } else {
                thiz.username = n;
                thiz.password = p;
                thiz.loggedIn = true;
                thiz.userMessage = "Logged in as <b>" + u + "</b>";
            }
            thiz.views.standardView(thiz.model, thiz);
        });
    };

    this.logout = function() {
    	//The server has no concept of "logged in". So we're just dropping local state.
    	thiz.model.user.username = null;
        thiz.model.user.password = null;
        thiz.model.user.loggedIn = false;
        thiz.views.standardView(thiz.model, thiz);
    };

    this.newUser = function(n, p, pp) {
        if (n && n.length && p && p.length && pp && pp.length && p === pp) {
            createUser(n, p, function(err) {
                if (err) {
                    alert(JSON.stringify(err));
                } else {
                    thiz.model.user.username = n;
                    thiz.model.user.password = p;
                    thiz.model.loggedIn = true;
                    thiz.model.usermessage = "Logged in as <b>" + n + "</b>";
                    thiz.views.standardView(thiz.model, thiz);
                }
            });
        } else {
        	alert("Please enter a username and a password. And the passwords must match.");
        	//No need to redraw
        }
    };

    this.deleteUser function() {alert('FUNCTION NOT WRITTEN YET');};

    this.changePassword = function(oldPw, newPw1, newPw2) {
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
                thiz.views.standardView(thiz.model, thiz);
            }
        });
    };

    this.selectCampaign = function(campMeta) {
        loadCampaign(campMeta.username, campMeta.campaignId, function(err, camp) {
            if (err) {
                alert(JSON.stringify(err));
            } else {
                thiz.model.campaign = camp;
                thiz.views.standardView(thiz.model, thiz);
            }
        });
    };

    this.saveCampaign = function(inputElementVaues) {

        // UPDATE THE MODEL WITH inputElementVaues
        // THESE ARE THE VALUES OF SIMPLE FIELDS, AND POTENTIAL LAST ADDITIONS TO ARRAY FIELDS

    	thiz.model.campaign = newCampaignState;
    	if (!thiz.model.user.loggedIn) {
    		thiz.views.printView(thiz.model, thiz);
    	} else {
            thiz.model.campaignMessage = "Saving.....";
            newCampaignState.username = thiz.model.user.username;
            newCampaignState.campaignId = thiz.model.campaign.campaignId;
            thiz.campaign = newCampaignState;
            storeCampaign(thiz.model.user.username, thiz.model.user.password, thiz.campaign, function(err) {
                //Clear "Saving..." message. But make sure it lasts at least half a second.
                if (err) {
                    alert(JSON.stringify(err));
                    thiz.views.standardView(thiz.model, thiz);
                } else {
                    findCampaignsMetadata({}, function(err, campsMeta) {
                	    if (err) {
                            alert(JSON>stringify(err));
                            thiz.model.campaignMessage = "";
                	        thiz.views.standardView(thiz.model, thiz);
                        } else {
                    	    thiz.model.campaignList = campsMeta;----------------------
                            thiz.views.standardView(thiz.model, thiz);
                            setTimeout(function() {
                	            thiz.model.campaignMessage = "";
                	            thiz.views.standardView(thiz.model, thiz);
                            }, 500);
                        }
                    });
                }
            });            
        }
    };

    this.cloneCampaign = function() {
        if (thiz.model.campaign) {
            thiz.model.campaign.username = thiz.model.user.username;
            thiz.model.campaign.campaignId = "ID" + Math.random();
            //No new data here. Don't save until told to.
        } else {
            alert('Nothing to clone');
            thiz.views.standardView(thiz.model, thiz);
        }

    };

    this.newCampaign = function() {
        thiz.model.campaign = {};
        thiz.model.campaign.campaignId = "ID" + Math.random();
        thiz.model.campaign.username = thiz.model.user.username;
        //No point in saving an empty campaign
        thiz.views.standardView(thiz.model, thiz);
    };
    
    this.deleteCampaign = function() {
        if (confirm('Delete this campaign?')) {
            deleteCampaign(thiz.model.user.username, thiz.model.user.password, thiz.model.campaign.campaignId, function(err) {
                if (err) {
                    alert(JSON.stringify(err));
                } else {
                	thiz.model.campaign = null;
                    findCampaignsMetadata({}, function(err, campsMeta) {
                	    if (err) {
                            alert(JSON>stringify(err));
                	        thiz.views.standardView(thiz.model, thiz);
                        } else {
                    	    thiz.model.campaignList = campsMeta;----------------------
                            thiz.views.standardView(thiz.model, thiz);
                        }
                    });
                }
            });
        }
    };

    this.importCampaign = 'TODO';

}