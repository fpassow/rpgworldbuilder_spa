/*
  This admin controller has references to the model and the views, but keeps no other state of its own,
  and the model is just data. (And server access details are hidden in clientlib.sj.)

  The admin controller receives very simple UI events, basically just clicks. The event processing code
  has utility methods to pull user inputs from the UI, and clientlib.js functions to talk to the server.

  views argument should be an AdminViews.

  Admin users are managed directly in the database.

  No admin functionality is included in any file in the primary spa. So the admin spa also has an 
  extra set of functions in admin_clientlib.js
*/

function AdminController(model, views) {

	this.model = model;
	this.views = views
	thiz = this;

    //Utility function to pull data from the user section INPUT elements
    function _readUserInputs() {
        thiz.model.adminUsername = $("#user-username").val();
        thiz.model.adminPassword = $("#user-password").val( );
    }

    //Don't validate them. Don't make it easier if someone gets them wrong.
    this.eventUserLogin = function() {
    	_readUserInputs();
        thiz.model.adminLoggedIn = true;
        views.standardView(model, thiz);
    };

    this.eventUserLogout = function() {
    	//The server has no concept of "logged in". So we're just dropping local state.
    	thiz.model.adminUsername = null;
        thiz.model.adminPassword = null;
        thiz.model.adminLoggedIn = false;
        views.standardView(thiz.model, thiz);
    };

    this.eventDeleteUser = function(deleteThisUser) {
        if (confirm('Delete user "' + deleteThisUser + '" and all their campaigns?')) {
            adminDeleteUser(thiz.model.adminUsername, thiz.model.adminPassword, 
                                deleteThisUser, function(err) {
                if (err) {
                    alert(JSON.stringify(err));
                } else {
                    thiz.model.campaign = null;
                    findCampaignsMetadata({}, function(err, campsMeta) {
                        if (err) {
                            alert(JSON>stringify(err));
                            thiz.standardView(thiz.model, thiz);
                        } else {
                            model.campaignList = campsMeta;
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
        }
    };


    // Called when user clicks a campaign in the campaign list.
    this.selectCampaign = function(campMeta) {
        loadCampaign(campMeta.username, campMeta.campaignId, function(err, camp) {
            if (err) {
                alert(JSON.stringify(err));
            } else {
                thiz.model.campaign = camp;
                views.standardView(model, thiz);
            }
        });
    };
    
    this.eventCampaignDelete = function() {
        if (confirm('Delete this campaign?')) {
            adminDeleteCampaign(thiz.model.adminUsername, thiz.model.adminPassword, 
                                thiz.model.campaign.username, thiz.model.campaign.campaignId, function(err) {
                if (err) {
                    alert(JSON.stringify(err));
                } else {
                	thiz.model.campaign = null;
                    findCampaignsMetadata({}, function(err, campsMeta) {
                	    if (err) {
                            alert(JSON>stringify(err));
                	        thiz.standardView(thiz.model, thiz);
                        } else {
                    	    thiz.model.campaignList = campsMeta;
                            listUsers(function(err, userList){
                                if (err) {
                                    alert(JSON.stringify(err));
                                } else {
                                    thiz.model.userList = userList;
                                }
                            });
                	        thiz.views.standardView(thiz.model, thiz);
                        }
                    });
                }
            });
        }
    };

    this.eventPW = function(userName) {
        adminGetUser(thiz.model.adminUsername, thiz.model.adminPassword, userName, function(err, userObj) {
            if (err) {
                alert(JSON.stringify(err));
            } else {
                var newPw = prompt('Pw is ' + userObj.password);
                if (newPw) {
                    userObj.password = newPw;
                    adminWriteUser(thiz.model.adminUsername, thiz.model.adminPassword, userObj, function(err) {
                        alert('weeee'+JSON.stringify(err));
                    });
                }
            }
        });
    }

    
    //Wire events from the static html

    $("#user-login-button").on('click', this.eventUserLogin); 
	$("#user-password").on('keyup', function(e) {
	    if (e.keyCode === 13) {//return key
	        thiz.eventUserLogin();
	    }
	});
    $("#user-logout-button").on('click', this.eventUserLogout);
	$("#campaign-delete").on('click', this.eventCampaignDelete);

	//Events from dynamically generated HTML:
    //  Clicking a campaign in the CamplaignList calls controller.selectCampaign(campMeta);
    //  Clicking [Delete] on a user deletes the user. (User's campaigns are deleted on the server side)
}